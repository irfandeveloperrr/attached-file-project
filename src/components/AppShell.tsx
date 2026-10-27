import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, type ReactNode } from "react";
import { Bell, LogOut, Menu, Plus, Search, PanelLeftClose, PanelLeft } from "lucide-react";
import { navFor, type AppRole } from "@/lib/nav";

export type Me = { id: string; email: string; name: string; phone: string; avatar: string | null; role: AppRole };

export function AppShell({ children, me }: { children: ReactNode; me: Me }) {
  const NAV = navFor(me.role);
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const groups = [...new Set(NAV.map((n) => n.group))];

  const sidebar = (
    <nav className="flex h-full flex-col gap-4 overflow-y-auto p-3">
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary font-display text-lg font-bold text-sidebar-primary-foreground">L</div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="font-display font-bold">Lucky MeeSeva</div>
            <div className="text-xs text-sidebar-foreground/60">Office Management</div>
          </div>
        )}
      </div>
      {groups.map((g) => (
        <div key={g}>
          {!collapsed && <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">{g}</div>}
          {NAV.filter((n) => n.group === g).map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.key}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                title={n.label}
                className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"}`}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{n.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:block ${collapsed ? "w-16" : "w-64"} transition-[width]`}>
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur">
          <button aria-label="Open menu" className="rounded-md p-2 hover:bg-muted md:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <button aria-label="Toggle sidebar" className="hidden rounded-md p-2 hover:bg-muted md:block" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search customer, phone, application no…" className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/customers" className="hidden items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:inline-flex"><Plus className="h-4 w-4" /> New customer</Link>
            <Link to="/notifications" aria-label="Notifications" className="rounded-md p-2 hover:bg-muted"><Bell className="h-5 w-5" /></Link>
            <Link to="/profile" title={me.name || me.email} className="flex items-center gap-2 rounded-full pr-2 hover:bg-muted">
              {me.avatar ? <img src={me.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">{(me.name || me.email)[0]?.toUpperCase()}</span>}
              <span className="hidden text-left leading-tight lg:block"><span className="block text-sm font-medium">{me.name || me.email}</span><span className="block text-xs capitalize text-muted-foreground">{me.role}</span></span>
            </Link>
            <button aria-label="Sign out" title="Sign out" onClick={signOut} className="rounded-md p-2 hover:bg-muted"><LogOut className="h-5 w-5" /></button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
