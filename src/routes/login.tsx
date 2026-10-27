import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Lucky MeeSeva" },
      { name: "description", content: "Secure staff sign-in for the Lucky MeeSeva office." },
      { property: "og:title", content: "Sign in — Lucky MeeSeva" },
      { property: "og:description", content: "Secure staff sign-in for the Lucky MeeSeva office." },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <div className="grid min-h-screen place-items-center bg-hero p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">L</div>
          <div>
            <div className="font-display text-lg font-bold">Lucky MeeSeva</div>
            <div className="text-xs text-muted-foreground">Office Management System</div>
          </div>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <label className="block text-sm font-medium">Email<input type="email" className="mt-1 h-10 w-full rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring" /></label>
          <label className="block text-sm font-medium">Password<input type="password" className="mt-1 h-10 w-full rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring" /></label>
          <button disabled className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground opacity-60">Sign in (coming in next phase)</button>
        </form>
        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent" /> Private business software. Not a government website.</p>
      </div>
    </div>
  );
}
