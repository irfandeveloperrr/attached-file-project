import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageScaffold";
import { btn, btnGhost, downloadCsv, field, isLead, normPhone, useMe, useTeam } from "@/lib/office";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Lucky MeeSeva" },
      { name: "description", content: "Central customer database for the Lucky MeeSeva office." },
      { property: "og:title", content: "Customers — Lucky MeeSeva" },
      { property: "og:description", content: "Central customer database for the Lucky MeeSeva office." },
    ],
  }),
  component: CustomersPage,
});

const PAGE = 25;

function CustomersPage() {
  const me = useMe();
  const qc = useQueryClient();
  const team = useTeam();
  const [q, setQ] = useState("");
  const [staff, setStaff] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(0);
  const [adding, setAdding] = useState(false);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*, applications(reference_no, status)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const names = new Map((team.data ?? []).map((t) => [t.id, t.full_name]));

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return customers.filter((c) => {
      if (!showArchived && c.archived_at) return false;
      if (staff && c.assigned_to !== staff) return false;
      if (!s) return true;
      return [c.full_name, c.code, c.phone, ...c.applications.map((a) => a.reference_no ?? "")].some((v) => v.toLowerCase().includes(s));
    });
  }, [customers, q, staff, showArchived]);
  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Customers"
        description="Search by name, customer ID, mobile or application number."
        actions={
          <div className="flex gap-2">
            {isLead(me.role) && (
              <button className={btnGhost} onClick={() => downloadCsv("customers.csv", filtered.map((c) => ({ id: c.code, name: c.full_name, mobile: c.phone, email: c.email, address: c.address, assigned: names.get(c.assigned_to ?? "") ?? "", applications: c.applications.length, added: c.created_at.slice(0, 10) })))}>
                <Download className="h-4 w-4" /> Export CSV
              </button>
            )}
            <button className={btn} onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add customer</button>
          </div>
        }
      />
      {adding && <AddCustomer existing={customers} onDone={() => { setAdding(false); qc.invalidateQueries({ queryKey: ["customers"] }); }} />}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search customers…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} className={`${field} mt-0 pl-9`} />
        </div>
        {isLead(me.role) && (
          <select value={staff} onChange={(e) => setStaff(e.target.value)} className={`${field} mt-0 w-48`}>
            <option value="">All staff</option>
            {(team.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.full_name || "Unnamed"}</option>)}
          </select>
        )}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Show archived</label>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Mobile</th><th className="p-3">Assigned</th><th className="p-3">Applications</th><th className="p-3">Added</th></tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{c.code}</td>
                <td className="p-3"><Link to="/customer/$id" params={{ id: c.id }} className="font-medium text-accent hover:underline">{c.full_name}</Link>{c.archived_at && <span className="ml-2 rounded bg-muted px-1.5 text-xs">Archived</span>}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{names.get(c.assigned_to ?? "") || "—"}</td>
                <td className="p-3">{c.applications.length}</td>
                <td className="p-3">{c.created_at.slice(0, 10)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">{isLoading ? "Loading…" : "No customers yet."}</td></tr>}
          </tbody>
        </table>
      </div>
      {filtered.length > PAGE && (
        <div className="mt-3 flex items-center justify-end gap-2 text-sm">
          <button className={btnGhost} disabled={!page} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page + 1} of {Math.ceil(filtered.length / PAGE)}</span>
          <button className={btnGhost} disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

function AddCustomer({ existing, onDone }: { existing: { full_name: string; phone: string; code: string }[]; onDone: () => void }) {
  const me = useMe();
  const team = useTeam();
  const [f, setF] = useState({ full_name: "", phone: "", email: "", address: "", notes: "", assigned_to: me.role === "staff" ? me.id : "" });
  const [busy, setBusy] = useState(false);
  const dup = f.phone.length >= 10 ? existing.find((c) => normPhone(c.phone) === normPhone(f.phone)) : undefined;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[0-9+ ]{10,15}$/.test(f.phone.trim())) return void toast.error("Enter a valid mobile number.");
    setBusy(true);
    const { error } = await supabase.from("customers").insert({
      full_name: f.full_name.trim(), phone: f.phone.trim(), email: f.email || null, address: f.address || null, notes: f.notes || null, assigned_to: f.assigned_to || null,
    });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Customer added");
    onDone();
  }

  return (
    <form onSubmit={save} className="mb-6 grid gap-3 rounded-xl border bg-card p-5 shadow-card md:grid-cols-3">
      <label className="text-sm font-medium">Full name<input required value={f.full_name} onChange={set("full_name")} className={field} /></label>
      <label className="text-sm font-medium">Mobile number<input required type="tel" value={f.phone} onChange={set("phone")} className={field} /></label>
      <label className="text-sm font-medium">Email (optional)<input type="email" value={f.email} onChange={set("email")} className={field} /></label>
      <label className="text-sm font-medium md:col-span-2">Address (if needed)<input value={f.address} onChange={set("address")} className={field} /></label>
      <label className="text-sm font-medium">Assigned staff
        <select value={f.assigned_to} onChange={set("assigned_to")} className={field} disabled={me.role === "staff"}>
          <option value="">Unassigned</option>
          {(team.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.full_name || "Unnamed"}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium md:col-span-3">Notes<textarea value={f.notes} onChange={set("notes")} className={`${field} h-20 py-2`} /></label>
      {dup && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive md:col-span-3">Possible duplicate: {dup.full_name} ({dup.code}) already has this mobile number.</p>}
      <div className="flex gap-2 md:col-span-3">
        <button className={btn} disabled={busy}>{busy ? "Saving…" : "Save customer"}</button>
        <button type="button" className={btnGhost} onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}
