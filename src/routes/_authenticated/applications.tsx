import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageScaffold";
import { STATUSES, btn, btnGhost, field, statusLabel, useMe, useTeam, type AppStatus } from "@/lib/office";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Applications — Lucky MeeSeva" },
      { name: "description", content: "Track every application through its workflow at Lucky MeeSeva." },
      { property: "og:title", content: "Applications — Lucky MeeSeva" },
      { property: "og:description", content: "Track every application through its workflow." },
    ],
  }),
  component: ApplicationsPage,
});

const today = () => new Date().toISOString().slice(0, 10);
const CLOSED: AppStatus[] = ["completed", "rejected", "cancelled"];

function ApplicationsPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<"table" | "board" | "queue">("table");
  const [status, setStatus] = useState("");
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*, customers(full_name, code)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const overdue = apps.filter((a) => a.deadline && a.deadline < today() && !CLOSED.includes(a.status));
  const queue = apps.filter((a) => !CLOSED.includes(a.status) && ((a.deadline && a.deadline <= today()) || (a.follow_up_date && a.follow_up_date <= today())));
  const shown = (view === "queue" ? queue : apps).filter((a) => !status || a.status === status);

  async function move(id: string, s: AppStatus) {
    const { error } = await supabase.from("applications").update({ status: s }).eq("id", id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["applications"] });
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Applications"
        description="Office completion is tracked separately from the official decision."
        actions={
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            {(["table", "board", "queue"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${v === view ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                {v === "table" ? "Table" : v === "board" ? "Kanban" : `Today's queue (${queue.length})`}
              </button>
            ))}
          </div>
        }
      />
      <div className="mb-4"><NewApplication /></div>
      {overdue.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> {overdue.length} application{overdue.length > 1 ? "s are" : " is"} past the deadline.
        </div>
      )}
      {view === "board" ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STATUSES.map((s) => {
            const col = apps.filter((a) => a.status === s.value);
            return (
              <div key={s.value} className="w-64 shrink-0 rounded-xl border bg-muted/40 p-2"
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => move(e.dataTransfer.getData("id"), s.value)}>
                <div className="mb-2 px-1 text-xs font-semibold uppercase text-muted-foreground">{s.label} · {col.length}</div>
                {col.map((a) => (
                  <div key={a.id} draggable onDragStart={(e) => e.dataTransfer.setData("id", a.id)} className="mb-2 cursor-grab rounded-lg border bg-card p-3 text-sm shadow-card">
                    <Link to="/application/$id" params={{ id: a.id }} className="font-medium text-accent hover:underline">{a.service}</Link>
                    <div className="text-xs text-muted-foreground">{a.customers?.full_name}</div>
                    {a.deadline && <div className={`mt-1 text-xs ${overdue.includes(a) ? "text-destructive" : "text-muted-foreground"}`}>Due {a.deadline}</div>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${field} mb-3 mt-0 w-60`}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr><th className="p-3">Service</th><th className="p-3">Customer</th><th className="p-3">Reference</th><th className="p-3">Status</th><th className="p-3">Deadline</th><th className="p-3">Follow-up</th></tr>
              </thead>
              <tbody>
                {shown.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-muted/30">
                    <td className="p-3"><Link to="/application/$id" params={{ id: a.id }} className="font-medium text-accent hover:underline">{a.service}</Link></td>
                    <td className="p-3">{a.customers?.full_name} <span className="text-xs text-muted-foreground">{a.customers?.code}</span></td>
                    <td className="p-3">{a.reference_no || "—"}</td>
                    <td className="p-3">{statusLabel(a.status)}</td>
                    <td className={`p-3 ${overdue.includes(a) ? "font-semibold text-destructive" : ""}`}>{a.deadline ?? "—"}</td>
                    <td className="p-3">{a.follow_up_date ?? "—"}</td>
                  </tr>
                ))}
                {!shown.length && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">{isLoading ? "Loading…" : "No applications here."}</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function NewApplication({ customerId }: { customerId?: string }) {
  const me = useMe();
  const qc = useQueryClient();
  const team = useTeam();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ customer_id: customerId ?? "", service: "", reference_no: "", assigned_to: me.role === "staff" ? me.id : "", deadline: "", follow_up_date: "", required_documents: "", service_fee: "", third_party_fee: "", notes: "" });
  const customers = useQuery({
    queryKey: ["customers-lite"],
    enabled: open && !customerId,
    queryFn: async () => (await supabase.from("customers").select("id, full_name, code").is("archived_at", null).order("full_name")).data ?? [],
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  if (!open) return <button className={btn} onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New application</button>;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("applications").insert({
      customer_id: f.customer_id, service: f.service.trim(), reference_no: f.reference_no || null, assigned_to: f.assigned_to || null,
      deadline: f.deadline || null, follow_up_date: f.follow_up_date || null, notes: f.notes || null,
      required_documents: f.required_documents.split(",").map((s) => s.trim()).filter(Boolean),
      service_fee: Number(f.service_fee) || 0, third_party_fee: Number(f.third_party_fee) || 0,
    });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Application created");
    setOpen(false);
    qc.invalidateQueries();
  }

  return (
    <form onSubmit={save} className="grid gap-3 rounded-xl border bg-card p-5 shadow-card md:grid-cols-3">
      {!customerId && (
        <label className="text-sm font-medium">Customer
          <select required value={f.customer_id} onChange={set("customer_id")} className={field}>
            <option value="">Choose…</option>
            {(customers.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.code})</option>)}
          </select>
        </label>
      )}
      <label className="text-sm font-medium">Service<input required value={f.service} onChange={set("service")} placeholder="e.g. Income certificate" className={field} /></label>
      <label className="text-sm font-medium">Application / reference no.<input value={f.reference_no} onChange={set("reference_no")} className={field} /></label>
      <label className="text-sm font-medium">Assigned staff
        <select value={f.assigned_to} onChange={set("assigned_to")} className={field} disabled={me.role === "staff"}>
          <option value="">Unassigned</option>
          {(team.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.full_name || "Unnamed"}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">Deadline<input type="date" value={f.deadline} onChange={set("deadline")} className={field} /></label>
      <label className="text-sm font-medium">Follow-up date<input type="date" value={f.follow_up_date} onChange={set("follow_up_date")} className={field} /></label>
      <label className="text-sm font-medium">Service fee (₹)<input type="number" min="0" step="0.01" value={f.service_fee} onChange={set("service_fee")} className={field} /></label>
      <label className="text-sm font-medium">Govt / third-party fee (₹)<input type="number" min="0" step="0.01" value={f.third_party_fee} onChange={set("third_party_fee")} className={field} /></label>
      <label className="text-sm font-medium md:col-span-3">Required documents (comma separated)<input value={f.required_documents} onChange={set("required_documents")} placeholder="Aadhaar, Ration card, Photo" className={field} /></label>
      <label className="text-sm font-medium md:col-span-3">Internal notes<textarea value={f.notes} onChange={set("notes")} className={`${field} h-20 py-2`} /></label>
      <div className="flex gap-2 md:col-span-3">
        <button className={btn} disabled={busy}>{busy ? "Saving…" : "Create application"}</button>
        <button type="button" className={btnGhost} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
