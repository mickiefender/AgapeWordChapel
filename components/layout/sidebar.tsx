"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  Building2,
  Network,
  CalendarClock,
  ScanLine,
  CalendarDays,
  Video,
  HeartPulse,
  Mail,
  BookOpen,
  Megaphone,
  Bell,
  Wallet,
  BarChart3,
  Lightbulb,
  ScrollText,
  Search,
  ImagePlus,
  Settings,
  UserCog,
  X,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "People",
    items: [
      { label: "Members", href: "/dashboard/members", icon: Users },
      { label: "Visitors", href: "/dashboard/visitors", icon: UserPlus },
      { label: "Follow-ups", href: "/dashboard/follow-ups", icon: ClipboardList },
      { label: "Admin Users", href: "/dashboard/admin-users", icon: UserCog },
    ],
  },
  {
    title: "Church",
    items: [
      { label: "Departments", href: "/dashboard/departments", icon: Building2 },
      { label: "Join Requests", href: "/dashboard/join-requests", icon: UserPlus },
      { label: "Leadership", href: "/dashboard/leaders", icon: UserCog },
      { label: "Cell Groups", href: "/dashboard/cell-groups", icon: Network },
      { label: "Service Planner", href: "/dashboard/services", icon: CalendarClock },
      { label: "Attendance", href: "/dashboard/attendance", icon: ScanLine },
      { label: "Events", href: "/dashboard/events", icon: CalendarDays },
      { label: "Duty Roster", href: "/dashboard/duty-roster", icon: CalendarClock },
    ],
  },
  {
    title: "Care & Content",
    items: [
      { label: "Prayer Requests", href: "/dashboard/prayer-requests", icon: HeartPulse },
      { label: "Contact Messages", href: "/dashboard/contact-messages", icon: Mail },
      { label: "Sermons", href: "/dashboard/sermons", icon: BookOpen },
      { label: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
      { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { label: "Hero Images", href: "/dashboard/hero-images", icon: ImagePlus },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Finance", href: "/dashboard/finance", icon: Wallet },
      { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
      { label: "Insights", href: "/dashboard/insights", icon: Lightbulb },
      { label: "Audit Log", href: "/dashboard/audit-logs", icon: ScrollText },
      { label: "Search", href: "/dashboard/search", icon: Search },
      
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    function handleToggle() {
      setMobileOpen((v) => !v);
    }
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  function toggleSection(title: string) {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex min-h-24 items-center justify-between border-b border-white/10 px-5 py-4">
          <Link href="/dashboard" className="group flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <Image
              src="/Agape%20logo.png"
              alt="Agape Word Chapel logo"
              width={56}
              height={56}
              className="h-14 w-14 object-contain transition-transform duration-200 group-hover:scale-105"
              priority
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-foreground">Agape Word Chapel</p>
              <p className="text-[11px] text-sidebar-muted">International</p>
            </div>
          </Link>
          <button
            className="rounded-md p-1 text-sidebar-muted hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((section) => {
            const isExpanded = expanded[section.title] ?? true;
            return (
              <div key={section.title} className="mb-5">
                <button
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground"
                  onClick={() => toggleSection(section.title)}
                >
                  {section.title}
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")}
                  />
                </button>
                {isExpanded && (
                  <div className="mt-1.5 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                          isActive(item.href)
                            ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                            : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground",
                        )}
                      >
                        {isActive(item.href) && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
                            isActive(item.href) && "text-primary",
                          )}
                        />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
