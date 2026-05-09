import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import logo from "@/assets/octoclaw-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

type Mode = "signin" | "signup";

export function AuthGate() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          console.error("Signup error:", error);
          throw error;
        }
        if (data.user && data.session) {
          toast.success("Account created and signed in!");
        } else {
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error("Signin error:", error);
          throw error;
        }
      }
    } catch (err) {
      console.error("Auth error catch:", err);
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please check your Supabase dashboard settings (Email Auth might be disabled or domain restricted).");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) {
        if (error.message.includes("missing OAuth secret") || error.message.includes("Unsupported provider")) {
          toast.error("Google Auth needs to be enabled in your Supabase Dashboard! Go to Authentication -> Providers -> Google and add your Client ID/Secret.", { duration: 8000 });
        } else {
          toast.error(error.message ?? "Google sign-in failed");
        }
        setGoogleLoading(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-glow" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src={logo}
            alt="Octoclaw logo"
            className="mx-auto mb-5 h-20 w-20 drop-shadow-[0_0_24px_oklch(0.72_0.18_295_/_0.7)]"
          />
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to <span className="text-gradient-primary">octoclaw</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue" : "Create an account to continue"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-elegant backdrop-blur">
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-smooth hover:border-primary hover:shadow-glow disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-input/60 px-3 py-2.5 text-sm outline-none transition-smooth focus:border-primary focus:shadow-glow"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-input/60 px-3 py-2.5 text-sm outline-none transition-smooth focus:border-primary focus:shadow-glow"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-primary transition-smooth hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
             <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Development</p>
             <button
                onClick={async () => {
                  toast.info("Entering demo mode...");
                  window.location.href = "/workspace";
                }}
                className="text-xs font-medium text-primary/60 hover:text-primary transition-smooth"
              >
                Skip to Workspace →
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
