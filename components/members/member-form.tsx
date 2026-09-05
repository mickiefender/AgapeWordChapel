"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { createMember, updateMember, type MemberActionError } from "@/actions/members";
import type { Member, MemberGender, MaritalStatus } from "@/types";
import { MEMBER_STATUS_LABELS } from "@/types";
import { Upload } from "lucide-react";

const GENDERS: { value: MemberGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const MARITAL_STATUSES: { value: MaritalStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "engaged", label: "Engaged" },
  { value: "widowed", label: "Widowed" },
  { value: "divorced", label: "Divorced" },
  { value: "separated", label: "Separated" },
];

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

export function MemberForm({ member }: { member?: Member }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(member?.avatar_url ?? null);
  const isEdit = !!member;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_AVATAR_SIZE) {
      setError("Profile photo must be 5MB or smaller.");
      e.target.value = "";
      return;
    }
    setError(null);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(formData: FormData) {
    setError(null);

    // Validate avatar size before hitting the server action.
    const avatar = formData.get("avatar");
    if (avatar instanceof File && avatar.size > MAX_AVATAR_SIZE) {
      setError("Profile photo must be 5MB or smaller.");
      return;
    }

    // If empty email, clear it to satisfy the zod literal "" branch
    const email = formData.get("email");
    if (typeof email === "string" && email.trim() === "") {
      formData.set("email", "");
    }

    const result = isEdit
      ? await updateMember(member.id, formData)
      : await createMember(formData);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-inset ring-destructive/20">
          <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
          {error}
        </div>
      )}

      {/* Profile photo */}
      <div className="flex items-center gap-6 rounded-xl border border-dashed border-border bg-muted/30 p-6">
        <Avatar
          src={avatarPreview}
          firstName={member?.first_name}
          lastName={member?.last_name}
          size="lg"
          className="h-20 w-20 text-xl ring-2 ring-background shadow-soft"
        />
        <div className="flex-1">
          <p className="text-sm font-medium">Profile photo</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Upload a clear portrait. PNG or JPG, up to 5MB.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label
              htmlFor="avatar-upload"
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Upload className="h-4 w-4" />
              Upload photo
            </label>
            <input
              id="avatar-upload"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="sr-only"
            />
            {member?.avatar_url && (
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  setAvatarPreview(null);
                  // Clear the file input too
                  const input = document.getElementById("avatar-upload") as HTMLInputElement | null;
                  if (input) input.value = "";
                }}
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Personal Information
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name *</Label>
              <Input id="first_name" name="first_name" required defaultValue={member?.first_name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle name</Label>
              <Input id="middle_name" name="middle_name" defaultValue={member?.middle_name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name *</Label>
              <Input id="last_name" name="last_name" required defaultValue={member?.last_name ?? ""} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={member?.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={member?.email ?? ""} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of birth</Label>
              <Input id="date_of_birth" name="date_of_birth" type="date" defaultValue={member?.date_of_birth ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select id="gender" name="gender" defaultValue={member?.gender ?? ""}>
                <option value="">Select…</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="marital_status">Marital status</Label>
              <Select id="marital_status" name="marital_status" defaultValue={member?.marital_status ?? ""}>
                <option value="">Select…</option>
                {MARITAL_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" name="occupation" defaultValue={member?.occupation ?? ""} />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={member?.address ?? ""} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Church Information
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="membership_date">Membership date</Label>
              <Input id="membership_date" name="membership_date" type="date" defaultValue={member?.membership_date ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="membership_status">Membership status</Label>
              <Select id="membership_status" name="membership_status" defaultValue={member?.membership_status ?? "visitor"}>
                {Object.entries(MEMBER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="baptism_status">Baptism status</Label>
              <Input id="baptism_status" name="baptism_status" defaultValue={member?.baptism_status ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch_location">Branch / location</Label>
              <Input id="branch_location" name="branch_location" defaultValue={member?.branch_location ?? ""} />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={member?.notes ?? ""} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Emergency Contact
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Name</Label>
              <Input id="emergency_contact_name" name="emergency_contact_name" defaultValue={member?.emergency_contact_name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Phone</Label>
              <Input id="emergency_contact_phone" name="emergency_contact_phone" defaultValue={member?.emergency_contact_phone ?? ""} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t pt-6">
        <Button type="submit">{isEdit ? "Save changes" : "Create member"}</Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
