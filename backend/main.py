import os
import json
import asyncio
import subprocess
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from typing import List, Dict

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKSPACE_DIR = Path("workspace").resolve()
WORKSPACE_DIR.mkdir(exist_ok=True)

# Mount workspace for static preview
app.mount("/preview", StaticFiles(directory=WORKSPACE_DIR), name="preview")
WORKSPACE_DIR.mkdir(exist_ok=True)

# Initialize Groq LLM via OpenAI compatibility
llm = ChatOpenAI(
    openai_api_key=os.getenv("GROQ_API_KEY"),
    openai_api_base="https://api.groq.com/openai/v1",
    model_name="llama-3.3-70b-versatile"
)

SYSTEM_PROMPT = """
You are Octoclaw, a world-class autonomous AI software engineer. 
Your goal is to build, run, and debug professional full-stack applications.

You output a JSON array of action objects.

Each action must have a 'type' and 'content'.

Types:
- 'thought': Your internal reasoning, plan, or architectural decisions.
- 'file': Create or update a file. Content: {"path": "relative/path.ts", "content": "source code"}.
- 'delete': Delete a file or directory. Content: {"path": "relative/path.ts"}.
- 'cmd': A terminal command to run.
- 'status': A short status update for the user (e.g. "Installing dependencies...").

Rules:
1. ALWAYS start with a 'thought' action explaining your plan.
2. For React apps, use Vite + Tailwind CSS.
3. Be professional. Organize files logically.
4. If a command fails (you'll see the error in your history if the user tells you), ANALYZE the error and fix it in the next step.
5. When you finish setup, run 'npm run dev' to start the preview.
6. Use 'cd' commands to manage your working directory.
7. Output ONLY a valid JSON array. No markdown, no conversational text outside the array.

Example:
[
  {"type": "thought", "content": "I need to create the main React component."},
  {"type": "file", "content": {"path": "App.tsx", "content": "..."}},
  {"type": "cmd", "content": "npm run dev"}
]
"""

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "prompt":
                prompt = message["content"]
                files = message.get("files", [])
                await handle_prompt_real(websocket, prompt, files)
                
    except WebSocketDisconnect:
        print("Client disconnected")

async def handle_prompt_real(websocket: WebSocket, prompt: str, files: list):
    await send_message(websocket, "status", "Octoclaw is thinking...")
    
    file_context = "Current Files in Workspace:\n"
    if files:
        for f in files:
            file_context += f"--- {f['name']} ---\n{f['content']}\n\n"
    else:
        file_context += "Workspace is empty.\n"
        
    dynamic_system_prompt = SYSTEM_PROMPT + "\n\n" + file_context
    
    messages = [
        SystemMessage(content=dynamic_system_prompt),
        HumanMessage(content=prompt)
    ]
    
    current_cwd = WORKSPACE_DIR
    
    try:
        response = llm.invoke(messages)
        content = response.content
        
        # Robust JSON extraction
        cleaned_content = content.replace("```json", "").replace("```", "").strip()
        
        actions = []
        if cleaned_content.startswith("[") and cleaned_content.endswith("]"):
            try:
                actions = json.loads(cleaned_content)
            except Exception as e:
                await send_message(websocket, "thought", f"Failed to parse array: {str(e)}")
        else:
            # Brace-counting fallback for partial or malformed array wrappers
            current_json_str = ""
            open_braces = 0
            in_string = False
            escape_next = False
            for char in cleaned_content:
                if open_braces > 0 or char == '{':
                    current_json_str += char
                    if escape_next:
                        escape_next = False
                        continue
                    if char == '\\':
                        escape_next = True
                        continue
                    if char == '"':
                        in_string = not in_string
                    if not in_string:
                        if char == '{':
                            open_braces += 1
                        elif char == '}':
                            open_braces -= 1
                            if open_braces == 0:
                                try:
                                    actions.append(json.loads(current_json_str))
                                except:
                                    pass
                                current_json_str = ""
        
        for action in actions:
            if "type" not in action: continue
            try:
                if action["type"] == "thought":
                    await send_message(websocket, "thought", action["content"])
                elif action["type"] == "status":
                    await send_message(websocket, "status", action["content"])
                elif action["type"] == "file":
                    file_data = action["content"]
                    await write_file(websocket, file_data["path"], file_data["content"], current_cwd)
                elif action["type"] == "delete":
                    await delete_path(websocket, action["content"]["path"], current_cwd)
                elif action["type"] == "cmd":
                    cmd_text = action["content"]
                    # Special handling for 'cd'
                    if cmd_text.startswith("cd "):
                        new_dir = cmd_text[3:].strip()
                        potential_cwd = (current_cwd / new_dir).resolve()
                        
                        # Security check: must be inside WORKSPACE_DIR
                        if str(potential_cwd).startswith(str(WORKSPACE_DIR)):
                            if not potential_cwd.exists():
                                potential_cwd.mkdir(parents=True, exist_ok=True)
                                await send_message(websocket, "terminal", f"Created directory: {new_dir}")
                            current_cwd = potential_cwd
                            await send_message(websocket, "terminal", f"Changed directory to: {current_cwd.relative_to(WORKSPACE_DIR)}")
                        else:
                            await send_message(websocket, "terminal", "Error: Cannot navigate outside workspace")
                    else:
                        await execute_command(websocket, cmd_text, current_cwd)
                
                await asyncio.sleep(0.1)
            except Exception as e:
                await send_message(websocket, "thought", f"Action error: {str(e)}")
        
        await send_message(websocket, "status", "Mission Accomplished")
        
    except Exception as e:
        await send_message(websocket, "thought", f"Critical Error: {str(e)}")

async def delete_path(websocket: WebSocket, relative_path: str, current_cwd: Path):
    full_path = (current_cwd / relative_path).resolve()
    if not str(full_path).startswith(str(WORKSPACE_DIR)):
        await send_message(websocket, "terminal", f"Error: Cannot delete outside workspace: {relative_path}")
        return
        
    if full_path.exists():
        if full_path.is_dir():
            import shutil
            shutil.rmtree(full_path)
            await send_message(websocket, "terminal", f"Deleted directory: {relative_path}")
        else:
            full_path.unlink()
            await send_message(websocket, "terminal", f"Deleted file: {relative_path}")
        # Notify frontend (this would need an 'explorer_refresh' or similar, 
        # but for now we'll just send an empty file change to signal a refresh or just rely on the next file write)
    else:
        await send_message(websocket, "terminal", f"Error: Path does not exist: {relative_path}")

async def write_file(websocket: WebSocket, relative_path: str, content: str, current_cwd: Path):
    full_path = (current_cwd / relative_path).resolve()
    # Security check
    if not str(full_path).startswith(str(WORKSPACE_DIR)):
        await send_message(websocket, "terminal", f"Error: Cannot write outside workspace: {relative_path}")
        return
        
    full_path.parent.mkdir(parents=True, exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    # Send path relative to WORKSPACE_DIR for the frontend explorer
    display_path = str(full_path.relative_to(WORKSPACE_DIR))
    await send_message(websocket, "file_change", {"file": display_path, "content": content})
    await send_message(websocket, "terminal", f"File Sync: {display_path}")

    # Auto-trigger static preview for HTML files
    if full_path.suffix == ".html":
        # Ensure path format is correct for URL
        preview_path = display_path.replace("\\", "/")
        await send_message(websocket, "preview_ready", {"url": f"http://localhost:8000/preview/{preview_path}"})

async def execute_command(websocket: WebSocket, command: str, current_cwd: Path):
    rel_cwd = current_cwd.relative_to(WORKSPACE_DIR)
    display_cwd = f"./{rel_cwd}" if str(rel_cwd) != "." else "./"
    await send_message(websocket, "terminal", f"$ {command} (in {display_cwd})")
    
    is_dev_server = any(x in command for x in ["npm run dev", "vite", "npm start"])
    
    try:
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=current_cwd
        )

        import re
        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

        async def stream_output(stream):
            while True:
                line = await stream.readline()
                if not line: break
                output = line.decode().strip()
                if output:
                    await send_message(websocket, "terminal", output)
                
                clean_output = ansi_escape.sub('', output)
                if "localhost:" in clean_output and ("5173" in clean_output or "3000" in clean_output or "Local" in clean_output):
                    # Extract port if possible, default to 5173
                    port = "5173"
                    if "3000" in clean_output: port = "3000"
                    
                    await send_message(websocket, "preview_ready", {"url": f"http://localhost:{port}"})

        if is_dev_server:
            asyncio.create_task(stream_output(process.stdout))
            asyncio.create_task(stream_output(process.stderr))
            await asyncio.sleep(2)
        else:
            await asyncio.gather(
                stream_output(process.stdout),
                stream_output(process.stderr)
            )
            return_code = await process.wait()
            if return_code != 0:
                await send_message(websocket, "terminal", f"Command failed with exit code {return_code}")
            
    except Exception as e:
        await send_message(websocket, "terminal", f"Execution error: {str(e)}")

async def send_message(websocket: WebSocket, type: str, content: any):
    await websocket.send_text(json.dumps({
        "type": type,
        "content": content
    }))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
