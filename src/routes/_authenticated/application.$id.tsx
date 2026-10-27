import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageScaffold";
import { DocumentPanel } from "@/components/DocumentPanel";
import { STATUSES, btn, field, isLead, statusLabel, useMe, type AppStatus } from "@/lib/office";

export const Route = createFileRoute("/_authenticated/application/$id")({
  head: () => ({
    meta: [
      { title: "Application — Lucky MeeSeva" },
      { name: "description", content: "Application tracking, status history and documents." },
      { property: "og:title", content: "Application — Lucky MeeSeva" },
      { property: "og:description", content: "Application tracking, status history and documents." },
    ],
  }),
  component: ApplicationPage,
});

function ApplicationPage() {
  const { id } = Route.useParams();
  const me = useMe();
  const qc = useQueryClient();
  const { data: a, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*, customers(id, full_name, code, phone), application_status_history(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [f, setF] = useState({ status: "new" as AppStatus, notes: "", follow_up_date: "", reference_no: "" });
  useEffect(() => { if (a) setF({ status: a.status, notes: a.notes ?? "", follow_up_date: a.follow_up_date ?? "", reference_no: a.reference_no ?? "" }); }, [a]);
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!a) return <p className="text-muted-foreground">Application not found or you don't have access.</p>;

  async function save() {
    const { error } = await supabase.from("applications").update({ status: f.status, notes: f.notes || null, follow_up_date: f.follow_up_date || null, reference_no: f.reference_no || null }).eq("id", id);
    if (error) return void toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries();
  }
  async function outcome(o: "approved" | "rejected" | "pending") {
    const { error } = await supabase.from("applications").update({ official_outcome: o }).eq("id", id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries();
  }
  const history = [...a.application_status_history].sort((x, y) => y.changed_at.localeCompare(x.changed_at));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title={a.service} description={`For ${a.customers?.full_name} (${a.customers?.code}) · created ${a.created_at.slice(0, 10)}`} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium">Office status
              <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as AppStatus })} className={field}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Reference no.<input value={f.reference_no} onChange={(e) => setF({ ...f, reference_no: e.target.value })} className={field} /></label>
            <label className="text-sm font-medium">Follow-up date<input type="date" value={f.follow_up_date} onChange={(e) => setF({ ...f, follow_up_date: e.target.value })} className={field} /></label>
          </div>
          <label className="block text-sm font-medium">Internal notes<textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className={`${field} h-28 py-2`} /></label>
          <button className={btn} onClick={save}>Save changes</button>
        </div>
        <div className="space-y-3 rounded-xl border bg-card p-5 text-sm shadow-card">
          <p><b>Customer:</b> <Link to="/customer/$id" params={{ id: a.customer_id }} className="text-accent hover:underline">{a.customers?.full_name}</Link> · {a.customers?.phone}</p>
          <p><b>Deadline:</b> {a.deadline ?? "—"}</p>
          <p><b>Service fee:</b> ₹{a.service_fee} · <b>Govt / third-party fee:</b> ₹{a.third_party_fee}</p>
          <p><b>Office work completed:</b> {a.office_completed_at ? a.office_completed_at.slice(0, 10) : "Not yet"}</p>
          <p><b>Official decision:</b> <span className="capitalize">{a.official_outcome}</span></p>
          {isLead(me.role) && (
            <div className="flex gap-2 text-xs">
              <button className="text-accent hover:underline" onClick={() => outcome("approved")}>Mark officially approved</button>
              <button className="text-destructive hover:underline" onClick={() => outcome("rejected")}>Officially rejected</button>
            </div>
          )}
          {a.required_documents.length > 0 && (
            <div><b>Required documents:</b><ul className="ml-5 list-disc">{a.required_documents.map((d) => <li key={d}>{d}</li>)}</ul></div>
          )}
        </div>
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h2 className="font-display font-semibold">Status history</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {history.map((h) => <li key={h.id}>{h.changed_at.slice(0, 16).replace("T", " ")} — {h.from_status ? `${statusLabel(h.from_status)} → ` : ""}{statusLabel(h.to_status)}</li>)}
        </ul>
      </div>
      <DocumentPanel customerId={a.customer_id} applicationId={id} />
    </div>
  );
}
