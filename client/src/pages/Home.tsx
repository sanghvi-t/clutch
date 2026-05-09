import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

const SPORTS = [
  "Basketball", "Cricket", "Tennis", "Soccer", "Golf", "Swimming",
  "Baseball", "Rugby", "Volleyball", "Boxing", "Cycling", "Track & Field",
  "Martial Arts", "Ice Hockey", "Darts", "Pickleball", "Pool", "Snooker", "American Football"
];

const FEATURES = [
  {
    icon: "🧠",
    title: "AI Mental Coach",
    desc: "Sport-specific coaching powered by AI. Available 24/7, personalized to your game, your goals, your pressure points.",
  },
  {
    icon: "📋",
    title: "Training Plans",
    desc: "Adaptive 4-week programs built around your sport and skill level. Every session designed to sharpen your mental edge.",
  },
  {
    icon: "📊",
    title: "Performance Analytics",
    desc: "Track focus, confidence, anxiety, and consistency over time. See your mental game improving week by week.",
  },
  {
    icon: "🏆",
    title: "Gamified Progress",
    desc: "Earn XP, unlock achievements, build streaks. Competing against yourself has never been more compelling.",
  },
  {
    icon: "🧘",
    title: "Mental Wellness",
    desc: "Evidence-based breathing, visualization, and focus techniques. Used by elite athletes. Available to everyone.",
  },
  {
    icon: "👥",
    title: "Athlete Community",
    desc: "Connect with athletes across your sport. Share breakthroughs, join challenges, rise together.",
  },
];

const TESTIMONIALS = [
  {
    quote: "My pre-shot routine used to fall apart under pressure. Now it's the most reliable part of my game.",
    name: "Marcus T.",
    sport: "Pool Player",
    avatar: "M",
  },
  {
    quote: "I've worked with sports psychologists. Clutch gives me that level of coaching every single day.",
    name: "Priya S.",
    sport: "Cricket — Batsman",
    avatar: "P",
  },
  {
    quote: "The anxiety management tools alone are worth it. My tournament nerves are completely different now.",
    name: "James R.",
    sport: "Golf — Competitive",
    avatar: "J",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={s.root}>
      {/* Background effects */}
      <div style={s.heroBg} />
      <div style={s.heroGlow} />

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.navLogo}>
            <span style={s.navLogoIcon}>⚡</span>
            <span style={s.navLogoText}>CLUTCH</span>
          </div>
          <div style={s.navLinks}>
            {isAuthenticated ? (
              <Link href="/dashboard" style={s.navCta}>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()} style={s.navSignIn}>Sign In</a>
                <a href={getLoginUrl()} style={s.navCta}>Start Free →</a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroBadge}>
            <span style={s.heroBadgeDot} />
            NOW IN EARLY ACCESS — LIMITED CHARTER SPOTS
          </div>

          <h1 style={s.heroTitle}>
            The mental edge<br />
            <span style={s.heroTitleGold}>every athlete</span><br />
            deserves.
          </h1>

          <p style={s.heroSubtitle}>
            AI-powered mental performance coaching for recreational and competitive athletes.
            Your sport. Your goals. Your champion mindset — built one session at a time.
          </p>

          <div style={s.heroCtas}>
            <a href={getLoginUrl()} style={s.heroCtaPrimary}>
              Start Your Journey — Free
            </a>
            <a href="#features" style={s.heroCtaSecondary}>
              See How It Works ↓
            </a>
          </div>

          {/* Sport ticker */}
          <div style={s.ticker}>
            <div style={s.tickerLabel}>20 SPORTS</div>
            <div style={s.tickerTrack}>
              <div style={s.tickerItems}>
                {[...SPORTS, ...SPORTS].map((sport, i) => (
                  <span key={i} style={s.tickerItem}>{sport}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <div style={s.proofBar}>
        <div style={s.proofInner}>
          {[
            { val: "20", label: "Sports" },
            { val: "94%", label: "Report Improvement" },
            { val: "4.9★", label: "Athlete Rating" },
            { val: "24/7", label: "AI Coach Access" },
          ].map((stat, i) => (
            <div key={i} style={s.proofStat}>
              <div style={s.proofVal}>{stat.val}</div>
              <div style={s.proofLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionMeta}>WHAT CLUTCH DOES</div>
          <h2 style={s.sectionTitle}>
            Everything your mental game needs.<br />Nothing it doesn't.
          </h2>
          <div style={s.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={s.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BIG STATEMENT */}
      <section style={s.statement}>
        <div style={s.statementInner}>
          <div style={s.statementMeta}>THE CLUTCH PHILOSOPHY</div>
          <blockquote style={s.statementQuote}>
            "Physical training gets you to the competition.<br />
            <span style={s.statementGold}>Mental training wins it."</span>
          </blockquote>
          <p style={s.statementBody}>
            Elite athletes have had access to sports psychologists and mental coaches for decades.
            Clutch brings that same level of mental performance coaching to every athlete —
            regardless of sport, level, or budget.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionMeta}>ATHLETE STORIES</div>
          <h2 style={s.sectionTitle}>Real athletes. Real results.</h2>
          <div style={s.testimonialsGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={s.testimonialCard}>
                <div style={s.testimonialQuote}>"{t.quote}"</div>
                <div style={s.testimonialAuthor}>
                  <div style={s.testimonialAvatar}>{t.avatar}</div>
                  <div>
                    <div style={s.testimonialName}>{t.name}</div>
                    <div style={s.testimonialSport}>{t.sport}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARTER CTA */}
      <section style={s.charterSection}>
        <div style={s.charterGlow} />
        <div style={s.charterInner}>
          <div style={s.charterBadge}>⚡ LIMITED OFFER</div>
          <h2 style={s.charterTitle}>Become a Charter Member</h2>
          <p style={s.charterSubtitle}>
            Join as a founding member and get lifetime Elite access for a single one-time payment.
            Shape the product. Lock in your price forever.
          </p>
          <div style={s.charterPerks}>
            {[
              "Lifetime Elite access — never pay again",
              "All 20 sports + future sports added",
              "Unlimited AI coaching sessions",
              "Priority feature requests",
              "Founding member recognition",
            ].map((perk, i) => (
              <div key={i} style={s.charterPerk}>
                <span style={s.charterPerkCheck}>✓</span>
                {perk}
              </div>
            ))}
          </div>
          <a href={getLoginUrl()} style={s.charterCta}>
            Claim Your Charter Spot →
          </a>
          <div style={s.charterNote}>Limited spots available. No subscription. One-time payment.</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerLogo}>
            <span>⚡</span>
            <span style={s.footerLogoText}>CLUTCH</span>
          </div>
          <div style={s.footerTagline}>
            Mental performance coaching for every athlete.
          </div>
          <div style={s.footerCopy}>© 2025 Clutch. All rights reserved.</div>
        </div>
      </footer>

      {/* Ticker animation */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ticker-items {
          animation: ticker 30s linear infinite;
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#08090D",
    color: "#FFFFFF",
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    overflowX: "hidden",
  },

  // Background
  heroBg: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse 100% 80% at 50% -20%, rgba(245,184,0,0.07) 0%, transparent 60%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  heroGlow: {
    position: "fixed",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: 800,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(ellipse, rgba(245,184,0,0.04) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  // Nav
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(8,9,13,0.85)",
    backdropFilter: "blur(20px)",
  },
  navInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 32px",
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  navLogoIcon: {
    fontSize: 18,
  },
  navLogoText: {
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: "0.15em",
    color: "#F5B800",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  navSignIn: {
    fontSize: 14,
    fontWeight: 500,
    color: "rgba(255,255,255,0.5)",
    textDecoration: "none",
  },
  navCta: {
    fontSize: 14,
    fontWeight: 700,
    color: "#000",
    background: "#F5B800",
    padding: "8px 20px",
    borderRadius: 8,
    textDecoration: "none",
    letterSpacing: "0.02em",
  },

  // Hero
  hero: {
    paddingTop: 140,
    paddingBottom: 80,
    position: "relative",
    zIndex: 1,
  },
  heroInner: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "0 32px",
    textAlign: "center",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "#F5B800",
    border: "1px solid rgba(245,184,0,0.25)",
    padding: "6px 16px",
    borderRadius: 100,
    marginBottom: 32,
    background: "rgba(245,184,0,0.06)",
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#F5B800",
    display: "inline-block",
  },
  heroTitle: {
    fontSize: 72,
    fontWeight: 900,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    margin: "0 0 24px",
    color: "#FFFFFF",
  },
  heroTitleGold: {
    background: "linear-gradient(135deg, #F5B800, #FF6B00)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.7,
    maxWidth: 580,
    margin: "0 auto 40px",
  },
  heroCtas: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 60,
  },
  heroCtaPrimary: {
    padding: "16px 36px",
    background: "linear-gradient(135deg, #F5B800, #FF8C00)",
    borderRadius: 12,
    color: "#000",
    fontSize: 16,
    fontWeight: 800,
    textDecoration: "none",
    boxShadow: "0 8px 40px rgba(245,184,0,0.3)",
    letterSpacing: "0.01em",
  },
  heroCtaSecondary: {
    padding: "16px 32px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontWeight: 600,
    textDecoration: "none",
  },

  // Ticker
  ticker: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    overflow: "hidden",
  },
  tickerLabel: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.15em",
    color: "#F5B800",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  tickerTrack: {
    overflow: "hidden",
    flex: 1,
    maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
  },
  tickerItems: {
    display: "flex",
    gap: 0,
    animation: "ticker 30s linear infinite",
    width: "max-content",
  },
  tickerItem: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.25)",
    padding: "0 20px",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    whiteSpace: "nowrap",
  },

  // Proof bar
  proofBar: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
    position: "relative",
    zIndex: 1,
  },
  proofInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "28px 32px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 24,
    textAlign: "center",
  },
  proofStat: {},
  proofVal: {
    fontSize: 32,
    fontWeight: 900,
    color: "#F5B800",
    letterSpacing: "-0.02em",
    lineHeight: 1,
    marginBottom: 4,
  },
  proofLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },

  // Sections
  section: {
    padding: "100px 0",
    position: "relative",
    zIndex: 1,
  },
  sectionInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 32px",
  },
  sectionMeta: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "#F5B800",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 44,
    fontWeight: 900,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    margin: "0 0 56px",
    color: "#FFFFFF",
  },

  // Features
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },
  featureCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "28px 24px",
    transition: "border-color 0.2s ease",
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  featureDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.65,
  },

  // Statement
  statement: {
    padding: "100px 0",
    background: "rgba(245,184,0,0.03)",
    borderTop: "1px solid rgba(245,184,0,0.08)",
    borderBottom: "1px solid rgba(245,184,0,0.08)",
    position: "relative",
    zIndex: 1,
  },
  statementInner: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "0 32px",
    textAlign: "center",
  },
  statementMeta: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "#F5B800",
    marginBottom: 24,
  },
  statementQuote: {
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1.3,
    color: "rgba(255,255,255,0.9)",
    margin: "0 0 24px",
    fontStyle: "normal",
    letterSpacing: "-0.01em",
  },
  statementGold: {
    color: "#F5B800",
  },
  statementBody: {
    fontSize: 16,
    color: "rgba(255,255,255,0.4)",
    lineHeight: 1.7,
  },

  // Testimonials
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },
  testimonialCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 24,
  },
  testimonialQuote: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.7,
    fontStyle: "italic",
  },
  testimonialAuthor: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #F5B800, #FF6B00)",
    color: "#000",
    fontSize: 14,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  testimonialSport: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    marginTop: 2,
  },

  // Charter
  charterSection: {
    padding: "120px 0",
    position: "relative",
    overflow: "hidden",
    zIndex: 1,
  },
  charterGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(ellipse, rgba(245,184,0,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  charterInner: {
    maxWidth: 600,
    margin: "0 auto",
    padding: "0 32px",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  charterBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.15em",
    color: "#F5B800",
    border: "1px solid rgba(245,184,0,0.3)",
    padding: "6px 16px",
    borderRadius: 100,
    marginBottom: 24,
    background: "rgba(245,184,0,0.06)",
  },
  charterTitle: {
    fontSize: 48,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    margin: "0 0 16px",
    color: "#FFFFFF",
  },
  charterSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.7,
    marginBottom: 36,
  },
  charterPerks: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 40,
    textAlign: "left",
  },
  charterPerk: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
  },
  charterPerkCheck: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "rgba(245,184,0,0.15)",
    color: "#F5B800",
    fontSize: 11,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  charterCta: {
    display: "block",
    padding: "18px 40px",
    background: "linear-gradient(135deg, #F5B800, #FF8C00)",
    borderRadius: 14,
    color: "#000",
    fontSize: 17,
    fontWeight: 800,
    textDecoration: "none",
    boxShadow: "0 12px 50px rgba(245,184,0,0.35)",
    letterSpacing: "0.01em",
    marginBottom: 16,
  },
  charterNote: {
    fontSize: 13,
    color: "rgba(255,255,255,0.25)",
  },

  // Footer
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "40px 0",
    position: "relative",
    zIndex: 1,
  },
  footerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 32px",
    textAlign: "center",
  },
  footerLogo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    fontSize: 18,
  },
  footerLogoText: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.15em",
    color: "#F5B800",
  },
  footerTagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.25)",
    marginBottom: 8,
  },
  footerCopy: {
    fontSize: 12,
    color: "rgba(255,255,255,0.15)",
  },
};
