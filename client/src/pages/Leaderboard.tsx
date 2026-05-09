import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Trophy, Crown, Medal, Flame, Zap, Star } from "lucide-react";

const SPORTS = ["all", "pool", "snooker", "pickleball", "basketball", "baseball", "golf", "american football", "soccer"];

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
}

export default function Leaderboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedSport, setSelectedSport] = useState("all");

  const { data: leaderboard, isLoading } = trpc.gamification.getLeaderboard.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

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
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to view the Leaderboard</h2>
          <Button className="bg-primary text-primary-foreground" asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const entries = leaderboard || [];
  const currentUserEntry = entries.find((e) => e.name === user?.name);
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="pt-20 pb-16">
        <div className="container max-w-3xl">
          {/* Header */}
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <Trophy className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Leaderboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Top mental performance athletes ranked by XP earned.
            </p>
          </div>

          {/* Sport Filter */}
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {SPORTS.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all ${
                  selectedSport === sport
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {sport === "all" ? "All Sports" : sport}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
              <p className="text-sm text-muted-foreground">Complete training sessions to earn XP and appear on the leaderboard.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Top 3 Podium */}
              {top3.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    top3[1] ? { ...top3[1], rank: 2, height: "h-24" } : null,
                    top3[0] ? { ...top3[0], rank: 1, height: "h-32" } : null,
                    top3[2] ? { ...top3[2], rank: 3, height: "h-20" } : null,
                  ].map((entry, i) => {
                    if (!entry) return <div key={i} />;
                    const isCurrentUser = entry.name === user?.name;
                    return (
                      <div
                        key={entry.rank}
                        className={`flex flex-col items-center justify-end p-3 rounded-xl border transition-all ${
                          entry.rank === 1
                            ? "border-amber-400/40 bg-amber-400/5"
                            : isCurrentUser
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/50 bg-card"
                        } ${entry.height}`}
                      >
                        <RankIcon rank={entry.rank} />
                        <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center my-2">
                          <span className="text-sm font-bold text-primary">
                            {entry.name?.charAt(0)?.toUpperCase() || "A"}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-center truncate w-full">{entry.name}</div>
                        <div className="text-xs text-primary font-bold">{entry.xp?.toLocaleString()} XP</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full Rankings */}
              <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                {entries.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentUser = entry.name === user?.name;
                  return (
                    <div
                      key={entry.userId || index}
                      className={`flex items-center gap-4 p-4 border-b border-border/30 last:border-0 transition-colors ${
                        isCurrentUser ? "bg-primary/5" : "hover:bg-secondary/20"
                      }`}
                    >
                      <div className="w-8 flex items-center justify-center flex-shrink-0">
                        <RankIcon rank={rank} />
                      </div>
                      <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {entry.name?.charAt(0)?.toUpperCase() || "A"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm truncate ${isCurrentUser ? "text-primary" : ""}`}>
                            {entry.name}
                            {isCurrentUser && " (You)"}
                          </span>
                          {entry.streakDays > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-orange-400">
                              <Flame className="w-3 h-3" />
                              {entry.streakDays}d
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground capitalize">
                            Multi-sport
                          </span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground capitalize">
                            Athlete
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <Zap className="w-3 h-3 text-primary" />
                          <span className="font-bold text-sm text-primary">{entry.xp?.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Lv. {entry.level || 1}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current user position if not in top list */}
              {currentUserEntry && !entries.slice(0, 10).find((e) => e.name === user?.name) && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-4">
                  <div className="text-sm font-bold text-primary">Your Rank</div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{currentUserEntry.xp?.toLocaleString()} XP</div>
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    #{entries.indexOf(currentUserEntry) + 1}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
