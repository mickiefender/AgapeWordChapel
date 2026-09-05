import { Mail, MessageSquare, Reply, Sparkles } from "lucide-react";
import { getContactMessages } from "@/lib/queries/contact-messages";
import { PageHeader, StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function ContactMessagesPage() {
  const messages = await getContactMessages();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Contact Messages" description="Review messages submitted through the public contact page." />
      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total messages" value={messages.length} description="All contact enquiries" icon={MessageSquare} iconTone="primary" />
        <StatCard title="New messages" value={messages.filter((message) => message.status === "new").length} description="Waiting for attention" icon={Sparkles} iconTone="amber" />
        <StatCard title="Replied" value={messages.filter((message) => message.status === "replied").length} description="Messages marked replied" icon={Reply} iconTone="emerald" />
      </div>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No contact messages yet.</div>
        ) : messages.map((message) => (
          <article key={message.id} className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><h2 className="font-semibold">{message.subject}</h2><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">{message.status}</span></div>
                <p className="mt-2 text-sm text-muted-foreground">{message.sender_name} · <a href={`mailto:${message.sender_email}`} className="hover:text-primary">{message.sender_email}</a></p>
              </div>
              <time className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString()}</time>
            </div>
            <p className="mt-4 whitespace-pre-wrap border-t border-border/70 pt-4 text-sm leading-7 text-foreground/80">{message.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
