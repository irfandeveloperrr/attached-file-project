import {
  LayoutDashboard, Briefcase, UserCheck, Users, FileStack, FolderLock, Receipt,
  Wallet, TrendingUp, Target, ShieldCheck, FileBarChart, Sparkles, Bell, Settings,
  ScrollText, CreditCard, type LucideIcon,
} from "lucide-react";

export type AppRole = "admin" | "manager" | "staff";

export type NavItem = {
  roles?: AppRole[];
  key: string;
  to: string;
  label: string;
  icon: LucideIcon;
  group: string;
  description: string;
  sections: string[];
};

export const NAV: NavItem[] = [
  { roles: ["admin"], key: "dashboard", to: "/", label: "Admin Dashboard", icon: LayoutDashboard, group: "Overview", description: "Live command center for the whole office.", sections: [] },
  { roles: ["admin", "manager"], key: "manager", to: "/manager", label: "Manager Dashboard", icon: Briefcase, group: "Overview", description: "Assignments, team progress and deadlines.", sections: ["Team work queue", "Deadlines this week", "Staff pending tasks"] },
  { key: "staff-dashboard", to: "/my-work", label: "Staff Dashboard", icon: UserCheck, group: "Overview", description: "Your tasks, follow-ups and performance.", sections: ["My tasks today", "Follow-ups due", "My performance"] },
  { key: "customers", to: "/customers", label: "Customers", icon: Users, group: "Operations", description: "Central customer database with search, filters and exports.", sections: ["Customer table", "Duplicate detection", "Bulk assignment"] },
  { key: "applications", to: "/applications", label: "Applications", icon: FileStack, group: "Operations", description: "Track every application through its workflow.", sections: ["Kanban board", "Table view", "Overdue alerts", "Daily work queue"] },
  { key: "documents", to: "/documents", label: "Document Center", icon: FolderLock, group: "Operations", description: "Private, access-logged storage for customer documents.", sections: ["Documents by customer", "Missing documents", "Verification queue"] },
  { roles: ["admin", "manager"], key: "payments", to: "/payments", label: "Payments & Receipts", icon: Receipt, group: "Finance", description: "Charges, collections, refunds and printable receipts.", sections: ["Recent payments", "Outstanding balances", "Receipts"] },
  { roles: ["admin"], key: "income-expenses", to: "/income-expenses", label: "Income & Expenses", icon: Wallet, group: "Finance", description: "Record office income and operating expenses.", sections: ["Expenses by category", "Third-party amounts payable", "Adjustments"] },
  { roles: ["admin"], key: "profit-loss", to: "/profit-loss", label: "Profit & Loss", icon: TrendingUp, group: "Finance", description: "Revenue, cash flow and net profit — clearly separated.", sections: ["Monthly P&L", "Revenue by service", "Cash flow vs revenue"] },
  { roles: ["admin", "manager"], key: "targets", to: "/targets", label: "Targets & Performance", icon: Target, group: "Team", description: "Daily and monthly targets versus actual results.", sections: ["Daily targets", "Employee performance", "Service targets"] },
  { roles: ["admin"], key: "staff", to: "/staff", label: "Staff & Permissions", icon: ShieldCheck, group: "Team", description: "Manage employees, roles and access rules.", sections: ["Team members", "Roles", "Permission matrix"] },
  { roles: ["admin", "manager"], key: "reports", to: "/reports", label: "Reports & Exports", icon: FileBarChart, group: "Insights", description: "Role-aware reports with CSV and Excel exports.", sections: ["Operational reports", "Financial reports", "Export history"] },
  { roles: ["admin", "manager"], key: "assistant", to: "/assistant", label: "AI Assistant", icon: Sparkles, group: "Insights", description: "Ask questions about your business, privately.", sections: [] },
  { key: "notifications", to: "/notifications", label: "Notifications", icon: Bell, group: "Insights", description: "Deadlines, missing documents, balances and daily summaries.", sections: ["Unread", "Notification rules"] },
  { roles: ["admin"], key: "settings", to: "/settings", label: "Business Settings", icon: Settings, group: "System", description: "Business profile, services, pricing and workflows.", sections: ["Business profile", "Services & pricing", "Workflow statuses"] },
  { roles: ["admin"], key: "audit", to: "/audit", label: "Security & Audit", icon: ScrollText, group: "System", description: "Sign-in activity, sensitive access and change history.", sections: ["Audit log", "Document access log", "Security settings"] },
  { roles: ["admin"], key: "subscription", to: "/subscription", label: "Subscription", icon: CreditCard, group: "System", description: "Plans for future multi-office use — currently disabled.", sections: [] },
];

export const navByKey = (k: string) => NAV.find((n) => n.key === k)!;

export const navFor = (role: AppRole) => NAV.filter((n) => !n.roles || n.roles.includes(role));
