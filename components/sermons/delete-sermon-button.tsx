"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSermon } from "@/actions/sermons";

export function DeleteSermonButton({ sermonId, sermonTitle }: { sermonId: string; sermonTitle: string }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${sermonTitle}"? This action cannot be undone.`)) return;
    setDeleting(true);
    await deleteSermon(sermonId);
  }

  return (
    <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
      <Trash2 className="h-4 w-4" />
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
