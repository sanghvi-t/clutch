import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import NavBar from "@/components/NavBar";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import {
  Flame,
  Zap,
  Trophy,
  MessageSquare,
  Target,
  TrendingUp,
  Brain,
  ChevronRight,
  Star,
  Crown,
  Lock,
  Activity,
  Calendar,
} from "lucide-react";

const XP_PER_LEVEL = 500;

const ACHIEVEMENT_ICONS: Record<string, React.ElementType> = {
  Trophy,
  Flame,
  Zap,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  Brain,
  Crown,
  Activity,
};

function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-border/50 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground mb-0.5">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: gamification } = trpc.gamification.getStatus.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscription } = trpc.profile.getSubscription.useQuery(undefined, { enabled: isAuthenticated });
  const { data: plans } = trpc.training.getPlans.useQuery(undefined, { enabled: isAuthenticated });
  const { data: sessionLogs } = trpc.training.getSessionLogs.useQuery(undefined, { enabled: isAuthenticated });

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
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to access your dashboard</h2>
          <Button className="bg-primary text-primary-foreground" asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  if (profile && !profile.onboardingCompleted) {
    navigate("/onboarding");
    return null;
  }

  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const xpProgress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;
  const streakDays = profile?.streakDays || 0;
  const tier = subscription?.tier || "free";
  const earnedAchievements = gamification?.userAchievements || [];
  const allAchievements = gamification?.allAchievements || [];
  const activePlan = plans?.[0];
  const recentSessions = sessionLogs?.slice(0, 5) || [];

  const tierColors: Record<string, string> = {
    free: "text-muted-foreground",
    pro: "text-primary",
    elite: "text-amber-400",
  };

  const tierLabels: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    elite: "Elite",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="pt-20 pb-16">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-8">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Welcome back, {user?.name?.split(" ")[0] || "Athlete"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {profile?.primarySport ? `${profile.primarySport.charAt(0).toUpperCase() + profile.primarySport.slice(1)} · ` : ""}
                {profile?.skillLevel ? profile.skillLevel.charAt(0).toUpperCase() + profile.skillLevel.slice(1) : ""}
                {" · "}
                <span className={tierColors[tier]}>{tierLabels[tier]} Plan</span>
              </p>
            </div>
            <div className="flex gap-2">
              {tier === "free" && (
                <Button size="sm" className="bg-primary text-primary-foreground" asChild>
                  <Link href="/pricing">Upgrade to Pro</Link>
                </Button>
              )}
              <Button size="sm" variant="outline" className="border-border/60" asChild>
                <Link href="/training">Start Session</Link>
              </Button>
            </div>
          </div>

          {/* XP & Level Bar */}
          <div className="mb-6 p-5 rounded-xl border border-border/50 bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{level}</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Level {level}</div>
                  <div className="text-xs text-muted-foreground">{xpInCurrentLevel} / {XP_PER_LEVEL} XP to next level</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">{xp.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total XP</div>
              </div>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Flame}
              label="Streak"
              value={`${streakDays}d`}
              sub={streakDays > 0 ? "Keep it going!" : "Start today"}
              color="text-orange-400"
            />
            <StatCard
              icon={Trophy}
              label="Achievements"
              value={earnedAchievements.length}
              sub={`of ${allAchievements.length} total`}
              color="text-primary"
            />
            <StatCard
              icon={Target}
              label="Sessions"
              value={recentSessions.length}
              sub="completed"
              color="text-emerald-400"
            />
            <StatCard
              icon={Activity}
              label="Active Plan"
              value={activePlan ? "1" : "0"}
              sub={activePlan ? activePlan.sport : "No active plan"}
              color="text-blue-400"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Training Plan */}
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Active Training Plan
                  </h3>
                  <Link href="/training">
                    <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                      View all <ChevronRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>

                {activePlan ? (
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium">{activePlan.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {activePlan.sport} · {activePlan.difficulty}
                        </div>
                      </div>
                      <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Progress</span>
                        <span>{activePlan.completedSessions}/{activePlan.totalSessions} sessions</span>
                      </div>
                      <Progress
                        value={activePlan.totalSessions > 0 ? (activePlan.completedSessions / activePlan.totalSessions) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                    <Button size="sm" className="bg-primary text-primary-foreground" asChild>
                      <Link href="/training">Continue Plan</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">No active training plan yet.</p>
                    {tier === "free" ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Lock className="w-3 h-3" />
                          <span>Training plans require Pro or Elite</span>
                        </div>
                        <Button size="sm" className="bg-primary text-primary-foreground" asChild>
                          <Link href="/pricing">Upgrade to Pro</Link>
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" className="bg-primary text-primary-foreground" asChild>
                        <Link href="/training">Generate Plan</Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Sessions */}
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Recent Sessions
                  </h3>
                </div>
                {recentSessions.length > 0 ? (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div>
                          <div className="text-sm font-medium capitalize">{session.type || "Session"}</div>
                          <div className="text-xs text-muted-foreground">
                            {session.sport} · {session.durationMinutes}min
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-primary">+{session.xpEarned} XP</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(session.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No sessions yet. Complete your first training session!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: MessageSquare, label: "Chat with AI Coach", href: "/coach", locked: tier === "free" },
                    { icon: Brain, label: "Mental Wellness Tips", href: "/wellness", locked: false },
                    { icon: TrendingUp, label: "View Progress", href: "/training", locked: false },
                    { icon: Trophy, label: "Leaderboard", href: "/leaderboard", locked: false },
                  ].map((action) => (
                    <Link key={action.label} href={action.locked ? "/pricing" : action.href}>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          {action.locked ? (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <action.icon className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className={`text-sm font-medium flex-1 ${action.locked ? "text-muted-foreground" : "text-foreground"}`}>
                          {action.label}
                        </span>
                        {action.locked ? (
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Pro</Badge>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    Achievements
                  </h3>
                  <span className="text-xs text-muted-foreground">{earnedAchievements.length}/{allAchievements.length}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {allAchievements.slice(0, 8).map((achievement) => {
                    const earned = earnedAchievements.find((ea) => ea.achievementId === achievement.id);
                    const IconComponent = ACHIEVEMENT_ICONS[achievement.icon || "Trophy"] || Trophy;
                    return (
                      <div
                        key={achievement.id}
                        title={`${achievement.title}: ${achievement.description}`}
                        className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                          earned
                            ? "bg-primary/15 border border-primary/30"
                            : "bg-secondary/30 border border-border/30 opacity-40"
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 ${earned ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    );
                  })}
                </div>
                {earnedAchievements.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="text-xs text-muted-foreground">Latest: <span className="text-foreground">{earnedAchievements[0]?.title}</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
