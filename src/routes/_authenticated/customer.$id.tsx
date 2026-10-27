import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Printer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageScaffold";
import { DocumentPanel } from "@/components/DocumentPanel";
import { NewApplication } from "@/routes/_authenticated/applications";
import { btnGhost, isLead, statusLabel, useMe } from "@/lib/office";

export const Route = createFileRoute("/_authenticated/customer/$id")({
  head: () => ({
    meta: [
      { title: "Customer profile — Lucky MeeSeva" },
      { name: "description", content: "Customer applications, documents and notes." },
      { property: "og:title", content: "Customer profile — Lucky MeeSeva" },
      { property: "og:description", content: "Customer applications, documents and notes." },
    ],
  }),
  component: CustomerPage,
});

function CustomerPage() {
  const { id } = Route.useParams();
  const me = useMe();
  const qc = useQueryClient();
  const { data: c, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*, applications(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!c) return <p className="text-muted-foreground">Customer not found or you don't have access.</p>;

  async function toggleArchive() {
    const { error } = await supabase.from("customers").update({ archived_at: c!.archived_at ? null : new Date().toISOString() }).eq("id", id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={c.full_name}
        description={`${c.code} · ${c.phone}${c.email ? ` · ${c.email}` : ""}`}
        actions={
          <div className="flex gap-2 print:hidden">
            <button className={btnGhost} onClick={() => window.print()}><Printer className="h-4 w-4" /> Print summary</button>
            {isLead(me.role) && <button className={btnGhost} onClick={toggleArchive}><Archive className="h-4 w-4" />{c.archived_at ? "Restore" : "Archive"}</button>}
          </div>
        }
      />
      {(c.address || c.notes) && (
        <div className="rounded-xl border bg-card p-5 text-sm shadow-card">
          {c.address && <p><b>Address:</b> {c.address}</p>}
          {c.notes && <p className="mt-1 whitespace-pre-wrap"><b>Notes:</b> {c.notes}</p>}
        </div>
      )}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h2 className="font-display font-semibold">Applications</h2>
        <div className="mt-3 print:hidden"><NewApplication customerId={id} /></div>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {c.applications.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2"><Link to="/application/$id" params={{ id: a.id }} className="font-medium text-accent hover:underline">{a.service}</Link></td>
                <td className="p-2">{a.reference_no || "—"}</td>
                <td className="p-2">{statusLabel(a.status)}</td>
                <td className="p-2">Due {a.deadline ?? "—"}</td>
              </tr>
            ))}
            {!c.applications.length && <tr><td className="p-4 text-center text-muted-foreground">No applications yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="print:hidden"><DocumentPanel customerId={id} /></div>
    </div>
  );
}
