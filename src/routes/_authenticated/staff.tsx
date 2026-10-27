import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/_authenticated/staff")({
  head: () => ({
    meta: [
      { title: "Staff & Permissions — Lucky MeeSeva" },
      { name: "description", content: "Staff & Permissions for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Staff & Permissions — Lucky MeeSeva" },
      { property: "og:description", content: "Staff & Permissions for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="staff" />,
});
