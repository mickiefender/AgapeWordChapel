"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDepartmentMembers } from "@/actions/departments";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, X } from "lucide-react";

type AvailableMember = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  avatar_url: string | null;
};

export function AddDepartmentMembers({
  departmentId,
  members,
}: {
  departmentId: string;
  members: AvailableMember[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return members;

    return members.filter((member) =>
      `${member.first_name} ${member.last_name} ${member.email ?? ""}`.toLowerCase().includes(normalizedQuery),
    );
  }, [members, query]);

  function toggleMember(memberId: string) {
    setSelected((current) =>
      current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId],
    );
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    const result = await addDepartmentMembers(departmentId, selected);

    if (result?.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setOpen(false);
    setSelected([]);
    setSaving(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)} disabled={members.length === 0}>
        <UserPlus className="h-4 w-4" />
        Add members
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close add members dialog"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-members-title"
            className="relative z-10 flex max-h-[min(680px,calc(100vh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lift"
          >
            <div className="flex items-start justify-between border-b border-border/70 px-5 py-4">
              <div>
                <h2 id="add-members-title" className="font-semibold tracking-tight">Add members</h2>
                <p className="mt-1 text-sm text-muted-foreground">Select one or more people for this department.</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-border/70 p-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search members..."
                  aria-label="Search available members"
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {filteredMembers.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">No available members found.</p>
              ) : (
                filteredMembers.map((member) => {
                  const checked = selected.includes(member.id);
                  return (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/60"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMember(member.id)}
                        className="h-4 w-4 rounded border-input text-primary accent-primary"
                      />
                      <Avatar src={member.avatar_url} firstName={member.first_name} lastName={member.last_name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{member.first_name} {member.last_name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{member.email ?? "No email"}</span>
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            <div className="border-t border-border/70 p-4">
              {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{selected.length} selected</p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="button" onClick={handleSubmit} disabled={selected.length === 0 || saving}>
                    {saving ? "Adding..." : "Add selected"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
