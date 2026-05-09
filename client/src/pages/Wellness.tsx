import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  Brain,
  Wind,
  Eye,
  Heart,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

const CATEGORIES = [
  { id: "breathing", label: "Breathing", icon: Wind, color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: "focus", label: "Focus", icon: Eye, color: "text-purple-400", bg: "bg-purple-400/10" },
  { id: "anxiety", label: "Anxiety", icon: Heart, color: "text-rose-400", bg: "bg-rose-400/10" },
  { id: "confidence", label: "Confidence", icon: Brain, color: "text-primary", bg: "bg-primary/10" },
  { id: "recovery", label: "Recovery", icon: Sparkles, color: "text-emerald-400", bg: "bg-emerald-400/10" },
];

const SPORTS = ["pool", "snooker", "pickleball", "basketball", "baseball", "golf", "american football", "soccer"];

// Placeholder professional referrals — ready to be activated in a future release
const PROFESSIONALS = [
  {
    name: "Dr. Sarah Mitchell",
    title: "Licensed Sports Psychologist",
    specialty: "Performance anxiety, pre-competition routines",
    sports: ["golf", "tennis", "basketball"],
    available: false, // Future release
  },
  {
    name: "Dr. James Okafor",
    title: "Certified Mental Performance Consultant",
    specialty: "Clutch performance, focus training, team dynamics",
    sports: ["american football", "soccer", "baseball"],
    available: false,
  },
  {
    name: "Dr. Priya Sharma",
    title: "Sports Psychologist & Mindfulness Coach",
    specialty: "Mindfulness, breathing, competitive anxiety",
    sports: ["pool", "snooker", "pickleball"],
    available: false,
  },
];

const STATIC_TIPS = [
  {
    category: "breathing",
    title: "4-7-8 Breathing Technique",
    content: "Inhale for 4 counts, hold for 7, exhale for 8. This activates the parasympathetic nervous system, reducing pre-competition anxiety within minutes.",
  },
  {
    category: "focus",
    title: "The Process Cue",
    content: "Choose one specific, controllable action to focus on before each performance moment. This narrows attention and blocks out distractions.",
  },
  {
    category: "anxiety",
    title: "Reframe Anxiety as Excitement",
    content: "Research shows telling yourself 'I am excited' rather than 'I am nervous' improves performance. Both states share the same physiological signature.",
  },
  {
    category: "confidence",
    title: "Power Posing Before Competition",
    content: "Spend 2 minutes in an expansive, open posture before competing. This has been shown to increase confidence and reduce cortisol levels.",
  },
  {
    category: "recovery",
    title: "The 3-Breath Reset",
    content: "After a mistake, take 3 slow deep breaths before your next action. This breaks the rumination cycle and returns you to the present moment.",
  },
];

export default function Wellness() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("breathing");
  const [selectedSport, setSelectedSport] = useState("basketball");
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [aiTip, setAiTip] = useState<string | null>(null);

  const getTip = trpc.wellness.getTip.useMutation({
    onSuccess: (data) => setAiTip(data.tip),
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
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to access Wellness</h2>
          <Button className="bg-primary text-primary-foreground" asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const filteredTips = STATIC_TIPS.filter((t) => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="pt-20 pb-16">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="py-8">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Mental Wellness
            </h1>
            <p className="text-muted-foreground text-sm">
              Evidence-based techniques for breathing, focus, and anxiety management.
            </p>
          </div>

          {/* Medical Disclaimer Banner */}
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-amber-400/30 bg-amber-400/5">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-400 mb-1">Medical Disclaimer</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The content on this page is provided for informational and educational purposes only. It is not intended as, and shall not be understood as, professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider or licensed sports psychologist before making decisions related to your mental health. If you are experiencing a mental health crisis, please contact emergency services or a crisis helpline immediately.
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? `${cat.bg} border-current ${cat.color}`
                    : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tips Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Static Tips */}
              {filteredTips.map((tip) => {
                const cat = CATEGORIES.find((c) => c.id === tip.category);
                const isExpanded = expandedTip === tip.title;
                return (
                  <div key={tip.title} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/20 transition-colors"
                      onClick={() => setExpandedTip(isExpanded ? null : tip.title)}
                    >
                      <div className="flex items-center gap-3">
                        {cat && (
                          <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center`}>
                            <cat.icon className={`w-4 h-4 ${cat.color}`} />
                          </div>
                        )}
                        <span className="font-semibold text-sm">{tip.title}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-border/30">
                        <p className="text-sm text-muted-foreground leading-relaxed pt-4">{tip.content}</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-3 italic">
                          For informational purposes only. Not a substitute for professional advice.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* AI-Generated Tip */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">AI-Personalized Tip</span>
                    <Badge className="text-[10px] bg-primary/15 text-primary border-primary/20">AI Generated</Badge>
                  </div>
                </div>

                {/* Sport selector for AI tip */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {SPORTS.slice(0, 5).map((sport) => (
                    <button
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={`px-2.5 py-1 rounded text-xs capitalize transition-all ${
                        selectedSport === sport
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>

                {aiTip ? (
                  <div>
                    <div className="text-sm text-foreground/90 leading-relaxed mb-3">
                      <Streamdown>{aiTip}</Streamdown>
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 italic mb-3">
                      AI-generated content. For informational purposes only. Not medical advice.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/30 text-primary text-xs"
                      onClick={() => {
                        setAiTip(null);
                        getTip.mutate({ category: selectedCategory as "breathing" | "focus" | "anxiety" | "visualization" | "pressure", sport: selectedSport });
                      }}
                    >
                      Get Another Tip
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Get a personalized {selectedCategory} tip for {selectedSport}.
                    </p>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground"
                      disabled={getTip.isPending}
                      onClick={() => getTip.mutate({ category: selectedCategory as "breathing" | "focus" | "anxiety" | "visualization" | "pressure", sport: selectedSport })}
                    >
                      {getTip.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </div>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                          Generate Tip
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column — Professional Referrals */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Licensed Professionals</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Connect with certified sports psychologists. Available in a future release.
                </p>

                <div className="space-y-3">
                  {PROFESSIONALS.map((pro) => (
                    <div key={pro.name} className="p-3 rounded-lg border border-border/40 bg-secondary/20">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-medium text-xs">{pro.name}</div>
                        <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground flex-shrink-0">
                          Coming Soon
                        </Badge>
                      </div>
                      <div className="text-[11px] text-primary mb-1">{pro.title}</div>
                      <div className="text-[11px] text-muted-foreground">{pro.specialty}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Professional referral fees are paid directly to the practitioner. Clutch earns a referral commission. All professionals are independently licensed.
                  </p>
                </div>
              </div>

              {/* Crisis Resources */}
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-rose-400" />
                  <h3 className="font-semibold text-sm text-rose-400">Crisis Resources</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  If you are in crisis or need immediate support:
                </p>
                <div className="space-y-2">
                  {[
                    { name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988" },
                    { name: "Crisis Text Line", contact: "Text HOME to 741741" },
                    { name: "SAMHSA Helpline", contact: "1-800-662-4357" },
                  ].map((resource) => (
                    <div key={resource.name} className="text-xs">
                      <div className="font-medium text-foreground/80">{resource.name}</div>
                      <div className="text-muted-foreground">{resource.contact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
