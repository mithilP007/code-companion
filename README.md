
## ✨ Features

- 🚀 **Multi-Language Support** — Write and execute code in Python, JavaScript, Java, C++, Go, Rust, and more
- 🤖 **AI Code Assistant** — Get intelligent suggestions, error explanations, and code optimization powered by LLMs
- 🔄 **Real-Time Collaboration** — Live pair programming with WebSocket-based cursor tracking and simultaneous editing
- 🐳 **Secure Sandboxed Execution** — Docker-isolated runtime environments with resource limits and timeout protection
- 🎨 **Professional Code Editor** — Monaco Editor (VS Code in the browser) with IntelliSense, linting, and themes
- 💾 **Cloud Project Storage** — Save, organize, and share your coding projects with persistent cloud storage
- 🌙 **Dark & Light Themes** — Customizable UI themes for comfortable coding day or night
- 📱 **Responsive Design** — Works seamlessly on desktop, tablet, and mobile devices
- ⌨️ **Custom Keybindings** — Vim, Emacs, and VS Code keybinding support
- 📤 **Import/Export** — Drag-and-drop file upload and download your projects as ZIP

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Monaco Editor** | Code Editor Core |
| **Tailwind CSS** | Styling |
| **Socket.io Client** | Real-time Collaboration |
| **Zustand** | State Management |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js / Express** | API Server |
| **Socket.io** | WebSocket Communication |
| **Docker Engine API** | Code Execution Sandboxing |
| **Redis** | Session & Caching Layer |
| **MongoDB / PostgreSQL** | Project & User Data |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker & Docker Compose** | Containerization |
| **Nginx** | Reverse Proxy & Load Balancing |
| **GitHub Actions** | CI/CD Pipeline |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **Docker** & **Docker Compose**
- **Git**


# NeuralForge

&gt; **AI Software Architect that runs entirely on your machine.**
&gt; Describe any app in plain English. NeuralForge generates the full codebase — frontend, backend, database, and UI — with a live preview, inline editor, and one-click export to ZIP or GitHub.

## Build Phases

| Phase | What It Covers | Key Deliverables |
|-------|----------------|------------------|
| **0** | Repo & Dev Environment | Git setup, MIT license, Ollama install, model pulls, `.gitignore`, `CONTRIBUTING.md` |
| **1** | Backend Foundation | FastAPI server, SQLite schema (`projects` + `files` tables), Ollama client wrapper, CORS |
| **2** | WebSocket Engine | Real-time generation stream (`/ws/generate`), edit stream (`/ws/edit`), connection manager |
| **3** | AI Agent System | Architect Agent (JSON planner), Frontend Agent (React code), Backend Agent (FastAPI code), Orchestrator (parallel execution), Context Engine |
| **4** | Frontend IDE | React trio-layout (Chat / Monaco Editor / Preview), resizable panels, file tabs, dark theme |
| **5** | File Management & Export | Filesystem writer, ZIP export (client-side), GitHub push integration (PyGithub) |
| **6** | Advanced AI Features | Code review suggestions, smart context for edits, Git version history per project, response caching |
| **7** | Preview & Runtime | Sandpack safe preview, Docker Compose full-stack preview, auto-reload on edit |
| **8** | UI/UX Polish | Tailwind theming, loading states, toasts, keyboard shortcuts (`Ctrl+Enter`, `Ctrl+S`), error boundaries |
| **9** | Testing & QA | `pytest` backend tests, React Testing Library frontend tests, end-to-end flow validation, performance benchmarks |
| **10** | Documentation & Deploy | `README.md` with architecture diagram, API docs, `docker-compose.yml`, GitHub Release tagging |
| **11** | Open Source Readiness | `CODE_OF_CONDUCT.md`, issue labels (`good first issue`), `ROADMAP.md`, security guidelines |


