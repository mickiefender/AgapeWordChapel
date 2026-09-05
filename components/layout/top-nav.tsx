"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Bell, Search, LogOut, User, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { logout } from "@/actions/auth";
import type { Profile } from "@/types";

export function TopNav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [search, setSearch] = useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(search.trim())}`);
    }
  }

  function handleSidebarToggle() {
    const sidebar = document.querySelector("aside") as HTMLElement;
    if (sidebar) {
      // Toggle mobile sidebar via a custom event consumed by the sidebar
      window.dispatchEvent(new CustomEvent("toggle-sidebar"));
    }
  }

  const pageTitle = pathname.split("/").filter(Boolean).pop() ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6 lg:px-8">
      <button
        className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
        onClick={handleSidebarToggle}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden sm:block">
        <p className="text-sm font-semibold capitalize text-foreground/80">{pageTitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members, events, sermons…"
            className="h-9 w-72 rounded-lg border border-border bg-muted/40 pl-9 pr-4 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:bg-background"
          />
        </form>

        <Link
          href="/dashboard/notifications"
          aria-label="Notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
        </Link>

        <div className="relative" ref={userMenuRef}>
          <button
            className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent"
            onClick={() => setUserMenuOpen((v) => !v)}
            aria-label="User menu"
          >
            <Avatar
              src={profile?.avatar_url}
              firstName={profile?.first_name}
              lastName={profile?.last_name}
              size="sm"
            />
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-lift">
              <div className="border-b border-border/60 px-3 py-2.5">
                <p className="text-sm font-semibold text-foreground">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{profile?.role ?? "Member"}</p>
              </div>
              <div className="pt-1">
                <Link
                  href="/dashboard/members"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
