import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addXp,
  bookmarkContent,
  createAthleteProfile,
  createCommunityPost,
  createReferralCode,
  createTrainingPlan,
  followUser,
  getActiveBattlePassSeason,
  getAthleteProfile,
  getBattlePassTiers,
  getBiometricData,
  getChallenges,
  getChatHistory,
  getChatMessageCount,
  getCommunityFeed,
  getContentRecommendations,
  getFollowers,
  getFollowing,
  getFriends,
  getAllAchievements,
  getLeaderboard,
  getMentalPerformanceHistory,
  getPersonalizationPreferences,
  getPublicAthleteProfile,
  getPushNotificationPreferences,
  getReferralCode,
  getTeams,
  getTrainingPlan,
  getUserAchievements,
  getUserBattlePassProgress,
  getUserMetrics,
  getUserProfile,
  getUserSessionLogs,
  getUserSubscription,
  getUserTrainingPlans,
  getWearableDevices,
  grantAchievement,
  joinChallenge,
  joinTeam,
  logSession,
  recordBiometricData,
  recordMentalPerformanceMetrics,
  savePerformanceMetric,
  saveChatMessage,
  sendFriendRequest,
  unfollowUser,
  updateAthleteProfile,
  updateBattlePassProgress,
  upsertPersonalizationPreferences,
  upsertPushNotificationPreferences,
  updateStreak,
  updateTrainingPlan,
  upsertSubscription,
  upsertUserProfile,
} from "./db";

const SPORTS = ["pool", "snooker", "pickleball", "basketball", "baseball", "golf", "american football", "soccer"] as const;

// ─── Auth Router ──────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ─── Profile Router ───────────────────────────────────────────────────────────
const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getUserProfile(ctx.user.id);
  }),

  completeOnboarding: protectedProcedure
    .input(z.object({
      primarySport: z.string(),
      sports: z.array(z.string()),
      skillLevel: z.enum(["amateur", "competitive"]),
      goals: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await upsertUserProfile({
        userId: ctx.user.id,
        primarySport: input.primarySport,
        sports: input.sports,
        skillLevel: input.skillLevel,
        goals: input.goals || null,
        onboardingCompleted: true,
      });
      // Ensure free subscription exists
      const sub = await getUserSubscription(ctx.user.id);
      if (!sub) {
        await upsertSubscription({ userId: ctx.user.id, tier: "free", status: "active" });
      }
      // Grant first achievement
      await grantAchievement(ctx.user.id, "first_session");
      return profile;
    }),

  update: protectedProcedure
    .input(z.object({
      primarySport: z.string().optional(),
      sports: z.array(z.string()).optional(),
      skillLevel: z.enum(["amateur", "competitive"]).optional(),
      goals: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return upsertUserProfile({ userId: ctx.user.id, ...input });
    }),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const sub = await getUserSubscription(ctx.user.id);
    return sub || { tier: "free" as const, status: "active" as const };
  }),

  // Real tier upgrades happen via Stripe webhooks.
  // Only admins can manually set tiers (e.g. for charter members).
  upgradeTier: protectedProcedure
    .input(z.object({ tier: z.enum(["free", "pro", "elite"]) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Tier upgrades require payment. Please subscribe to Pro or Elite.",
        });
      }
      await upsertSubscription({ userId: ctx.user.id, tier: input.tier, status: "active" });
      return { success: true };
    }),
});

// ─── Coach Router ─────────────────────────────────────────────────────────────
const coachRouter = router({
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const sub = await getUserSubscription(ctx.user.id);
    const tier = sub?.tier || "free";
    if (tier === "free") {
      throw new TRPCError({ code: "FORBIDDEN", message: "AI Coach requires Pro or Elite subscription" });
    }
    return getChatHistory(ctx.user.id);
  }),

  sendMessage: protectedProcedure
    .input(z.object({
      message: z.string().min(1).max(2000),
      sport: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      const tier = sub?.tier || "free";
      if (tier === "free") {
        throw new TRPCError({ code: "FORBIDDEN", message: "AI Coach requires Pro or Elite subscription" });
      }

      const profile = await getUserProfile(ctx.user.id);
      const sport = input.sport || profile?.primarySport || "general";
      const skillLevel = profile?.skillLevel || "amateur";

      // Save user message
      await saveChatMessage({ userId: ctx.user.id, role: "user", content: input.message, sport });

      // Build history for context
      const history = await getChatHistory(ctx.user.id, 20);
      const messages = history.slice(-10).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const systemPrompt = `You are Clutch Coach, an elite mental performance coach specializing in sports psychology. You help athletes build mental strength and perform under pressure in clutch moments.

Current athlete profile:
- Sport: ${sport}
- Skill level: ${skillLevel}
- Name: ${ctx.user.name || "Athlete"}

Your coaching style is balanced — you adapt to the athlete's mood and context. When they're struggling, you're calm and reassuring. When they're ready to push, you're energizing and direct. You provide evidence-based mental performance techniques including visualization, breathing exercises, focus cues, and pressure inoculation training.

Always be specific to ${sport}. Reference sport-specific scenarios, pressure moments, and mental challenges unique to ${sport} athletes. Keep responses concise (2-4 paragraphs max) and actionable.

IMPORTANT: You are an AI coach providing mental performance guidance, not a licensed medical professional. For serious mental health concerns, always recommend consulting a licensed sports psychologist or mental health professional.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          { role: "user", content: input.message },
        ],
      });

      const assistantContent = (response.choices[0]?.message?.content as string) || "I'm here to help. Could you tell me more?";

      // Save assistant response
      await saveChatMessage({ userId: ctx.user.id, role: "assistant", content: assistantContent, sport });

      // Grant achievements
      const msgCount = await getChatMessageCount(ctx.user.id);
      if (msgCount === 1) await grantAchievement(ctx.user.id, "first_coach");
      if (msgCount >= 100) await grantAchievement(ctx.user.id, "coach_100");

      await addXp(ctx.user.id, 10);

      return { content: assistantContent };
    }),
});

// ─── Training Router ──────────────────────────────────────────────────────────
const trainingRouter = router({
  getPlans: protectedProcedure.query(async ({ ctx }) => {
    return getUserTrainingPlans(ctx.user.id);
  }),

  getPlan: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const plan = await getTrainingPlan(input.id);
      if (!plan || plan.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      return plan;
    }),

  generatePlan: protectedProcedure
    .input(z.object({
      sport: z.string(),
      focusArea: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      const tier = sub?.tier || "free";
      if (tier === "free") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Full training plans require Pro or Elite subscription" });
      }

      const profile = await getUserProfile(ctx.user.id);
      const skillLevel = profile?.skillLevel || "amateur";

      const prompt = `Create a 4-week mental performance training plan for a ${skillLevel} ${input.sport} athlete${input.focusArea ? ` focusing on ${input.focusArea}` : ""}.

Return a JSON object with this exact structure:
{
  "title": "Plan title",
  "description": "Brief description",
  "difficulty": "beginner|intermediate|advanced",
  "sessions": [
    {
      "id": "unique-id",
      "title": "Session title",
      "description": "What to do",
      "durationMinutes": 15,
      "type": "visualization|breathing|focus|pressure|reflection",
      "completed": false,
      "week": 1,
      "day": 1
    }
  ]
}

Create 12 sessions spread across 4 weeks (3 per week). Make them specific to ${input.sport} mental performance.`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "training_plan",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                sessions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      durationMinutes: { type: "number" },
                      type: { type: "string", enum: ["visualization", "breathing", "focus", "pressure", "reflection"] },
                      completed: { type: "boolean" },
                      week: { type: "number" },
                      day: { type: "number" },
                    },
                    required: ["id", "title", "description", "durationMinutes", "type", "completed", "week", "day"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "description", "difficulty", "sessions"],
              additionalProperties: false,
            },
          },
        },
      });

      const planData = JSON.parse((response.choices[0]?.message?.content as string) || "{}");

      const plan = await createTrainingPlan({
        userId: ctx.user.id,
        sport: input.sport,
        title: planData.title,
        description: planData.description,
        difficulty: planData.difficulty,
        durationWeeks: 4,
        sessions: planData.sessions,
        totalSessions: planData.sessions?.length || 12,
      });

      return plan;
    }),

  completeSession: protectedProcedure
    .input(z.object({
      planId: z.number(),
      sessionId: z.string(),
      moodBefore: z.number().min(1).max(10).optional(),
      moodAfter: z.number().min(1).max(10).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const plan = await getTrainingPlan(input.planId);
      if (!plan || plan.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const sessions = (plan.sessions as any[]) || [];
      const session = sessions.find((s: any) => s.id === input.sessionId);
      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });

      // Mark session as completed
      const updatedSessions = sessions.map((s: any) =>
        s.id === input.sessionId ? { ...s, completed: true, completedAt: new Date().toISOString() } : s
      );

      const completedCount = updatedSessions.filter((s: any) => s.completed).length;

      await updateTrainingPlan(input.planId, {
        sessions: updatedSessions,
        completedSessions: completedCount,
      });

      // Log the session
      await logSession({
        userId: ctx.user.id,
        planId: input.planId,
        sessionId: input.sessionId,
        sport: plan.sport,
        type: session.type,
        durationMinutes: session.durationMinutes,
        moodBefore: input.moodBefore,
        moodAfter: input.moodAfter,
        notes: input.notes,
        xpEarned: 50,
      });

      // Award XP and update streak
      await addXp(ctx.user.id, 50);
      await updateStreak(ctx.user.id);

      // Check achievements
      const profile = await getUserProfile(ctx.user.id);
      const totalCompleted = await getUserSessionLogs(ctx.user.id, 100);
      if (totalCompleted.length >= 1) await grantAchievement(ctx.user.id, "first_session");
      if (totalCompleted.length >= 10) await grantAchievement(ctx.user.id, "ten_sessions");
      if (totalCompleted.length >= 50) await grantAchievement(ctx.user.id, "fifty_sessions");
      if (profile?.streakDays && profile.streakDays >= 7) await grantAchievement(ctx.user.id, "week_streak");
      if (profile?.streakDays && profile.streakDays >= 30) await grantAchievement(ctx.user.id, "month_streak");
      if (profile?.level && profile.level >= 5) await grantAchievement(ctx.user.id, "level_5");
      if (profile?.level && profile.level >= 10) await grantAchievement(ctx.user.id, "level_10");

      // Save performance metric
      if (input.moodAfter) {
        await savePerformanceMetric({
          userId: ctx.user.id,
          sport: plan.sport,
          metricType: "focus",
          value: input.moodAfter * 10,
        });
      }

      return { success: true, xpEarned: 50 };
    }),

  getSessionLogs: protectedProcedure.query(async ({ ctx }) => {
    return getUserSessionLogs(ctx.user.id);
  }),

  skipSession: protectedProcedure
    .input(z.object({ planId: z.number(), sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await getTrainingPlan(input.planId);
      if (!plan || plan.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      const sessions = (plan.sessions as any[]) || [];
      const updatedSessions = sessions.map((s: any) =>
        s.id === input.sessionId ? { ...s, status: "skipped" } : s
      );
      await updateTrainingPlan(input.planId, { sessions: updatedSessions });
      return { success: true };
    }),
  getMetrics: protectedProcedure
    .input(z.object({ sport: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return getUserMetrics(ctx.user.id, input.sport);
    }),
});
// ─── Gamification Router ───────────────────────────────────────────────────────
const gamificationRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const [profile, userAchievs, allAchievs] = await Promise.all([
      getUserProfile(ctx.user.id),
      getUserAchievements(ctx.user.id),
      getAllAchievements(),
    ]);
    return { profile, userAchievements: userAchievs, allAchievements: allAchievs };
  }),

  getLeaderboard: publicProcedure.query(async () => {
    return getLeaderboard(10);
  }),
});

// ─── Wellness Router ──────────────────────────────────────────────────────────
const wellnessRouter = router({
  getTip: protectedProcedure
    .input(z.object({
      category: z.enum(["breathing", "focus", "anxiety", "visualization", "pressure"]),
      sport: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getUserProfile(ctx.user.id);
      const sport = input.sport || profile?.primarySport || "general";

      const categoryDescriptions: Record<string, string> = {
        breathing: "breathing techniques and respiratory control for performance",
        focus: "focus and concentration techniques",
        anxiety: "anxiety management and pre-performance nerves",
        visualization: "mental imagery and visualization techniques",
        pressure: "performing under pressure and clutch moment strategies",
      };

      const prompt = `Generate a practical mental performance tip for a ${sport} athlete about ${categoryDescriptions[input.category]}.

Return a JSON object:
{
  "title": "Short tip title",
  "content": "2-3 paragraph explanation with specific technique",
  "technique": "Name of the specific technique",
  "duration": "How long to practice (e.g., '5 minutes daily')",
  "sportSpecific": "How this applies specifically to ${sport}"
}`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "wellness_tip",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
                technique: { type: "string" },
                duration: { type: "string" },
                sportSpecific: { type: "string" },
              },
              required: ["title", "content", "technique", "duration", "sportSpecific"],
              additionalProperties: false,
            },
          },
        },
      });

      const tip = JSON.parse((response.choices[0]?.message?.content as string) || "{}");

      // Grant wellness achievement
      await grantAchievement(ctx.user.id, "wellness_explorer");
      await addXp(ctx.user.id, 15);

      return tip;
    }),
});

// ─── Community Router ────────────────────────────────────────────────────────────
const communityRouter = router({
  getFeed: publicProcedure
    .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return await getCommunityFeed(input.limit, input.offset);
    }),
  createPost: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(500),
        postType: z.enum(["achievement", "milestone", "tip", "motivation"]),
        sport: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createCommunityPost(ctx.user.id, input.content, input.postType, input.sport);
    }),
  getTeams: publicProcedure
    .input(z.object({ sport: z.string().optional() }))
    .query(async ({ input }) => {
      return await getTeams(input.sport);
    }),
  getChallenges: publicProcedure
    .input(z.object({ sport: z.string().optional() }))
    .query(async ({ input }) => {
      return await getChallenges(input.sport);
    }),
  joinChallenge: protectedProcedure
    .input(z.object({ challengeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await joinChallenge(ctx.user.id, input.challengeId);
    }),
  getReferralCode: protectedProcedure.query(async ({ ctx }) => {
    let code = await getReferralCode(ctx.user.id);
    if (!code) {
      const newCode = await createReferralCode(ctx.user.id);
      return { code: newCode };
    }
    return { code: code.referralCode };
  }),
  getContentRecommendations: protectedProcedure
    .input(z.object({ sport: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return await getContentRecommendations(ctx.user.id, input.sport);
    }),
  bookmarkContent: protectedProcedure
    .input(z.object({ contentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await bookmarkContent(input.contentId, ctx.user.id);
    }),
  getFriends: protectedProcedure.query(async ({ ctx }) => {
    return await getFriends(ctx.user.id);
  }),
  sendFriendRequest: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await sendFriendRequest(ctx.user.id, input.userId);
    }),
});

// ─── World-Class Routers ──────────────────────────────────────────────────────
const personalizationRouter = router({
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    return await getPersonalizationPreferences(ctx.user.id);
  }),
  updatePreferences: protectedProcedure
    .input(
      z.object({
        peakPerformanceTimes: z.array(z.string()).optional(),
        mentalTriggers: z.record(z.string()).optional(),
        adaptiveDifficulty: z.enum(["easy", "medium", "hard"]).optional(),
        preferredCoachingStyle: z.enum(["motivational", "analytical", "balanced"]).optional(),
        notificationPreference: z.enum(["all", "important", "none"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await upsertPersonalizationPreferences(ctx.user.id, input);
    }),
});

const athleteProfileRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return await getAthleteProfile(ctx.user.id);
  }),
  getPublicProfile: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await getPublicAthleteProfile(input.userId);
    }),
  updateProfile: protectedProcedure
    .input(
      z.object({
        displayName: z.string().optional(),
        bio: z.string().optional(),
        avatar: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await updateAthleteProfile(ctx.user.id, input);
    }),
  followUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await followUser(ctx.user.id, input.userId);
    }),
  unfollowUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await unfollowUser(ctx.user.id, input.userId);
    }),
  getFollowers: protectedProcedure.query(async ({ ctx }) => {
    return await getFollowers(ctx.user.id);
  }),
  getFollowing: protectedProcedure.query(async ({ ctx }) => {
    return await getFollowing(ctx.user.id);
  }),
});

const battlePassRouter = router({
  getActiveSeason: publicProcedure.query(async () => {
    return await getActiveBattlePassSeason();
  }),
  getTiers: publicProcedure
    .input(z.object({ seasonId: z.number() }))
    .query(async ({ input }) => {
      return await getBattlePassTiers(input.seasonId);
    }),
  getProgress: protectedProcedure
    .input(z.object({ seasonId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await getUserBattlePassProgress(ctx.user.id, input.seasonId);
    }),
  recordXP: protectedProcedure
    .input(z.object({ seasonId: z.number(), xpGained: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await updateBattlePassProgress(ctx.user.id, input.seasonId, input.xpGained);
    }),
});

const mentalMetricsRouter = router({
  recordMetrics: protectedProcedure
    .input(
      z.object({
        focus: z.number().min(0).max(100),
        composure: z.number().min(0).max(100),
        confidence: z.number().min(0).max(100),
        clutchRating: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await recordMentalPerformanceMetrics(ctx.user.id, input);
    }),
  getHistory: protectedProcedure
    .input(z.object({ days: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return await getMentalPerformanceHistory(ctx.user.id, input.days);
    }),
});

const wearableRouter = router({
  getDevices: protectedProcedure.query(async ({ ctx }) => {
    return await getWearableDevices(ctx.user.id);
  }),
  recordBiometrics: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(["heart_rate", "hrv", "sleep", "stress", "activity"]),
        value: z.number(),
        unit: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await recordBiometricData(ctx.user.id, input);
    }),
  getBiometrics: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(["heart_rate", "hrv", "sleep", "stress", "activity"]),
        days: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await getBiometricData(ctx.user.id, input.dataType, input.days);
    }),
});

const notificationRouter = router({
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    return await getPushNotificationPreferences(ctx.user.id);
  }),
  updatePreferences: protectedProcedure
    .input(
      z.object({
        streakReminders: z.boolean().optional(),
        challengeAlerts: z.boolean().optional(),
        socialUpdates: z.boolean().optional(),
        newContent: z.boolean().optional(),
        optimalSendTime: z.string().optional(),
        timezone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await upsertPushNotificationPreferences(ctx.user.id, input);
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  profile: profileRouter,
  coach: coachRouter,
  training: trainingRouter,
  gamification: gamificationRouter,
  wellness: wellnessRouter,
  community: communityRouter,
  personalization: personalizationRouter,
  athleteProfile: athleteProfileRouter,
  battlePass: battlePassRouter,
  mentalMetrics: mentalMetricsRouter,
  wearable: wearableRouter,
  notifications: notificationRouter,
});

export type AppRouter = typeof appRouter;
