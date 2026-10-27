import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import type { AppRole } from "@/lib/nav";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("full_name, phone, avatar_url").eq("id", data.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", data.user.id),
    ]);
    const list = (roles ?? []).map((r) => r.role as AppRole);
    const role: AppRole = list.includes("admin") ? "admin" : list.includes("manager") ? "manager" : "staff";
    let avatar: string | null = null;
    if (profile?.avatar_url) {
      const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(profile.avatar_url, 3600);
      avatar = signed?.signedUrl ?? null;
    }
    return { me: { id: data.user.id, email: data.user.email ?? "", name: profile?.full_name ?? "", phone: profile?.phone ?? "", avatarPath: profile?.avatar_url ?? null, avatar, role } };
  },
  component: Layout,
});

function Layout() {
  const { me } = Route.useRouteContext();
  return <AppShell me={me}><Outlet /></AppShell>;
}
