import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Brain, Lock, Zap, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const SPORTS = ["pool", "snooker", "pickleball", "basketball", "baseball", "golf", "american football", "soccer"];

const SPORT_PROMPTS: Record<string, string[]> = {
  basketball: [
    "Help me with free throw anxiety in clutch moments",
    "How do I stay focused after a turnover?",
    "Build me a pre-game mental routine",
  ],
  golf: [
    "I'm struggling with first tee nerves",
    "How do I recover mentally after a bad hole?",
    "Teach me a pre-shot visualization routine",
  ],
  soccer: [
    "How do I handle penalty kick pressure?",
    "Help me stay composed after conceding a goal",
    "Build my mental resilience for 90-minute focus",
  ],
  default: [
    "Help me perform better under pressure",
    "Teach me a breathing technique for competition",
    "How do I build mental resilience?",
    "Create a pre-performance mental routine for me",
  ],
};

export default function Coach() {
  const { isAuthenticated, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("");

  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscription } = trpc.profile.getSubscription.useQuery(undefined, { enabled: isAuthenticated });
  const { data: history, isLoading: historyLoading } = trpc.coach.getHistory.useQuery(undefined, {
    enabled: isAuthenticated && subscription?.tier !== "free",
    retry: false,
  });

  const sendMessage = trpc.coach.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (profile?.primarySport) setSelectedSport(profile.primarySport);
  }, [profile]);

  useEffect(() => {
    if (history) {
      setMessages(
        history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
      );
    }
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to access your AI Coach</h2>
          <Button className="bg-primary text-primary-foreground" asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const tier = subscription?.tier || "free";
  const isLocked = tier === "free";

  const handleSendMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
    sendMessage.mutate({ message: content, sport: selectedSport || undefined });
  };

  const suggestedPrompts =
    SPORT_PROMPTS[selectedSport] || SPORT_PROMPTS.default;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="pt-20 pb-8">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="py-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    AI Coach
                  </h1>
                  {!isLocked && (
                    <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
                      {tier === "elite" ? "Elite" : "Pro"}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  Your personal mental performance coach — sport-aware, balanced, and always available.
                </p>
              </div>
            </div>
          </div>

          {isLocked ? (
            /* Locked State */
            <div className="rounded-2xl border border-border/50 bg-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                AI Coach is a Pro feature
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6 text-sm leading-relaxed">
                Upgrade to Pro or Elite to unlock unlimited AI coaching conversations, sport-specific guidance, and personalized mental performance strategies.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-primary text-primary-foreground px-8" asChild>
                  <Link href="/pricing">Upgrade to Pro — $19/mo</Link>
                </Button>
                <Button variant="outline" className="border-border/60" asChild>
                  <Link href="/wellness">Try Free Wellness Tips</Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Coach Interface */
            <div className="space-y-4">
              {/* Sport Selector */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Coaching for:</span>
                {SPORTS.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${
                      selectedSport === sport
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>

              {/* Chat Box */}
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <AIChatBox
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={sendMessage.isPending || historyLoading}
                  placeholder={`Ask your coach about ${selectedSport || "mental performance"}...`}
                  height={560}
                  emptyStateMessage={`Your AI Coach is ready. Ask about ${selectedSport || "your sport"}, pressure moments, focus techniques, or anything mental performance related.`}
                  suggestedPrompts={suggestedPrompts}
                />
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 border border-border/30">
                <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground/70">Disclaimer:</strong> Clutch AI Coach provides mental performance guidance for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment from a licensed sports psychologist or mental health professional. If you are experiencing serious mental health concerns, please{" "}
                  <span className="text-primary cursor-pointer hover:underline">consult a licensed professional</span>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
