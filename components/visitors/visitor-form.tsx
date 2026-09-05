"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createVisitor, updateVisitor, type VisitorActionError } from "@/actions/visitors";
import type { Visitor, VisitorStatus } from "@/types";

const STATUSES: { value: VisitorStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "follow_up", label: "Follow-up" },
  { value: "connected", label: "Connected" },
  { value: "joined", label: "Joined" },
  { value: "not_interested", label: "Not Interested" },
];

type Assignee = { id: string; first_name: string; last_name: string };

export function VisitorForm({ visitor, assignees }: { visitor?: Visitor; assignees?: Assignee[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!visitor;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const email = formData.get("email");
    if (typeof email === "string" && email.trim() === "") {
      formData.set("email", "");
    }

    const result = isEdit
      ? await updateVisitor(visitor.id, formData)
      : await createVisitor(formData);

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
          <CardTitle className="text-sm font-semibold">Visitor Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            Basic details about the guest and their first visit.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name *</Label>
            <Input id="full_name" name="full_name" required defaultValue={visitor?.full_name ?? ""} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={visitor?.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={visitor?.email ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="visit_date">Visit date</Label>
              <Input
                id="visit_date"
                name="visit_date"
                type="date"
                defaultValue={visitor?.visit_date ?? new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_attended">Service attended</Label>
              <Select id="service_attended" name="service_attended" defaultValue={visitor?.service_attended ?? ""}>
                <option value="">Select…</option>
                <option value="sunday_service">Sunday Service</option>
                <option value="midweek_service">Midweek Service</option>
                <option value="bible_study">Bible Study</option>
                <option value="prayer_meeting">Prayer Meeting</option>
                <option value="event">Event</option>
                <option value="children_ministry">Children's Ministry</option>
                <option value="youth_ministry">Youth Ministry</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invited_by">Invited by</Label>
              <Input id="invited_by" name="invited_by" defaultValue={visitor?.invited_by ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={visitor?.location ?? ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={visitor?.notes ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold">Follow-up</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track the next steps and who is responsible for following up.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={visitor?.status ?? "new"}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assigned to</Label>
            <Select id="assigned_to" name="assigned_to" defaultValue={visitor?.assigned_to ?? ""}>
              <option value="">Unassigned</option>
              {(assignees ?? []).map((a) => (
                <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 border-t pt-6">
        <Button type="submit">{isEdit ? "Save changes" : "Add visitor"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
