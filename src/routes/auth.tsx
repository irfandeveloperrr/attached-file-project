import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Lucky MeeSeva" },
      { name: "description", content: "Secure staff sign-in for the Lucky MeeSeva office." },
      { property: "og:title", content: "Sign in — Lucky MeeSeva" },
      { property: "og:description", content: "Secure staff sign-in for the Lucky MeeSeva office." },
    ],
  }),
  component: AuthPage,
});

const input = "mt-1 h-10 w-full rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ email: "", password: "", name: "", phone: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
        if (error) throw error;
        navigate({ to: "/" });
      } else if (mode === "up") {
        if (!f.name.trim() || !/^[0-9+ ]{10,15}$/.test(f.phone.trim())) throw new Error("Enter your name and a valid mobile number.");
        const { error } = await supabase.auth.signUp({
          email: f.email, password: f.password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: f.name.trim(), phone: f.phone.trim() } },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
        setMode("in");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(f.email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Password reset link sent to your email.");
        setMode("in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return void toast.error("Google sign-in failed");
    if (r.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-hero p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">L</div>
          <div>
            <div className="font-display text-lg font-bold">Lucky MeeSeva</div>
            <div className="text-xs text-muted-foreground">{mode === "up" ? "Create staff account" : mode === "forgot" ? "Reset password" : "Office Management System"}</div>
          </div>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          {mode === "up" && (
            <>
              <label className="block text-sm font-medium">Full name<input required value={f.name} onChange={set("name")} className={input} /></label>
              <label className="block text-sm font-medium">Mobile number<input required type="tel" value={f.phone} onChange={set("phone")} className={input} /></label>
            </>
          )}
          <label className="block text-sm font-medium">Email<input required type="email" value={f.email} onChange={set("email")} className={input} /></label>
          {mode !== "forgot" && <label className="block text-sm font-medium">Password<input required minLength={8} type="password" value={f.password} onChange={set("password")} className={input} /></label>}
          <button disabled={busy} className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}
          </button>
        </form>
        {mode !== "forgot" && (
          <button onClick={google} className="mt-3 h-10 w-full rounded-md border text-sm font-medium hover:bg-muted">Continue with Google</button>
        )}
        <div className="mt-4 flex justify-between text-xs">
          <button className="text-accent hover:underline" onClick={() => setMode(mode === "up" ? "in" : "up")}>{mode === "up" ? "Have an account? Sign in" : "New staff? Create account"}</button>
          {mode === "in" && <button className="text-muted-foreground hover:underline" onClick={() => setMode("forgot")}>Forgot password?</button>}
        </div>
        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent" /> Private business software. Not a government website.</p>
      </div>
    </div>
  );
}
