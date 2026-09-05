"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFollowUp, updateFollowUp, type FollowUpActionError } from "@/actions/follow-ups";
import type { FollowUp } from "@/types";

type MemberOption = { id: string; first_name: string; last_name: string };
type VisitorOption = { id: string; full_name: string };
type ProfileOption = { id: string; first_name: string; last_name: string; role: string };

export function FollowUpForm({
  followUp,
  members,
  visitors,
  profiles,
}: {
  followUp?: FollowUp;
  members: MemberOption[];
  visitors: VisitorOption[];
  profiles: ProfileOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!followUp;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEdit
      ? await updateFollowUp(followUp.id, formData)
      : await createFollowUp(formData);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-inset ring-destructive/20">
          <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold">Follow-up Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Define the task and who it relates to.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task">Task *</Label>
            <Input
              id="task"
              name="task"
              required
              defaultValue={followUp?.task ?? ""}
              placeholder="e.g. Call to welcome John back to church"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member_id">Member</Label>
              <Select id="member_id" name="member_id" defaultValue={followUp?.member_id ?? ""}>
                <option value="">Select member…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitor_id">Visitor</Label>
              <Select id="visitor_id" name="visitor_id" defaultValue={followUp?.visitor_id ?? ""}>
                <option value="">Select visitor…</option>
                {visitors.map((v) => (
                  <option key={v.id} value={v.id}>{v.full_name}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold">Assignment & Status</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set who is responsible and the current state of the task.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned to *</Label>
              <Select id="assigned_to" name="assigned_to" required defaultValue={followUp?.assigned_to ?? ""}>
                <option value="">Select…</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" name="due_date" type="date" defaultValue={followUp?.due_date ?? ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={followUp?.status ?? "pending"}>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 border-t pt-6">
        <Button type="submit">{isEdit ? "Save changes" : "Create follow-up"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
