import { Check, Inbox, Mail, Phone, Trash2, UserRound } from "lucide-react";
import { approveJoinRequest, deleteJoinRequest } from "@/actions/ministry-join";
import { getJoinRequests } from "@/lib/queries/ministry-join";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
} as const;

export default async function JoinRequestsPage() {
  const requests = await getJoinRequests();
  const pending = requests.filter((request) => request.status === "pending").length;

  return (
    <div>
      <PageHeader
        title="Ministry join requests"
        description="Review people who have asked to connect with a ministry."
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="All requests" value={requests.length} description="Submitted from the public website" icon={Inbox} iconTone="primary" />
        <StatCard title="Pending" value={pending} description="Needs a response" icon={UserRound} iconTone="amber" />
        <StatCard title="Connected" value={requests.filter((request) => request.status === "approved").length} description="Approved requests" icon={Mail} iconTone="emerald" />
      </div>

      {requests.length === 0 ? (
        <Card className="p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-semibold">No join requests yet</p>
          <p className="mt-1 text-sm text-muted-foreground">New ministry connection requests will appear here.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{request.name}</h2>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {statusLabels[request.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.department_name ?? "General ministry interest"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.created_at))}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {request.email && <a href={`mailto:${request.email}`} className="inline-flex items-center gap-2 hover:text-foreground"><Mail className="h-4 w-4" />{request.email}</a>}
                {request.phone && <a href={`tel:${request.phone}`} className="inline-flex items-center gap-2 hover:text-foreground"><Phone className="h-4 w-4" />{request.phone}</a>}
              </div>
              {request.message && <p className="mt-4 rounded-lg bg-muted/50 p-3 text-sm leading-6 text-muted-foreground">{request.message}</p>}

              {request.status !== "approved" && (
                <div className="mt-5 flex flex-wrap gap-2">
                  <form action={approveJoinRequest.bind(null, request.id)}>
                    <Button type="submit" size="sm" className="gap-2">
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>
                  </form>
                  <form action={deleteJoinRequest.bind(null, request.id)}>
                    <Button type="submit" size="sm" variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </form>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
