import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password — Lucky MeeSeva" },
      { name: "description", content: "Choose a new password for your Lucky MeeSeva account." },
      { property: "og:title", content: "Set new password — Lucky MeeSeva" },
      { property: "og:description", content: "Choose a new password for your Lucky MeeSeva account." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/" });
  }
  return (
    <div className="grid min-h-screen place-items-center bg-hero p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-8 shadow-card">
        <h1 className="font-display text-lg font-bold">Set a new password</h1>
        <input required minLength={8} type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
        <button className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">Save password</button>
      </form>
    </div>
  );
}
