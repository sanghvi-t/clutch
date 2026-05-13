import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  User,
  Crown,
  Zap,
  Star,
  Trophy,
  Flame,
  Target,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const SPORTS = ["pool", "snooker", "pickleball", "basketball", "baseball", "golf", "american football", "soccer"];

function ManageSubscriptionButton() {
  const portalSession = trpc.stripe.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) => alert("Error: " + err.message),
  });
  return (
    <Button
      size="sm"
      variant="outline"
      className="border-border/60 text-xs"
      disabled={portalSession.isPending}
      onClick={() => portalSession.mutate()}
    >
      {portalSession.isPending ? "Loading..." : "Manage / Cancel"}
    </Button>
  );
}

export default function Profile() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const utils = trpc.useUtils();

  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscription } = trpc.profile.getSubscription.useQuery(undefined, { enabled: isAuthenticated });
  const { data: gamification } = trpc.gamification.getStatus.useQuery(undefined, { enabled: isAuthenticated });

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      utils.profile.get.invalidate();
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
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to view your profile</h2>
          <Button className="bg-primary text-primary-foreground" asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const tier = subscription?.tier || "free";
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const streakDays = profile?.streakDays || 0;
  const earnedAchievements = gamification?.userAchievements || [];

  const tierConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    free: { label: "Free", icon: Star, color: "text-muted-foreground", bg: "bg-secondary/50" },
    pro: { label: "Pro", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
    elite: { label: "Elite", icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10" },
  };

  const currentTier = tierConfig[tier] || tierConfig.free;
  const TierIcon = currentTier.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="pt-20 pb-16">
        <div className="container max-w-3xl">
          <div className="py-8">
            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Profile</h1>
          </div>

          <div className="space-y-6">
            {/* User Card */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold truncate">{user?.name || "Athlete"}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${currentTier.bg} ${currentTier.color}`}>
                      <TierIcon className="w-3 h-3" />
                      {currentTier.label} Plan
                    </div>
                    {profile?.skillLevel && (
                      <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground capitalize">
                        {profile.skillLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Zap, label: "Total XP", value: xp.toLocaleString(), color: "text-primary" },
                { icon: Flame, label: "Streak", value: `${streakDays} days`, color: "text-orange-400" },
                { icon: Trophy, label: "Achievements", value: earnedAchievements.length, color: "text-amber-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4 text-center">
                  <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Sport Preferences */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Sport Preferences
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Primary sport: <span className="text-foreground capitalize">{profile?.primarySport || "Not set"}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {SPORTS.map((sport) => {
                  const isSelected = profile?.sports?.includes(sport) || profile?.primarySport === sport;
                  return (
                    <span
                      key={sport}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${
                        isSelected
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border/40 text-muted-foreground"
                      }`}
                    >
                      {sport}
                    </span>
                  );
                })}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-4 border-border/60 text-xs"
                asChild
              >
                <Link href="/onboarding">Update Preferences</Link>
              </Button>
            </div>

            {/* Subscription */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Subscription
              </h3>
              <div className={`flex items-center justify-between p-4 rounded-lg ${currentTier.bg} border border-current/20 mb-4`}>
                <div className="flex items-center gap-3">
                  <TierIcon className={`w-5 h-5 ${currentTier.color}`} />
                  <div>
                    <div className={`font-semibold ${currentTier.color}`}>{currentTier.label} Plan</div>
                    <div className="text-xs text-muted-foreground">
                      {tier === "free" ? "Free forever" : tier === "pro" ? "$19/month" : "$49/month"}
                    </div>
                  </div>
                </div>
                {tier !== "elite" && (
                  <Button size="sm" className="bg-primary text-primary-foreground text-xs" asChild>
                    <Link href="/pricing">
                      {tier === "free" ? "Upgrade to Pro" : "Upgrade to Elite"}
                    </Link>
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground space-y-1 mb-4">
                {tier === "free" && (
                  <p>Upgrade to Pro to unlock AI coaching, adaptive training plans, and full gamification.</p>
                )}
                {tier === "pro" && (
                  <p>Upgrade to Elite for priority AI responses, advanced analytics, and professional referrals.</p>
                )}
                {tier === "elite" && (
                  <p>You have full access to all Clutch features. Thank you for being an Elite member.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-border/60 text-xs" asChild>
                  <Link href="/pricing">View All Plans</Link>
                </Button>
                {tier !== "free" && <ManageSubscriptionButton />}
              </div>
            </div>

            {/* Sign Out */}
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 w-full text-sm text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <LogOut className="w-4 h-4" />
                Sign out of Clutch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
