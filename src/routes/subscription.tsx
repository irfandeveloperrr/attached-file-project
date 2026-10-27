import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyCard } from "@/components/PageScaffold";

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "Subscription — Lucky MeeSeva" },
      { name: "description", content: "Subscription and plan settings for future multi-office use." },
      { property: "og:title", content: "Subscription — Lucky MeeSeva" },
      { property: "og:description", content: "Subscription and plan settings for future multi-office use." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Subscription & Plans" description="Reserved for offering this software to other offices later." />
      <EmptyCard title="Disabled" note="Plans, seats and billing stay off until multi-office separation and security are tested." />
    </div>
  ),
});
