import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, EmptyCard } from "@/components/PageScaffold";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lucky MeeSeva Office Management" },
      { name: "description", content: "Command center for customers, applications, collections, expenses and targets at Lucky MeeSeva." },
      { property: "og:title", content: "Dashboard — Lucky MeeSeva Office Management" },
      { property: "og:description", content: "Command center for customers, applications, collections, expenses and targets." },
    ],
  }),
  component: Dashboard,
});

const RANGES = ["Today", "Yesterday", "Last 7 days", "This month", "Previous month", "Custom"];
const GROUPS: { title: string; items: string[] }[] = [
  { title: "Customers & work", items: ["Total customers", "New today", "Total applications", "Pending", "In progress", "Completed", "Rejected / returned", "Awaiting documents"] },
  { title: "Money today", items: ["Cash collected", "Service revenue earned", "Operating expenses", "Net operating profit", "Outstanding balances", "Third-party fees held"] },
];

function Dashboard() {
  const [range, setRange] = useState("Today");
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Admin Dashboard"
        description="Every number here is calculated from real office records."
        actions={
          <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${r === range ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{r}</button>
            ))}
          </div>
        }
      />
      {GROUPS.map((g) => (
        <section key={g.title} className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.title}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {g.items.map((m) => (
              <div key={m} className="rounded-xl border bg-card p-4 shadow-card">
                <div className="text-xs text-muted-foreground">{m}</div>
                <div className="mt-2 font-display text-2xl font-bold text-muted-foreground/50">—</div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="grid gap-4 lg:grid-cols-2">
        <EmptyCard title="Revenue target vs actual" />
        <EmptyCard title="Completions target vs actual" />
        <EmptyCard title="Monthly income & profit trend" />
        <EmptyCard title="Urgent & overdue applications" />
      </div>
    </div>
  );
}
