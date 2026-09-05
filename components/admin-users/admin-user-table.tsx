"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Users, Pencil, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/types";
import type { AdminUser } from "@/lib/queries/admin-users";

export function AdminUserTable({ users }: { users: AdminUser[] }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const name = `${user.first_name} ${user.last_name}`.toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        name.includes(normalizedQuery) ||
        user.email?.toLowerCase().includes(normalizedQuery) ||
        user.phone?.toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesQuery && matchesRole;
    });
  }, [query, roleFilter, users]);

  if (users.length === 0) {
      return (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No users found"
          description="Create an account to give someone access to the system."
        />
      );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold tracking-tight">Team directory</h2>
              <p className="text-xs text-muted-foreground">
                {filteredUsers.length} of {users.length} {users.length === 1 ? "user" : "users"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex min-w-0 flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users..."
              aria-label="Search admin users"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter by role"
              className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-9 pr-8 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 sm:w-48"
            >
              <option value="all">All roles</option>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <Link href={`/dashboard/admin-users/${u.id}`} className="group flex min-w-48 items-center gap-3">
                  <Avatar src={u.avatar_url} firstName={u.first_name} lastName={u.last_name} size="md" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-foreground group-hover:text-primary">
                      {u.first_name} {u.last_name}
                    </span>
                    <span className="block text-xs text-muted-foreground">View profile</span>
                  </span>
                </Link>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{u.email ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={u.role === "super_admin" ? "default" : "outline"} className="whitespace-nowrap">
                  {ROLE_LABELS[u.role as Role] ?? u.role}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{u.phone ?? "—"}</TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/dashboard/admin-users/${u.id}/edit`}
                  aria-label={`Edit ${u.first_name} ${u.last_name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {filteredUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-1 text-sm">
                  <Users className="mb-1 h-5 w-5 text-muted-foreground/60" />
                  <p className="font-medium">No matching users</p>
                  <p className="text-muted-foreground">Try a different name, email, or role.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </section>
  );
}
