import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AIChatBox, type Message } from "./AIChatBox";
import { HelpCircle, X } from "lucide-react";

export default function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const ask = trpc.help.ask.useMutation({
    onSuccess: (r) => setMessages((m) => [...m, { role: "assistant", content: r.content }]),
    onError: (e) => setMessages((m) => [...m, { role: "assistant", content: e.message || "Something went wrong. Email clutchmentality76@gmail.com." }]),
  });
  const send = (content: string) => {
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    ask.mutate({ messages: next.slice(-10).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })) });
  };
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-[min(92vw,380px)] rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <span className="font-semibold text-sm">Clutch Help</span>
            <button aria-label="Close help" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
          </div>
          <AIChatBox
            messages={messages}
            onSendMessage={send}
            isLoading={ask.isPending}
            height={420}
            placeholder="Ask about billing, account, features..."
            emptyStateMessage="How can we help?"
            suggestedPrompts={["How do I cancel my subscription?", "Restore my purchase", "Delete my account"]}
          />
        </div>
      )}
      <button
        aria-label="Open help"
        onClick={() => setOpen((o) => !o)}
        className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
