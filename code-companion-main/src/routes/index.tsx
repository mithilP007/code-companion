import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageSquare,
  Brain,
  LayoutGrid,
  Code2,
  Box,
  Eye,
  Bug,
  Rocket,
  Database,
  ShieldCheck,
  Cpu,
  Workflow,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthGate } from "@/components/AuthGate";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/octoclaw-logo.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Anatomy of an AI Coding Platform — How Lovable-style Systems Work" },
      {
        name: "description",
        content:
          "A visual deep-dive into how AI coding platforms turn a prompt into a deployed app — agents, sandboxes, and the full pipeline.",
      },
      { property: "og:title", content: "Anatomy of an AI Coding Platform" },
      {
        property: "og:description",
        content: "Prompt → Plan → Code → Sandbox → Preview → Deploy. Visualized.",
      },
    ],
  }),
});

const steps = [
  { icon: MessageSquare, title: "Prompt", desc: "User describes the app in plain language." },
  { icon: Brain, title: "Understand", desc: "AI parses intent, features, and constraints." },
  { icon: LayoutGrid, title: "Plan", desc: "Planner agent designs pages, APIs, schema." },
  { icon: Code2, title: "Generate", desc: "Coding agent writes frontend & backend files." },
  { icon: Box, title: "Sandbox", desc: "Code runs safely inside an isolated container." },
  { icon: Eye, title: "Preview", desc: "Live preview streams back to the user." },
  { icon: Bug, title: "Debug", desc: "Agent reads logs and self-heals errors." },
  { icon: Rocket, title: "Deploy", desc: "Ship to a public URL in one click." },
];

const agents = [
  { icon: LayoutGrid, name: "Planner", role: "Designs architecture, pages, data model" },
  { icon: Code2, name: "Coder", role: "Generates components, routes, APIs" },
  { icon: Bug, name: "Debugger", role: "Reads errors, patches broken code" },
  { icon: Rocket, name: "Deployer", role: "Builds & publishes to the edge" },
];

const stack = [
  { icon: MessageSquare, label: "Chat UI", sub: "React · Tailwind" },
  { icon: Cpu, label: "AI Models", sub: "GPT · Claude · DeepSeek" },
  { icon: Workflow, label: "Agent Loop", sub: "Plan → Act → Verify" },
  { icon: Box, label: "Sandbox", sub: "Docker · Workers" },
  { icon: Database, label: "Storage", sub: "Postgres · Files" },
  { icon: ShieldCheck, label: "Isolation", sub: "RLS · Sandboxing" },
];

function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <AuthGate />;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Nav */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Octoclaw AI logo" className="h-10 w-10 drop-shadow-[0_0_12px_oklch(0.72_0.18_295_/_0.6)]" />
          <span className="text-lg font-semibold tracking-tight">octoclaw ai</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#flow" className="transition-smooth hover:text-foreground">Flow</a>
          <a href="#agents" className="transition-smooth hover:text-foreground">Agents</a>
          <a href="#stack" className="transition-smooth hover:text-foreground">Stack</a>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm backdrop-blur transition-smooth hover:border-primary hover:shadow-glow"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-glow" />
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
            How AI coding platforms actually work
          </div>
          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            From a sentence to a{" "}
            <span className="text-gradient-primary">deployed app</span>{" "}
            in minutes.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A visual breakdown of the pipeline behind Lovable, Bolt, and Claude-style
            builders — agents, sandboxes, previews, and the loop that ties them together.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <a 
              href="/workspace" 
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-white shadow-glow transition-smooth hover:bg-primary/90 hover:scale-105"
            >
              Start Building Now
            </a>
            <a 
              href="#flow" 
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card/60 px-8 text-sm font-medium backdrop-blur transition-smooth hover:bg-white/5"
            >
              How it works
            </a>
          </div>

          {/* Mock prompt → preview */}

          <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-2">
            <Link to="/workspace" className="rounded-2xl border border-border bg-gradient-card p-5 text-left shadow-elegant backdrop-blur block transition-smooth hover:-translate-y-1 hover:border-primary hover:shadow-glow cursor-pointer">
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-chart-4/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-chart-3/60" />
                </div>
                <span className="ml-auto">prompt.txt</span>
              </div>
              <p className="font-mono text-sm leading-relaxed">
                <span className="text-accent">{">"} </span>
                Build a modern clothing brand site with login, cart, dark mode,
                and a checkout page.
                <span className="animate-cursor" />
              </p>
            </Link>
            <Link to="/workspace" className="relative rounded-2xl border border-border bg-gradient-card p-5 text-left shadow-elegant backdrop-blur block transition-smooth hover:-translate-y-1 hover:border-primary hover:shadow-glow cursor-pointer">
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                live preview
                <span className="ml-auto rounded-full bg-chart-3/20 px-2 py-0.5 text-[10px] text-chart-3">
                  ● running
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-2/3 rounded bg-gradient-primary opacity-80" />
                <div className="h-2 w-full rounded bg-muted" />
                <div className="h-2 w-4/5 rounded bg-muted" />
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="aspect-square rounded-md bg-gradient-primary/30 animate-float" />
                  <div className="aspect-square rounded-md bg-accent/30 animate-float" style={{ animationDelay: "1s" }} />
                  <div className="aspect-square rounded-md bg-chart-3/30 animate-float" style={{ animationDelay: "2s" }} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">The pipeline</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Eight steps. One <span className="text-gradient-primary">autonomous loop</span>.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-6 transition-smooth hover:-translate-y-1 hover:border-primary hover:shadow-glow"
            >
              <div className="absolute right-4 top-4 font-mono text-xs text-muted-foreground">
                0{i + 1}
              </div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary/15 text-primary transition-smooth group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="relative">
        <div className="absolute inset-x-0 top-1/2 h-[400px] -translate-y-1/2 bg-gradient-glow opacity-60" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 grid items-end gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-accent">The team</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                Specialized AI agents,
                <br />
                working in concert.
              </h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Each agent owns one job — like a real engineering team, but the project
              manager, coder, QA, and DevOps are all language models.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {agents.map((a) => (
              <div
                key={a.name}
                className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition-smooth hover:-translate-y-1 hover:border-accent hover:shadow-elegant"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{a.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.role}</p>
                <div className="mt-5 h-px bg-gradient-to-r from-accent/40 to-transparent" />
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  agent.{a.name.toLowerCase()}()
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Under the hood</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            The <span className="text-gradient-primary">stack</span> that makes it possible.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stack.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-card p-5 transition-smooth hover:-translate-y-1 hover:border-primary group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-smooth">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{s.label}</p>
                <p className="text-sm text-muted-foreground">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Closing */}
        <div className="mt-24 overflow-hidden rounded-3xl border border-border bg-gradient-card p-12 text-center shadow-elegant md:p-16">
          <h3 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            Chat + VS Code + Docker + Vercel —
            <br />
            <span className="text-gradient-primary">fused into one intelligent loop.</span>
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            The real magic isn't the UI. It's AI + Sandbox + Automation working
            together to build, run, and ship software autonomously.
          </p>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Built to explain how AI coding platforms work · 2026
      </footer>
    </div>
  );
}
