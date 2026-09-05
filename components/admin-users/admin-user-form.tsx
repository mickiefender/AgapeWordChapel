"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createAdminUser, updateAdminUser } from "@/actions/admin-users";
import { ROLE_LABELS } from "@/types";
import type { AdminUser } from "@/lib/queries/admin-users";

export function AdminUserForm({ user }: { user?: AdminUser }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!user;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEdit
      ? await updateAdminUser(user.id, formData)
      : await createAdminUser(formData);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-7">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Personal information</h3>
          <p className="mt-1 text-xs text-muted-foreground">How this person will appear across the dashboard.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              name="first_name"
              required
              defaultValue={user?.first_name ?? ""}
              placeholder="e.g. John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              name="last_name"
              required
              defaultValue={user?.last_name ?? ""}
              placeholder="e.g. Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={user?.email ?? ""}
            placeholder="e.g. john@agape.org"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={user?.phone ?? ""}
            placeholder="e.g. +233 123 456 789"
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-border/70 pt-6">
        <div>
          <h3 className="text-sm font-semibold">Access & security</h3>
          <p className="mt-1 text-xs text-muted-foreground">Choose what this person can access.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="At least 6 characters"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select id="role" name="role" required defaultValue={user?.role ?? "member"}>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-6 sm:flex-row">
        <Button type="submit">{isEdit ? "Save changes" : "Create user"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
