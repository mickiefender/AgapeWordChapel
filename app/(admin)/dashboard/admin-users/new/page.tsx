import { AdminUserForm } from "@/components/admin-users/admin-user-form";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { UserPlus, X } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewAdminUserPage() {
  await requireSuperAdmin();

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm sm:p-8">
      <Link
        href="/dashboard/admin-users"
        aria-label="Close add user dialog"
        className="absolute inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-user-title"
        className="relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lift"
      >
        <div className="flex items-start justify-between border-b border-border/70 bg-muted/25 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h1 id="add-user-title" className="text-lg font-semibold tracking-tight">Add admin user</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up a secure account and choose the access this team member needs.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin-users"
            aria-label="Close"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 py-6 sm:px-7">
          <div className="mb-6 rounded-xl bg-sidebar p-4 text-sidebar-foreground sm:flex sm:items-center sm:gap-5">
            <div>
              <p className="font-medium">Build your team</p>
              <p className="mt-1 text-xs leading-5 text-sidebar-muted">
                Use a work email and assign the role that matches this person's responsibilities.
              </p>
            </div>
          </div>
          <AdminUserForm />
        </div>
      </div>
    </div>
  );
}
