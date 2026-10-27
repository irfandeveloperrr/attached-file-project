import { createFileRoute } from "@tanstack/react-router";
import { PageScaffold } from "@/components/PageScaffold";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "Security & Audit — Lucky MeeSeva" },
      { name: "description", content: "Security & Audit for the Lucky MeeSeva office management system." },
      { property: "og:title", content: "Security & Audit — Lucky MeeSeva" },
      { property: "og:description", content: "Security & Audit for the Lucky MeeSeva office management system." },
    ],
  }),
  component: () => <PageScaffold navKey="audit" />,
});
