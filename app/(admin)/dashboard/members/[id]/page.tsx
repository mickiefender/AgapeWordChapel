import Link from "next/link";
import { notFound } from "next/navigation";
import { getMember, getMemberJourney, getMemberAttendance } from "@/lib/queries/members";
import { PageHeader } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pencil,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Heart,
  ShieldAlert,
  ArrowLeft,
  FileClock,
  User,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { MEMBER_STATUS_LABELS, type MemberStatus } from "@/types";
import { deleteMember } from "@/actions/members";

const statusVariant: Record<MemberStatus, "default" | "success" | "info" | "warning" | "secondary" | "destructive" | "outline"> = {
  visitor: "secondary",
  new_convert: "warning",
  new_member: "info",
  active_member: "success",
  worker: "default",
  leader: "info",
  inactive: "destructive",
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  const [journey, attendance] = await Promise.all([
    getMemberJourney(id),
    getMemberAttendance(id),
  ]);

  const fullName = `${member.first_name} ${member.middle_name ?? ""} ${member.last_name}`.trim();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/members"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to members
        </Link>
        <PageHeader
          title={fullName}
          description={`Member since ${member.membership_date ? formatDate(member.membership_date) : "unknown"}`}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/members/${id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <form action={deleteMember.bind(null, id)}>
                <Button variant="destructive" type="submit">
                  Delete
                </Button>
              </form>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          {/* Profile card */}
          <Card className="overflow-hidden">
            <div className="h-24 bg-primary/15" />
            <CardContent className="relative -mt-12 flex flex-col items-center p-6 pb-6">
              <Avatar
                src={member.avatar_url}
                firstName={member.first_name}
                lastName={member.last_name}
                size="lg"
                className="h-24 w-24 text-2xl ring-4 ring-card shadow-soft"
              />
              <h2 className="mt-3 text-lg font-semibold text-foreground">{fullName}</h2>
              <p className="text-sm text-muted-foreground">{member.occupation ?? "Member"}</p>
              <div className="mt-2">
                <Badge variant={statusVariant[member.membership_status] ?? "outline"}>
                  {MEMBER_STATUS_LABELS[member.membership_status] ?? member.membership_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ContactRow icon={Phone} label="Phone" value={member.phone} />
              <ContactRow icon={Mail} label="Email" value={member.email} />
              <ContactRow icon={MapPin} label="Address" value={member.address} />
              <ContactRow icon={Calendar} label="Date of birth" value={member.date_of_birth ? formatDate(member.date_of_birth) : undefined} />
              <ContactRow icon={Briefcase} label="Occupation" value={member.occupation} />
              <ContactRow icon={Heart} label="Marital status" value={member.marital_status ? member.marital_status.replace(/_/g, " ") : undefined} />
            </CardContent>
          </Card>

          {(member.emergency_contact_name || member.emergency_contact_phone) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {member.emergency_contact_name && <p className="font-medium">{member.emergency_contact_name}</p>}
                {member.emergency_contact_phone && <p className="text-muted-foreground">{member.emergency_contact_phone}</p>}
              </CardContent>
            </Card>
          )}

          {member.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{member.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          {/* Journey timeline */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <FileClock className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-semibold">Church Journey Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {journey.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <FileClock className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No journey events recorded yet.</p>
                </div>
              ) : (
                <ol className="relative space-y-0 border-l border-border pl-6">
                  {journey.map((j) => (
                    <li key={j.id} className="relative pb-6 last:pb-0">
                      <div className="absolute -left-[29px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-primary bg-background" />
                      <p className="text-sm font-medium capitalize">{j.stage.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(j.occurred_at)}</p>
                      {j.notes && <p className="mt-1 text-sm text-muted-foreground">{j.notes}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          {/* Attendance */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Calendar className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-semibold">Recent Attendance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No attendance records yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attendance.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40">
                      <div>
                        <p className="text-sm font-medium capitalize">{a.attendance_type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">
                          {(a as any).services?.name ?? (a as any).cell_groups?.name ?? (a as any).departments?.name ?? (a as any).events?.title ?? "—"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDateTime(a.check_in_time)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Baptism & membership */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-semibold">Baptism & Membership Info</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Baptism status</p>
                  <p className="mt-1 text-sm font-medium">{member.baptism_status ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Membership date</p>
                  <p className="mt-1 text-sm font-medium">{member.membership_date ? formatDate(member.membership_date) : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
