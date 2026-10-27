import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/_authenticated/profit-loss")({
  head: () => ({
    meta: [
      { title: "Profit & Loss — Lucky MeeSeva" },
      { name: "description", content: "Profit & Loss for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Profit & Loss — Lucky MeeSeva" },
      { property: "og:description", content: "Profit & Loss for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="profit-loss" />,
});
