import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Check, Zap, Crown, Star, Loader2 } from "lucide-react";
import React from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const TIERS = [
  {
    name: "Free",
    tier: null as null | "pro" | "elite" | "charter",
    monthlyPrice: "$0",
    annualPrice: null,
    monthlyPeriod: "forever",
    description: "Start building your mental game with the essentials.",
    icon: Star,
    color: "text-muted-foreground",
    borderColor: "border-border/50",
    bgColor: "bg-card",
    badge: null,
    features: [
      "1 AI Coach message per day",
      "Basic mental performance tips",
      "Sport selection (all 8 sports)",
      "Skill level profiling",
      "Mental wellness articles",
      "Community leaderboard access",
      "Basic progress tracking",
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
  },
  {
    name: "Pro",
    tier: "pro" as const,
    monthlyPrice: "$6.99",
    annualPrice: "$80",
    monthlyPeriod: "per month",
    annualSavings: "5%",
    description: "Unlock the full power of AI coaching and adaptive training.",
    icon: Zap,
    color: "text-primary",
    borderColor: "border-primary/40",
    bgColor: "bg-card",
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Unlimited AI Coach conversations",
      "Adaptive training plans (AI-generated)",
      "Full session tracking & milestones",
      "Advanced progress charts",
      "XP, badges & streak system",
      "Mental wellness AI tips",
      "Community features & teams",
      "Social sharing & referrals",
      "Priority email support",
    ],
    cta: "Start Pro Trial",
    ctaVariant: "default" as const,
  },
  {
    name: "Elite",
    tier: "elite" as const,
    monthlyPrice: "$9.99",
    annualPrice: "$114",
    monthlyPeriod: "per month",
    annualSavings: "5%",
    description: "The complete mental performance suite for serious competitors.",
    icon: Crown,
    color: "text-amber-400",
    borderColor: "border-amber-400/40",
    bgColor: "bg-card",
    badge: "Best Value",
    features: [
      "Everything in Pro",
      "Priority AI Coach responses",
      "Advanced performance analytics & trends",
      "Multi-sport training plans",
      "Video & article recommendations",
      "Referral to licensed sports psychologists",
      "Exclusive Elite leaderboard",
      "Early access to new features",
      "Dedicated support channel",
    ],
    cta: "Go Elite",
    ctaVariant: "default" as const,
  },
];

const FAQ = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    q: "Is there a free trial for Pro or Elite?",
    a: "Yes — Pro comes with a 7-day free trial. No credit card required to start.",
  },
  {
    q: "What sports are supported?",
    a: "Clutch supports pool, snooker, pickleball, basketball, baseball, golf, American football, and soccer — with more coming soon.",
  },
  {
    q: "Are the professional referrals included in the price?",
    a: "The Elite tier includes referral access to licensed sports psychologists. Consultation fees are separate and paid directly to the professional.",
  },
  {
    q: "Is the medical advice from Clutch clinically approved?",
    a: "Clutch provides AI-generated mental performance guidance for informational purposes only. All content includes clear medical disclaimers. For clinical support, please consult a licensed professional.",
  },
  {
    q: "What's the difference between monthly and annual billing?",
    a: "Annual plans save you 5% compared to monthly billing. Both monthly and annual plans can be cancelled anytime.",
  },
];

function UpgradeButton({
  tier,
  cta,
  ctaVariant,
  className,
}: {
  tier: "pro" | "elite" | "charter";
  cta: string;
  ctaVariant: "default" | "outline";
  className: string;
}) {
  const { user } = useAuth();
  const createCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  if (!user) {
    return (
      <Button variant={ctaVariant} className={`w-full h-11 font-semibold ${className}`} asChild>
        <a href={getLoginUrl()}>{cta}</a>
      </Button>
    );
  }

  return (
    <Button
      variant={ctaVariant}
      className={`w-full h-11 font-semibold ${className}`}
      disabled={createCheckout.isPending}
      onClick={() => createCheckout.mutate({ tier })}
    >
      {createCheckout.isPending ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting...</>
      ) : (
        cta
      )}
    </Button>
  );
}

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = React.useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="pt-28 pb-24">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10 text-xs uppercase tracking-widest">
              Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Invest in your{" "}
              <span style={{ background: "linear-gradient(135deg, oklch(0.85 0.16 75), oklch(0.70 0.18 55))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                mental edge
              </span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Choose the plan that matches your ambition. All plans include access to all 8 supported sports.
            </p>

            {/* Billing Period Toggle */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  billingPeriod === "annual"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border ${tier.borderColor} ${tier.bgColor} p-8 flex flex-col ${
                  tier.name === "Pro" ? "shadow-2xl shadow-primary/10 scale-[1.02]" : ""
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className={`${tier.name === "Pro" ? "bg-primary text-primary-foreground" : "bg-amber-400 text-amber-900"} px-3 py-0.5 text-xs font-semibold`}>
                      {tier.badge}
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`flex items-center gap-2 mb-3`}>
                    <tier.icon className={`w-5 h-5 ${tier.color}`} />
                    <span className={`text-lg font-bold ${tier.color}`}>{tier.name}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    {billingPeriod === "monthly" ? (
                      <>
                        <span className="text-4xl font-bold text-foreground">{tier.monthlyPrice}</span>
                        <span className="text-sm text-muted-foreground">/{tier.monthlyPeriod}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-foreground">{tier.annualPrice || tier.monthlyPrice}</span>
                        <span className="text-sm text-muted-foreground">/year</span>
                        {tier.annualSavings && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-xs ml-2">
                            Save {tier.annualSavings}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.color}`} />
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.tier ? (
                  <UpgradeButton
                    tier={tier.tier}
                    cta={tier.cta}
                    ctaVariant={tier.ctaVariant}
                    className={
                      tier.name === "Pro"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/20"
                        : "bg-amber-400 text-amber-900 hover:bg-amber-300"
                    }
                  />
                ) : (
                  <Button
                    variant={tier.ctaVariant}
                    className="w-full h-11 font-semibold border-border/60 hover:border-primary/40"
                    asChild
                  >
                    <a href={getLoginUrl()}>{tier.cta}</a>
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Feature Comparison Note */}
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="text-sm text-muted-foreground">
              All plans include a 30-day money-back guarantee. No hidden fees.
              Medical advice features include mandatory disclaimers.
            </p>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {FAQ.map((item) => (
                <div key={item.q} className="border-b border-border/40 pb-6">
                  <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-20">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Button variant="outline" className="border-border/60 hover:border-primary/40">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
