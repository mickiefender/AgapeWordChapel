import { Bell, Building2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { getProfile, requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const displayName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Dashboard user";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Settings"
        description="Review your account details and church platform preferences."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4 text-primary" />
              Account information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Full name</p>
              <p className="mt-1 font-medium">{displayName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Email address</p>
              <p className="mt-1 flex items-center gap-2 font-medium"><Mail className="h-4 w-4 text-primary" />{user.email ?? "Not available"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Phone</p>
              <p className="mt-1 font-medium">{profile?.phone ?? "Not added"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Role</p>
              <p className="mt-1 flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4 text-primary" />{profile ? ROLE_LABELS[profile.role] : "Member"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/70 bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Church platform
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">System notifications and administrative updates are managed from the Notifications section.</p>
              </div>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
              Need to update your personal details? Contact a church administrator for assistance.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
