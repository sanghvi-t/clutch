import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the DB and LLM helpers to keep tests fast and isolated
vi.mock("./db", () => ({
  getUserProfile: vi.fn().mockResolvedValue({
    userId: 1,
    primarySport: "basketball",
    sports: ["basketball"],
    skillLevel: "amateur",
    xp: 100,
    level: 1,
    streakDays: 3,
    onboardingCompleted: true,
    goals: "Perform better under pressure",
    subscriptionTier: "pro",
  }),
  upsertUserProfile: vi.fn().mockResolvedValue({ userId: 1 }),
  getChatHistory: vi.fn().mockResolvedValue([]),
  saveChatMessage: vi.fn().mockResolvedValue(undefined),
  getChatMessageCount: vi.fn().mockResolvedValue(5),
  getUserTrainingPlans: vi.fn().mockResolvedValue([]),
  getTrainingPlan: vi.fn().mockResolvedValue(null),
  createTrainingPlan: vi.fn().mockResolvedValue({ id: "plan-1", title: "Test Plan" }),
  updateTrainingPlan: vi.fn().mockResolvedValue(undefined),
  getUserSessionLogs: vi.fn().mockResolvedValue([]),
  logSession: vi.fn().mockResolvedValue(undefined),
  getUserMetrics: vi.fn().mockResolvedValue([]),
  savePerformanceMetric: vi.fn().mockResolvedValue(undefined),
  addXp: vi.fn().mockResolvedValue({ xp: 150, level: 1 }),
  updateStreak: vi.fn().mockResolvedValue({ streakDays: 4 }),
  getLeaderboard: vi.fn().mockResolvedValue([
    { userId: 1, name: "Test User", xp: 500, level: 2, streakDays: 5 },
  ]),
  getUserAchievements: vi.fn().mockResolvedValue([]),
  getAllAchievements: vi.fn().mockResolvedValue([
    { id: "first_coach", title: "First Session", description: "Complete first coaching session", icon: "MessageSquare", xpReward: 50 },
  ]),
  grantAchievement: vi.fn().mockResolvedValue(undefined),
  getUserSubscription: vi.fn().mockResolvedValue({ tier: "pro", userId: 1 }),
  upsertSubscription: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            title: "Basketball Mental Mastery",
            description: "4-week mental performance plan",
            sessions: [
              {
                id: "s1",
                week: 1,
                day: 1,
                title: "Breathing Foundations",
                description: "Learn 4-7-8 breathing",
                durationMinutes: 15,
                type: "breathing",
              },
            ],
          }),
        },
      },
    ],
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-open-id",
    email: "test@clutch.app",
    name: "Test Athlete",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});

describe("profile.get", () => {
  it("returns the user profile for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const profile = await caller.profile.get();
    expect(profile).toBeDefined();
    expect(profile?.primarySport).toBe("basketball");
    expect(profile?.skillLevel).toBe("amateur");
  });
});

describe("profile.getSubscription", () => {
  it("returns subscription tier for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const sub = await caller.profile.getSubscription();
    expect(sub).toBeDefined();
    expect(sub?.tier).toBe("pro");
  });
});

describe("gamification.getLeaderboard", () => {
  it("returns leaderboard entries", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const leaderboard = await caller.gamification.getLeaderboard();
    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBeGreaterThan(0);
    expect(leaderboard[0]).toHaveProperty("xp");
    expect(leaderboard[0]).toHaveProperty("name");
  });
});

describe("gamification.getStatus", () => {
  it("returns gamification status with achievements", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const status = await caller.gamification.getStatus();
    expect(status).toBeDefined();
    expect(status).toHaveProperty("userAchievements");
    expect(status).toHaveProperty("allAchievements");
    expect(Array.isArray(status.allAchievements)).toBe(true);
  });
});

describe("training.getPlans", () => {
  it("returns training plans for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const plans = await caller.training.getPlans();
    expect(Array.isArray(plans)).toBe(true);
  });
});

describe("training.getMetrics", () => {
  it("returns metrics for a given sport", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const metrics = await caller.training.getMetrics({ sport: "basketball" });
    expect(Array.isArray(metrics)).toBe(true);
  });
});
