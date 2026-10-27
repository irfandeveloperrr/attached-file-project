import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/income-expenses")({
  head: () => ({
    meta: [
      { title: "Income & Expenses — Lucky MeeSeva" },
      { name: "description", content: "Income & Expenses for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Income & Expenses — Lucky MeeSeva" },
      { property: "og:description", content: "Income & Expenses for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="income-expenses" />,
});
