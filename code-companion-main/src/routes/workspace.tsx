import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Terminal as TerminalIcon, 
  Code2, 
  Eye, 
  Send, 
  Plus, 
  FileCode, 
  Folder, 
  RotateCcw,
  ExternalLink,
  Github,
  Search,
  Settings,
  User,
  Maximize2,
  Save,
  CheckCircle2,
  Activity,
  Cpu,
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import logo from "@/assets/octoclaw-logo.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/workspace")({
  component: Workspace,
});

interface FileItem {
  name: string;
  content: string;
}

function Workspace() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "System online. I'm Octoclaw, your autonomous engineering agent. What are we building?" }
  ]);
  const [activeFile, setActiveFile] = useState("App.tsx");
  const [files, setFiles] = useState<FileItem[]>([
    { name: "App.tsx", content: "// Main container\nexport default function App() { return <div>Hello Octoclaw</div> }" },
  ]);
  const [status, setStatus] = useState("idle");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [agentStep, setAgentStep] = useState<string>("Ready");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws");
    
    socket.onopen = () => {
      console.log("Connected to backend");
      setWs(socket);
      toast.success("Octoclaw Kernel Connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case "thought":
          setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
          setAgentStep("Reasoning");
          break;
        case "status":
          setStatus(data.content);
          setAgentStep(data.content);
          break;
        case "terminal":
          setTerminalLogs(prev => [...prev, data.content]);
          break;
        case "file_change":
          if (data.content && data.content.file) {
            setFiles(prev => {
              const existing = prev.find(f => f.name === data.content.file);
              if (existing) {
                return prev.map(f => f.name === data.content.file ? { ...f, content: data.content.content } : f);
              }
              return [...prev, { name: data.content.file, content: data.content.content }];
            });
            setActiveFile(data.content.file);
            setAgentStep("Coding");
          }
          break;
        case "preview_ready":
          setPreviewUrl(data.content.url);
          setStatus("Running");
          setAgentStep("Preview Live");
          toast.success("Application is live");
          break;
      }
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  const handleSend = () => {
    if (!prompt.trim() || !ws) return;
    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    
    ws.send(JSON.stringify({ 
      type: "prompt", 
      content: prompt,
      files: files.map(f => ({ name: f.name, content: f.content }))
    }));
    
    setPrompt("");
    setStatus("Thinking...");
    setAgentStep("Planning");
  };

  const activeFileContent = files.find(f => f.name === activeFile)?.content || "";

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setFiles(prev => prev.map(f => f.name === activeFile ? { ...f, content: value } : f));
  };

  const saveFile = () => {
    if (!ws || !activeFile) return;
    const content = files.find(f => f.name === activeFile)?.content;
    if (content === undefined) return;
    
    ws.send(JSON.stringify({ 
      type: "prompt", 
      content: `Please save the following content to ${activeFile}:\n\n${content}` 
    }));
    toast.info(`Syncing ${activeFile} with backend...`);
  };

  return (
    <div className="flex h-screen flex-col bg-[#020202] text-white selection:bg-primary/40 overflow-hidden font-sans">
      {/* Premium Header */}
      <header className="flex h-12 items-center justify-between border-b border-white/5 bg-[#080808]/90 px-4 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer no-underline text-inherit">
            <img src={logo} alt="Octoclaw AI logo" className="h-8 w-8 drop-shadow-[0_0_12px_oklch(0.72_0.18_295_/_0.6)] transition-all group-hover:scale-110" />
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight uppercase">octoclaw.ai</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-mono">Autonomous Node</span>
            </div>
          </Link>
          
          <Separator orientation="vertical" className="h-4 bg-white/10" />
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                <div className={`h-1.5 w-1.5 rounded-full ${status === 'Running' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'} animate-pulse`} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{agentStep}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5">
            <Github className="h-4 w-4" />
          </Button>
          <Button className="h-7 gap-2 rounded-md bg-primary hover:bg-primary/90 text-[10px] font-bold px-3 shadow-glow transition-all active:scale-95 uppercase tracking-wider">
            <Plus className="h-3 w-3" />
            Deploy
          </Button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={15} minSize={10} maxSize={25} className="bg-[#050505]">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Folder className="h-3 w-3 text-blue-400" />
                  Explorer
                </span>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                   <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-muted-foreground/80 font-medium">
                    <ChevronRight className="h-3 w-3" />
                    <Folder className="h-3.5 w-3.5 text-amber-400/80" />
                    workspace
                  </div>
                  <div className="ml-4 pl-3 border-l border-white/5 space-y-0.5">
                    {files.map(file => (
                      <div 
                        key={file.name}
                        onClick={() => setActiveFile(file.name)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] rounded-md transition-all cursor-pointer group ${
                          activeFile === file.name 
                            ? "bg-primary/10 text-primary-foreground font-medium border border-primary/20" 
                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <FileCode className={`h-3.5 w-3.5 ${activeFile === file.name ? "text-primary" : "text-muted-foreground/50"}`} />
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-[1px] bg-white/5 hover:bg-primary/50" />

          <ResizablePanel defaultSize={55} className="flex flex-col bg-[#0a0a0a]">
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={60} className="flex flex-col min-h-[100px]">
                <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d0d] border-b border-white/5">
                  <div className="flex items-center gap-4">
                    {files.map(file => (
                      <div 
                        key={file.name}
                        onClick={() => setActiveFile(file.name)}
                        className={`flex items-center gap-2 text-[10px] font-medium cursor-pointer transition-all border-b-2 py-1 ${
                          activeFile === file.name ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-white"
                        }`}
                      >
                        {file.name.split('/').pop()}
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="icon" onClick={saveFile} className="h-6 w-6 text-muted-foreground hover:text-primary">
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <div className="flex-1 bg-[#020202]">
                  <Editor
                    height="100%"
                    defaultLanguage="typescript"
                    path={activeFile}
                    theme="vs-dark"
                    value={activeFileContent}
                    onChange={handleEditorChange}
                    options={{
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                      minimap: { enabled: false },
                      automaticLayout: true,
                      padding: { top: 16 },
                      smoothScrolling: true,
                    }}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle className="h-[1px] bg-white/5 hover:bg-primary/50" />

              <ResizablePanel defaultSize={40} className="flex flex-col bg-[#050505]">
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                    <TerminalIcon className="h-3.5 w-3.5 text-green-500" />
                    Terminal Output
                  </div>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground" onClick={() => setTerminalLogs([])}>
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 px-4 py-3 font-mono text-[11px]">
                  <div className="space-y-0.5">
                    {terminalLogs.map((log, i) => (
                      <div key={i} className={`flex gap-3 ${log.startsWith('$') ? 'text-blue-400 mt-2' : 'text-emerald-400/80'}`}>
                        <span className="opacity-30 select-none">{i + 1}</span>
                        <span className="break-all">{log}</span>
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>
                </ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle className="w-[1px] bg-white/5 hover:bg-primary/50" />

          <ResizablePanel defaultSize={30} className="flex flex-col bg-[#080808]">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
              <div className="px-4 pt-2 border-b border-white/5">
                <TabsList className="grid w-full grid-cols-2 bg-white/5 h-8 p-1">
                  <TabsTrigger value="chat" className="text-[10px] uppercase font-bold">Agent</TabsTrigger>
                  <TabsTrigger value="preview" className="text-[10px] uppercase font-bold">Preview</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-6">
                    {messages.map((msg, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-muted-foreground">
                          {msg.role === 'assistant' ? 'Octoclaw' : 'You'}
                        </div>
                        <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-[13px] ${
                          msg.role === 'user' ? 'bg-primary text-white' : 'bg-white/[0.03] border border-white/10 text-muted-foreground'
                        }`}>
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 bg-white/[0.02] border-t border-white/5">
                  <div className="relative flex flex-col gap-2 bg-[#121212] rounded-2xl p-2 border border-white/10">
                    <textarea 
                      rows={2}
                      placeholder="Ask Octoclaw..." 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      className="w-full resize-none border-0 bg-transparent p-2 text-sm focus:ring-0 placeholder:text-muted-foreground/30 text-white"
                    />
                    <div className="flex justify-end px-2 pb-1">
                      <Button size="icon" onClick={handleSend} disabled={!prompt.trim()} className="h-8 w-8 rounded-xl bg-primary shadow-glow">
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 m-0 bg-white relative">
                 <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 px-3 py-1.5 rounded-full bg-black/80 border border-white/10 shadow-2xl">
                    <span className="text-[10px] font-mono text-white/80">localhost:5173</span>
                    <div className="flex gap-2">
                       <RotateCcw className="h-3 w-3 text-white/60 hover:text-white cursor-pointer" onClick={() => setPreviewUrl(prev => prev ? `${prev}?t=${Date.now()}` : null)} />
                       <ExternalLink className="h-3 w-3 text-white/60 hover:text-white cursor-pointer" onClick={() => window.open(previewUrl || '', '_blank')} />
                    </div>
                 </div>
                 {previewUrl ? (
                    <iframe src={previewUrl} className="w-full h-full border-0" />
                 ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#050505]">
                       <div className="text-center space-y-4">
                          <Activity className="h-12 w-12 text-primary mx-auto animate-pulse" />
                          <p className="text-xs text-muted-foreground">Initializing Environment...</p>
                       </div>
                    </div>
                 )}
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <footer className="flex h-7 items-center justify-between bg-[#050505] px-4 text-[9px] font-mono text-muted-foreground border-t border-white/5 uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-3 w-3" />
            <span>Kernel Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Memory: 4.2GB</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-primary font-bold">124ms</span>
        </div>
      </footer>
    </div>
  );
}
