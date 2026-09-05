"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addServiceItem, type ServiceActionError } from "@/actions/services";

export function ServiceItemForm({ serviceId }: { serviceId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await addServiceItem(serviceId, formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Add Item
      </Button>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-lg border bg-muted/40 p-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Item Title *</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="e.g. Opening Prayer, Worship, Sermon"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time</Label>
          <Input id="start_time" name="start_time" type="time" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input id="duration_minutes" name="duration_minutes" type="number" min="0" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="Notes about this item…" />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm">Add Item</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
