"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { addServiceAssignment, type ServiceActionError } from "@/actions/services";

type MemberOption = { id: string; first_name: string; last_name: string };

export function ServiceAssignmentForm({
  serviceId,
  members,
}: {
  serviceId: string;
  members: MemberOption[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await addServiceAssignment(serviceId, formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Add Assignment
      </Button>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-lg border bg-muted/40 p-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="member_id">Member *</Label>
        <Select id="member_id" name="member_id" required>
          <option value="">Select member…</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.first_name} {m.last_name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Input
          id="role"
          name="role"
          required
          placeholder="e.g. Usher, Media, Worship"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="Additional notes…" />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm">Add Assignment</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
