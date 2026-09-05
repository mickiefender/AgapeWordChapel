"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createCellGroup, updateCellGroup } from "@/actions/cell-groups";
import type { CellGroup } from "@/types";

type MemberOption = { id: string; first_name: string; last_name: string };

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function CellGroupForm({ cellGroup, members }: { cellGroup?: CellGroup; members: MemberOption[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!cellGroup;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEdit
      ? await updateCellGroup(cellGroup.id, formData)
      : await createCellGroup(formData);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-7">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Group details</h3>
          <p className="mt-1 text-xs text-muted-foreground">Define the people, place, and rhythm for this group.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Group name *</Label>
          <Input id="name" name="name" required defaultValue={cellGroup?.name ?? ""} placeholder="e.g. Ebenezer Cell Group" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="leader_id">Leader</Label>
            <Select id="leader_id" name="leader_id" defaultValue={cellGroup?.leader_id ?? ""}>
              <option value="">Select leader…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assistant_leader_id">Assistant leader</Label>
            <Select id="assistant_leader_id" name="assistant_leader_id" defaultValue={cellGroup?.assistant_leader_id ?? ""}>
              <option value="">Select assistant…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="meeting_location">Meeting location</Label>
            <Input id="meeting_location" name="meeting_location" defaultValue={cellGroup?.meeting_location ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meeting_day">Meeting day</Label>
            <Select id="meeting_day" name="meeting_day" defaultValue={cellGroup?.meeting_day ?? ""}>
              <option value="">Select day…</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meeting_time">Meeting time</Label>
          <Input id="meeting_time" name="meeting_time" type="time" defaultValue={cellGroup?.meeting_time ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={cellGroup?.description ?? ""} />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-6 sm:flex-row">
        <Button type="submit">{isEdit ? "Save changes" : "Create group"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
