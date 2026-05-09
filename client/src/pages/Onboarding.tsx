import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const SPORTS = [
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "soccer", name: "Soccer", emoji: "⚽" },
  { id: "cricket", name: "Cricket", emoji: "🏏" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "golf", name: "Golf", emoji: "⛳" },
  { id: "swimming", name: "Swimming", emoji: "🏊" },
  { id: "baseball", name: "Baseball", emoji: "⚾" },
  { id: "american football", name: "American Football", emoji: "🏈" },
  { id: "rugby", name: "Rugby", emoji: "🏉" },
  { id: "volleyball", name: "Volleyball", emoji: "🏐" },
  { id: "boxing", name: "Boxing / MMA", emoji: "🥊" },
  { id: "cycling", name: "Cycling", emoji: "🚴" },
  { id: "athletics", name: "Track & Field", emoji: "🏃" },
  { id: "martial arts", name: "Martial Arts", emoji: "🥋" },
  { id: "ice hockey", name: "Ice Hockey", emoji: "🏒" },
  { id: "darts", name: "Darts", emoji: "🎯" },
  { id: "pickleball", name: "Pickleball", emoji: "🏓" },
  { id: "pool", name: "Pool", emoji: "🎱" },
  { id: "snooker", name: "Snooker", emoji: "🎱" },
];

const SKILL_LEVELS = [
  {
    id: "amateur",
    label: "Recreational",
    sublabel: "I play for passion",
    description: "You play for the love of the game. Build mental resilience and enjoy every session more.",
    icon: "🌱",
  },
  {
    id: "competitive",
    label: "Competitive",
    sublabel: "I play to win",
    description: "You compete regularly. Sharpen focus, manage pressure, and perform when it matters most.",
    icon: "⚡",
  },
];

const GOALS = [
  { id: "pressure", label: "Perform under pressure", icon: "🎯" },
  { id: "anxiety", label: "Manage competition anxiety", icon: "🧘" },
  { id: "focus", label: "Improve focus & concentration", icon: "🔍" },
  { id: "confidence", label: "Build unshakeable confidence", icon: "💪" },
  { id: "mistakes", label: "Recover faster from mistakes", icon: "⚡" },
  { id: "routine", label: "Develop a pre-performance routine", icon: "🔄" },
  { id: "consistency", label: "Achieve consistent performance", icon: "📈" },
  { id: "mindset", label: "Develop a champion mindset", icon: "🏆" },
];

export default function Onboarding() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [primarySport, setPrimarySport] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<"amateur" | "competitive">("amateur");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const completeOnboarding = trpc.profile.completeOnboarding.useMutation({
    onSuccess: () => {
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const goToStep = (next: number) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 200);
  };

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) => {
      const next = prev.includes(sportId)
        ? prev.filter((s) => s !== sportId)
        : [...prev, sportId];
      if (!primarySport && next.length > 0) setPrimarySport(next[0]);
      if (prev.includes(sportId) && primarySport === sportId) {
        setPrimarySport(next[0] || "");
      }
      return next;
    });
    if (!primarySport) setPrimarySport(sportId);
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  const handleFinish = () => {
    if (selectedSports.length === 0) {
      toast.error("Please select at least one sport.");
      return;
    }
    const goalLabels = selectedGoals
      .map((id) => GOALS.find((g) => g.id === id)?.label)
      .filter(Boolean)
      .join(", ");
    completeOnboarding.mutate({
      primarySport: primarySport || selectedSports[0],
      sports: selectedSports,
      skillLevel,
      goals: goalLabels,
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.authScreen}>
        <div style={styles.authCard}>
          <div style={styles.logo}>⚡</div>
          <h2 style={styles.authTitle}>Sign in to Clutch</h2>
          <p style={styles.authSubtitle}>Begin your mental performance journey.</p>
          <a href={getLoginUrl()} style={styles.authButton}>
            Continue with Google
          </a>
        </div>
      </div>
    );
  }

  const progress = ((step - 1) / 3) * 100;

  return (
    <div style={styles.root}>
      {/* Background */}
      <div style={styles.bg} />
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoMark}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={styles.logoText}>CLUTCH</span>
        </div>
        <div style={styles.stepIndicator}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                ...styles.stepDot,
                ...(step === n ? styles.stepDotActive : {}),
                ...(step > n ? styles.stepDotDone : {}),
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {/* Content */}
      <div
        style={{
          ...styles.content,
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(12px)" : "translateY(0)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        {/* STEP 1: Sports */}
        {step === 1 && (
          <div style={styles.stepWrapper}>
            <div style={styles.stepMeta}>STEP 1 OF 3</div>
            <h1 style={styles.stepTitle}>What's your arena?</h1>
            <p style={styles.stepSubtitle}>
              Select every sport you play. Your AI coach will speak your language.
            </p>

            <div style={styles.sportsGrid}>
              {SPORTS.map((sport) => {
                const isSelected = selectedSports.includes(sport.id);
                const isPrimary = primarySport === sport.id;
                return (
                  <button
                    key={sport.id}
                    onClick={() => toggleSport(sport.id)}
                    style={{
                      ...styles.sportCard,
                      ...(isSelected ? styles.sportCardSelected : {}),
                    }}
                  >
                    {isPrimary && isSelected && (
                      <div style={styles.primaryBadge}>PRIMARY</div>
                    )}
                    <div style={styles.sportEmoji}>{sport.emoji}</div>
                    <div style={styles.sportName}>{sport.name}</div>
                    {isSelected && <div style={styles.sportCheck}>✓</div>}
                  </button>
                );
              })}
            </div>

            {selectedSports.length > 1 && (
              <div style={styles.primarySection}>
                <p style={styles.primaryLabel}>Tap to set primary sport:</p>
                <div style={styles.primaryPills}>
                  {selectedSports.map((id) => {
                    const sport = SPORTS.find((s) => s.id === id);
                    return (
                      <button
                        key={id}
                        onClick={() => setPrimarySport(id)}
                        style={{
                          ...styles.pill,
                          ...(primarySport === id ? styles.pillActive : {}),
                        }}
                      >
                        {sport?.emoji} {sport?.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              style={{
                ...styles.cta,
                ...(selectedSports.length === 0 ? styles.ctaDisabled : {}),
              }}
              disabled={selectedSports.length === 0}
              onClick={() => goToStep(2)}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2: Skill Level */}
        {step === 2 && (
          <div style={styles.stepWrapper}>
            <div style={styles.stepMeta}>STEP 2 OF 3</div>
            <h1 style={styles.stepTitle}>How do you compete?</h1>
            <p style={styles.stepSubtitle}>
              This calibrates the intensity of your mental training program.
            </p>

            <div style={styles.levelGrid}>
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSkillLevel(level.id as "amateur" | "competitive")}
                  style={{
                    ...styles.levelCard,
                    ...(skillLevel === level.id ? styles.levelCardSelected : {}),
                  }}
                >
                  <div style={styles.levelIcon}>{level.icon}</div>
                  <div style={styles.levelLabel}>{level.label}</div>
                  <div style={styles.levelSublabel}>{level.sublabel}</div>
                  <div style={styles.levelDesc}>{level.description}</div>
                  {skillLevel === level.id && (
                    <div style={styles.levelCheck}>✓</div>
                  )}
                </button>
              ))}
            </div>

            <div style={styles.navRow}>
              <button style={styles.backBtn} onClick={() => goToStep(1)}>
                ← Back
              </button>
              <button style={styles.cta} onClick={() => goToStep(3)}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Goals */}
        {step === 3 && (
          <div style={styles.stepWrapper}>
            <div style={styles.stepMeta}>STEP 3 OF 3</div>
            <h1 style={styles.stepTitle}>What's your edge?</h1>
            <p style={styles.stepSubtitle}>
              Choose what matters most. Your coach will target these in every session.
            </p>

            <div style={styles.goalsGrid}>
              {GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    style={{
                      ...styles.goalCard,
                      ...(isSelected ? styles.goalCardSelected : {}),
                    }}
                  >
                    <span style={styles.goalIcon}>{goal.icon}</span>
                    <span style={styles.goalLabel}>{goal.label}</span>
                    {isSelected && <span style={styles.goalCheck}>✓</span>}
                  </button>
                );
              })}
            </div>

            <div style={styles.navRow}>
              <button style={styles.backBtn} onClick={() => goToStep(2)}>
                ← Back
              </button>
              <button
                style={{
                  ...styles.cta,
                  ...(completeOnboarding.isPending ? styles.ctaDisabled : {}),
                }}
                onClick={handleFinish}
                disabled={completeOnboarding.isPending}
              >
                {completeOnboarding.isPending ? "Building your profile..." : "Enter Clutch ⚡"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#08090D",
    color: "#FFFFFF",
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  bg: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,184,0,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgGlow1: {
    position: "fixed",
    top: "30%",
    left: "-10%",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(245,184,0,0.04) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "fixed",
    bottom: "10%",
    right: "-5%",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,107,0,0.04) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 32px",
    position: "relative",
    zIndex: 10,
  },
  logoMark: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: "0.15em",
    color: "#F5B800",
  },
  stepIndicator: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    transition: "all 0.3s ease",
  },
  stepDotActive: {
    width: 24,
    borderRadius: 4,
    background: "#F5B800",
  },
  stepDotDone: {
    background: "rgba(245,184,0,0.4)",
  },
  progressTrack: {
    height: 2,
    background: "rgba(255,255,255,0.06)",
    position: "relative",
    zIndex: 10,
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #F5B800, #FF6B00)",
    transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  content: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "40px 24px 80px",
    position: "relative",
    zIndex: 10,
  },
  stepWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  stepMeta: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "#F5B800",
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 42,
    fontWeight: 800,
    lineHeight: 1.1,
    margin: "0 0 12px",
    letterSpacing: "-0.02em",
    background: "linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.75) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  stepSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 36,
    lineHeight: 1.6,
  },
  sportsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    marginBottom: 24,
  },
  sportCard: {
    position: "relative",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "16px 8px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  sportCardSelected: {
    background: "rgba(245,184,0,0.12)",
    border: "1px solid rgba(245,184,0,0.4)",
  },
  sportEmoji: {
    fontSize: 24,
  },
  sportName: {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 1.3,
  },
  sportCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#F5B800",
    color: "#000",
    fontSize: 9,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBadge: {
    position: "absolute",
    top: -8,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#F5B800",
    color: "#000",
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: "0.1em",
    padding: "2px 6px",
    borderRadius: 4,
    whiteSpace: "nowrap",
  },
  primarySection: {
    marginBottom: 28,
  },
  primaryLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 10,
  },
  primaryPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    padding: "6px 14px",
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  pillActive: {
    background: "#F5B800",
    border: "1px solid #F5B800",
    color: "#000",
  },
  levelGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginBottom: 32,
  },
  levelCard: {
    position: "relative",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "28px 20px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  levelCardSelected: {
    background: "rgba(245,184,0,0.08)",
    border: "1px solid rgba(245,184,0,0.5)",
  },
  levelIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  levelLabel: {
    fontSize: 20,
    fontWeight: 800,
    color: "#FFFFFF",
    letterSpacing: "-0.01em",
  },
  levelSublabel: {
    fontSize: 12,
    color: "#F5B800",
    fontWeight: 600,
    letterSpacing: "0.05em",
    marginBottom: 4,
  },
  levelDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.5,
  },
  levelCheck: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "#F5B800",
    color: "#000",
    fontSize: 11,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  goalsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 32,
  },
  goalCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "16px 20px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.15s ease",
    textAlign: "left",
    position: "relative",
  },
  goalCardSelected: {
    background: "rgba(245,184,0,0.08)",
    border: "1px solid rgba(245,184,0,0.4)",
  },
  goalIcon: {
    fontSize: 20,
    flexShrink: 0,
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: 500,
    color: "rgba(255,255,255,0.85)",
    flex: 1,
  },
  goalCheck: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#F5B800",
    color: "#000",
    fontSize: 10,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  navRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  cta: {
    flex: 1,
    padding: "16px 32px",
    background: "linear-gradient(135deg, #F5B800, #FF8C00)",
    border: "none",
    borderRadius: 12,
    color: "#000",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "all 0.15s ease",
    boxShadow: "0 8px 32px rgba(245,184,0,0.25)",
  },
  ctaDisabled: {
    opacity: 0.35,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  backBtn: {
    padding: "16px 24px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
  },
  loadingScreen: {
    minHeight: "100vh",
    background: "#08090D",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "2px solid rgba(245,184,0,0.2)",
    borderTop: "2px solid #F5B800",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  authScreen: {
    minHeight: "100vh",
    background: "#08090D",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  authCard: {
    textAlign: "center",
    maxWidth: 360,
  },
  logo: {
    fontSize: 40,
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 32,
  },
  authButton: {
    display: "block",
    padding: "14px 32px",
    background: "linear-gradient(135deg, #F5B800, #FF8C00)",
    borderRadius: 12,
    color: "#000",
    fontSize: 15,
    fontWeight: 800,
    textDecoration: "none",
    boxShadow: "0 8px 32px rgba(245,184,0,0.25)",
  },
};
