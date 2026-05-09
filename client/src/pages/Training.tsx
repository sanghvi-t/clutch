import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import NavBar from "@/components/NavBar";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link } from "wouter";
import {
  Target,
  Lock,
  Plus,
  CheckCircle,
  Circle,
  Zap,
  TrendingUp,
  Brain,
  Wind,
  Eye,
  Flame,
  ChevronDown,
  ChevronUp,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SPORTS = ["pool", "snooker", "pickleball", "basketball", "baseball", "golf", "american football", "soccer"];

const SESSION_TYPE_ICONS: Record<string, React.ElementType> = {
  visualization: Eye,
  breathing: Wind,
  focus: Target,
  pressure: Zap,
  reflection: Brain,
};

const SESSION_TYPE_COLORS: Record<string, string> = {
  visualization: "text-purple-400",
  breathing: "text-blue-400",
  focus: "text-primary",
  pressure: "text-orange-400",
  reflection: "text-emerald-400",
};

type TrainingSession = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  type: string;
  completed: boolean;
  completedAt?: string;
  week: number;
  day: number;
};

export default function Training() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedSport, setSelectedSport] = useState("basketball");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [completingSession, setCompletingSession] = useState<string | null>(null);
  const [moodAfter, setMoodAfter] = useState(7);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingSport, setGeneratingSport] = useState("basketball");

  const utils = trpc.useUtils();

  const { data: subscription } = trpc.profile.getSubscription.useQuery(undefined, { enabled: isAuthenticated });
  const { data: plans, isLoading: plansLoading } = trpc.training.getPlans.useQuery(undefined, { enabled: isAuthenticated });
  const { data: metrics } = trpc.training.getMetrics.useQuery({ sport: selectedSport }, { enabled: isAuthenticated });

  const generatePlan = trpc.training.generatePlan.useMutation({
    onSuccess: () => {
      toast.success("Training plan generated!");
      utils.training.getPlans.invalidate();
      setShowGenerateModal(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const completeSession = trpc.training.completeSession.useMutation({
    onSuccess: (data) => {
      toast.success(`Session complete! +${data.xpEarned} XP earned`);
      utils.training.getPlans.invalidate();
      setCompletingSession(null);
    },
    onError: (err) => toast.error(err.message),
  });

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
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to access Training</h2>
          <Button className="bg-primary text-primary-foreground" asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const tier = subscription?.tier || "free";
  const isLocked = tier === "free";

  // Build chart data from metrics
  const chartData = metrics
    ? metrics.slice(-14).map((m, i) => ({
        day: `Day ${i + 1}`,
        focus: Math.round(m.value),
      }))
    : [];

  const activePlan = plans?.[0];
  const sessions = (activePlan?.sessions as TrainingSession[]) || [];
  const weeks = Array.from(new Set(sessions.map((s) => s.week))).sort();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="pt-20 pb-16">
        <div className="container max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between py-8">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Training Plans
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Adaptive mental performance training tailored to your sport and progress.
              </p>
            </div>
            {!isLocked && (
              <Button
                className="bg-primary text-primary-foreground"
                onClick={() => setShowGenerateModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Plan
              </Button>
            )}
          </div>

          {isLocked ? (
            <div className="rounded-2xl border border-border/50 bg-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Training Plans require Pro
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6 text-sm">
                Upgrade to Pro or Elite to generate AI-powered adaptive training plans with session tracking and progress analytics.
              </p>
              <Button className="bg-primary text-primary-foreground px-8" asChild>
                <Link href="/pricing">Upgrade to Pro — $19/mo</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Generate Modal */}
              {showGenerateModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-card border border-border/50 rounded-2xl p-8 max-w-md w-full">
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Generate Training Plan</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Our AI will create a 4-week adaptive mental performance plan tailored to your sport.
                    </p>
                    <div className="mb-6">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Select Sport</label>
                      <div className="grid grid-cols-2 gap-2">
                        {SPORTS.map((sport) => (
                          <button
                            key={sport}
                            onClick={() => setGeneratingSport(sport)}
                            className={`p-2.5 rounded-lg border text-sm capitalize transition-all ${
                              generatingSport === sport
                                ? "border-primary/60 bg-primary/10 text-primary"
                                : "border-border/50 text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {sport}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 border-border/60" onClick={() => setShowGenerateModal(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-primary text-primary-foreground"
                        disabled={generatePlan.isPending}
                        onClick={() => generatePlan.mutate({ sport: generatingSport })}
                      >
                        {generatePlan.isPending ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Generate Plan"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Plan */}
              {plansLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activePlan ? (
                <div className="rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold">{activePlan.title}</h2>
                        <Badge variant="outline" className="border-primary/30 text-primary text-xs capitalize">
                          {activePlan.sport}
                        </Badge>
                        <Badge variant="outline" className="border-border/50 text-muted-foreground text-xs capitalize">
                          {activePlan.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{activePlan.description}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Overall Progress</span>
                      <span>{activePlan.completedSessions}/{activePlan.totalSessions} sessions complete</span>
                    </div>
                    <Progress
                      value={activePlan.totalSessions > 0 ? (activePlan.completedSessions / activePlan.totalSessions) * 100 : 0}
                      className="h-2.5"
                    />
                  </div>

                  {/* Sessions by Week */}
                  <div className="space-y-3">
                    {weeks.map((week) => {
                      const weekSessions = sessions.filter((s) => s.week === week);
                      const weekCompleted = weekSessions.filter((s) => s.completed).length;
                      const isExpanded = expandedWeek === week;

                      return (
                        <div key={week} className="border border-border/40 rounded-lg overflow-hidden">
                          <button
                            className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                            onClick={() => setExpandedWeek(isExpanded ? null : week)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                weekCompleted === weekSessions.length
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground"
                              }`}>
                                {weekCompleted === weekSessions.length ? "✓" : week}
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-sm">Week {week}</div>
                                <div className="text-xs text-muted-foreground">{weekCompleted}/{weekSessions.length} sessions</div>
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </button>

                          {isExpanded && (
                            <div className="border-t border-border/40 divide-y divide-border/30">
                              {weekSessions.map((session) => {
                                const IconComponent = SESSION_TYPE_ICONS[session.type] || Target;
                                const iconColor = SESSION_TYPE_COLORS[session.type] || "text-primary";
                                const isCompleting = completingSession === session.id;

                                return (
                                  <div key={session.id} className="p-4">
                                    <div className="flex items-start gap-3">
                                      <div className="mt-0.5">
                                        {session.completed ? (
                                          <CheckCircle className="w-5 h-5 text-primary" />
                                        ) : (
                                          <Circle className="w-5 h-5 text-muted-foreground/40" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <IconComponent className={`w-3.5 h-3.5 ${iconColor}`} />
                                          <span className="font-medium text-sm">{session.title}</span>
                                          <span className="text-xs text-muted-foreground">{session.durationMinutes}min</span>
                                          {session.completed && (
                                            <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 ml-auto">Done</Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{session.description}</p>

                                        {!session.completed && (
                                          <div className="mt-3">
                                            {isCompleting ? (
                                              <div className="space-y-3">
                                                <div>
                                                  <label className="text-xs text-muted-foreground mb-1 block">How do you feel after? (1-10)</label>
                                                  <div className="flex gap-1">
                                                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                                                      <button
                                                        key={n}
                                                        onClick={() => setMoodAfter(n)}
                                                        className={`w-7 h-7 rounded text-xs font-medium transition-all ${
                                                          moodAfter === n
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                                        }`}
                                                      >
                                                        {n}
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                                <div className="flex gap-2">
                                                  <Button
                                                    size="sm"
                                                    className="bg-primary text-primary-foreground"
                                                    disabled={completeSession.isPending}
                                                    onClick={() => completeSession.mutate({
                                                      planId: activePlan.id,
                                                      sessionId: session.id,
                                                      moodAfter,
                                                    })}
                                                  >
                                                    {completeSession.isPending ? "Saving..." : "Mark Complete +50 XP"}
                                                  </Button>
                                                  <Button size="sm" variant="ghost" onClick={() => setCompletingSession(null)}>
                                                    Cancel
                                                  </Button>
                                                </div>
                                              </div>
                                            ) : (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-primary/30 text-primary hover:bg-primary/10 text-xs"
                                                onClick={() => setCompletingSession(session.id)}
                                              >
                                                Complete Session
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
                  <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>No active training plan</h3>
                  <p className="text-sm text-muted-foreground mb-6">Generate your first AI-powered mental performance training plan.</p>
                  <Button className="bg-primary text-primary-foreground" onClick={() => setShowGenerateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Your First Plan
                  </Button>
                </div>
              )}

              {/* Progress Chart */}
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Mental Performance Metrics
                  </h3>
                  <div className="flex gap-2">
                    {SPORTS.slice(0, 4).map((sport) => (
                      <button
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        className={`px-2.5 py-1 rounded text-xs capitalize transition-all ${
                          selectedSport === sport
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>
                </div>

                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.20 0.02 260)" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "oklch(0.55 0.01 260)" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "oklch(0.55 0.01 260)" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.11 0.018 260)",
                          border: "1px solid oklch(0.20 0.02 260)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="focus"
                        stroke="oklch(0.78 0.14 75)"
                        strokeWidth={2}
                        dot={{ fill: "oklch(0.78 0.14 75)", r: 3 }}
                        name="Focus Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Complete sessions to see your progress chart</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
