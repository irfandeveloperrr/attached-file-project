import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageScaffold";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Lucky MeeSeva" },
      { name: "description", content: "Private AI assistant for Lucky MeeSeva business questions." },
      { property: "og:title", content: "AI Assistant — Lucky MeeSeva" },
      { property: "og:description", content: "Private AI assistant for Lucky MeeSeva business questions." },
    ],
  }),
  component: Assistant,
});

const EXAMPLES = ["Summarize today's business performance.", "Which applications are overdue?", "Which customers have outstanding balances?", "What is the difference between my revenue and cash collected?"];

function Assistant() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="AI Business Assistant" description="Answers use only your authorized, de-identified office data." />
      <div className="rounded-xl border bg-card p-8 text-center shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground"><Sparkles className="h-6 w-6" /></div>
        <h2 className="mt-4 font-display text-lg font-semibold">Assistant not connected yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">It will be switched on once your office data is stored securely. Example questions:</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((e) => <span key={e} className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground">{e}</span>)}
        </div>
      </div>
    </div>
  );
}
