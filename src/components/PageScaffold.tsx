import type { ReactNode } from "react";
import { Database } from "lucide-react";
import { navByKey } from "@/lib/nav";

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}

export function EmptyCard({ title, note = "No records yet. Data appears here once the database is connected." }: { title: string; note?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <h2 className="font-display font-semibold">{title}</h2>
      <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        <Database className="h-5 w-5" />
        {note}
      </div>
    </div>
  );
}

export function PageScaffold({ navKey, children }: { navKey: string; children?: ReactNode }) {
  const n = navByKey(navKey);
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={n.label} description={n.description} />
      {children}
      <div className="grid gap-4 lg:grid-cols-2">
        {n.sections.map((s) => <EmptyCard key={s} title={s} />)}
      </div>
    </div>
  );
}
