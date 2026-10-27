import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments & Receipts — Lucky MeeSeva" },
      { name: "description", content: "Payments & Receipts for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Payments & Receipts — Lucky MeeSeva" },
      { property: "og:description", content: "Payments & Receipts for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="payments" />,
});
