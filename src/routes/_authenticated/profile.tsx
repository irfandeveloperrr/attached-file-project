import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageScaffold";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My profile — Lucky MeeSeva" },
      { name: "description", content: "Your name, mobile number and photo." },
      { property: "og:title", content: "My profile — Lucky MeeSeva" },
      { property: "og:description", content: "Your name, mobile number and photo." },
    ],
  }),
  component: Profile,
});

const input = "mt-1 h-10 w-full rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring";

function Profile() {
  const { me } = Route.useRouteContext();
  const router = useRouter();
  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !/^[0-9+ ]{10,15}$/.test(phone.trim())) return toast.error("Enter your name and a valid mobile number.");
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ full_name: name.trim(), phone: phone.trim(), updated_at: new Date().toISOString() }).eq("id", me.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    router.invalidate();
  }

  async function upload(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("Use a JPG, PNG or WEBP photo.");
    if (file.size > 2 * 1024 * 1024) return toast.error("Photo must be under 2 MB.");
    const path = `${me.id}/${crypto.randomUUID()}.${file.type.split("/")[1]}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) return toast.error(error.message);
    await supabase.from("profiles").update({ avatar_url: path }).eq("id", me.id);
    toast.success("Photo updated");
    router.invalidate();
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="My profile" description={`${me.email} · ${me.role[0].toUpperCase()}${me.role.slice(1)}`} />
      <div className="space-y-6 rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-4">
          {me.avatar ? <img src={me.avatar} alt="" className="h-20 w-20 rounded-full object-cover" /> : <div className="grid h-20 w-20 place-items-center rounded-full bg-accent font-display text-2xl text-accent-foreground">{(me.name || me.email)[0]?.toUpperCase()}</div>}
          <label className="cursor-pointer rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
            Change photo
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        </div>
        <form onSubmit={save} className="space-y-4">
          <label className="block text-sm font-medium">Full name<input value={name} onChange={(e) => setName(e.target.value)} className={input} /></label>
          <label className="block text-sm font-medium">Mobile number<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} /></label>
          <button disabled={busy} className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">Save</button>
        </form>
      </div>
    </div>
  );
}
