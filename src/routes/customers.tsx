import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Lucky MeeSeva" },
      { name: "description", content: "Customers for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Customers — Lucky MeeSeva" },
      { property: "og:description", content: "Customers for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="customers" />,
});
