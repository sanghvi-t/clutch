import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── User Profiles ────────────────────────────────────────────────────────────
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  primarySport: varchar("primarySport", { length: 64 }),
  sports: json("sports").$type<string[]>(),
  skillLevel: mysqlEnum("skillLevel", ["amateur", "competitive"]).default("amateur"),
  goals: text("goals"),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  xp: int("xp").default(0).notNull(),
  level: int("level").default(1).notNull(),
  streakDays: int("streakDays").default(0).notNull(),
  lastActivityDate: timestamp("lastActivityDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  tier: mysqlEnum("tier", ["free", "pro", "elite"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ─── Training Plans ───────────────────────────────────────────────────────────
export const trainingPlans = mysqlTable("training_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  sport: varchar("sport", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner"),
  durationWeeks: int("durationWeeks").default(4),
  sessions: json("sessions").$type<TrainingSession[]>(),
  isActive: boolean("isActive").default(true).notNull(),
  completedSessions: int("completedSessions").default(0).notNull(),
  totalSessions: int("totalSessions").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrainingPlan = typeof trainingPlans.$inferSelect;
export type InsertTrainingPlan = typeof trainingPlans.$inferInsert;

export type TrainingSession = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  type: "visualization" | "breathing" | "focus" | "pressure" | "reflection";
  completed: boolean;
  completedAt?: string;
  week: number;
  day: number;
};

// ─── Session Logs ─────────────────────────────────────────────────────────────
export const sessionLogs = mysqlTable("session_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  planId: int("planId").references(() => trainingPlans.id),
  sessionId: varchar("sessionId", { length: 64 }),
  sport: varchar("sport", { length: 64 }),
  type: varchar("type", { length: 64 }),
  durationMinutes: int("durationMinutes"),
  moodBefore: int("moodBefore"), // 1-10
  moodAfter: int("moodAfter"),   // 1-10
  notes: text("notes"),
  xpEarned: int("xpEarned").default(0),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type SessionLog = typeof sessionLogs.$inferSelect;
export type InsertSessionLog = typeof sessionLogs.$inferInsert;

// ─── Chat Messages ────────────────────────────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  sport: varchar("sport", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ─── Achievements ─────────────────────────────────────────────────────────────
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 128 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  xpReward: int("xpReward").default(50),
  category: mysqlEnum("category", ["training", "streak", "coach", "wellness", "social"]).default("training"),
});

export type Achievement = typeof achievements.$inferSelect;

// ─── User Achievements ────────────────────────────────────────────────────────
export const userAchievements = mysqlTable("user_achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  achievementId: int("achievementId").notNull().references(() => achievements.id),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;

// ─── Performance Metrics ──────────────────────────────────────────────────────
export const performanceMetrics = mysqlTable("performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  sport: varchar("sport", { length: 64 }).notNull(),
  metricType: varchar("metricType", { length: 64 }).notNull(), // focus, composure, confidence, clutch_rating
  value: float("value").notNull(), // 0-100
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;

// ─── Teams ────────────────────────────────────────────────────────────────────
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  createdBy: int("createdBy").notNull().references(() => users.id),
  sport: varchar("sport", { length: 64 }).notNull(),
  isPublic: boolean("isPublic").default(true),
  memberCount: int("memberCount").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// ─── Team Members ─────────────────────────────────────────────────────────────
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull().references(() => teams.id),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("role", ["owner", "member"]).default("member"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});
export type TeamMember = typeof teamMembers.$inferSelect;

// ─── Friends ──────────────────────────────────────────────────────────────────
export const friendships = mysqlTable("friendships", {
  id: int("id").autoincrement().primaryKey(),
  userId1: int("userId1").notNull().references(() => users.id),
  userId2: int("userId2").notNull().references(() => users.id),
  status: mysqlEnum("status", ["pending", "accepted", "blocked"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Friendship = typeof friendships.$inferSelect;

// ─── Community Feed ────────────────────────────────────────────────────────────
export const communityPosts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  content: text("content").notNull(),
  postType: mysqlEnum("postType", ["achievement", "milestone", "tip", "motivation"]).notNull(),
  sport: varchar("sport", { length: 64 }),
  likes: int("likes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

// ─── Community Challenges ─────────────────────────────────────────────────────
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 128 }).notNull(),
  description: text("description"),
  sport: varchar("sport", { length: 64 }),
  goal: varchar("goal", { length: 256 }).notNull(), // e.g., "Complete 3 sessions this week"
  xpReward: int("xpReward").default(100),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// ─── User Challenge Progress ──────────────────────────────────────────────────
export const userChallengeProgress = mysqlTable("user_challenge_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  challengeId: int("challengeId").notNull().references(() => challenges.id),
  progress: int("progress").default(0), // 0-100 percentage
  completed: boolean("completed").default(false),
  completedAt: timestamp("completedAt"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;

// ─── Referrals ────────────────────────────────────────────────────────────────
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull().references(() => users.id),
  referralCode: varchar("referralCode", { length: 32 }).notNull().unique(),
  refereeId: int("refereeId").references(() => users.id),
  rewardStatus: mysqlEnum("rewardStatus", ["pending", "earned", "claimed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

// ─── Content Recommendations ──────────────────────────────────────────────────
export const contentRecommendations = mysqlTable("content_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  contentType: mysqlEnum("contentType", ["video", "article"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  url: text("url").notNull(),
  sport: varchar("sport", { length: 64 }),
  category: varchar("category", { length: 64 }), // breathing, focus, anxiety, etc.
  isBookmarked: boolean("isBookmarked").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ContentRecommendation = typeof contentRecommendations.$inferSelect;
export type InsertContentRecommendation = typeof contentRecommendations.$inferInsert;


// ─── Personalization Preferences ──────────────────────────────────────────────
export const personalizationPreferences = mysqlTable("personalization_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id).unique(),
  peakPerformanceTimes: json("peakPerformanceTimes").$type<string[]>(), // ["morning", "afternoon", "evening"]
  mentalTriggers: json("mentalTriggers").$type<Record<string, string>>(), // { "basketball": "breathing", "golf": "visualization" }
  adaptiveDifficulty: mysqlEnum("adaptiveDifficulty", ["easy", "medium", "hard"]).default("medium"),
  preferredCoachingStyle: mysqlEnum("preferredCoachingStyle", ["motivational", "analytical", "balanced"]).default("balanced"),
  notificationPreference: mysqlEnum("notificationPreference", ["all", "important", "none"]).default("all"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PersonalizationPreference = typeof personalizationPreferences.$inferSelect;
export type InsertPersonalizationPreference = typeof personalizationPreferences.$inferInsert;

// ─── Wearable Devices ─────────────────────────────────────────────────────────
export const wearableDevices = mysqlTable("wearable_devices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  deviceType: mysqlEnum("deviceType", ["apple_watch", "garmin", "oura_ring", "fitbit"]).notNull(),
  deviceName: varchar("deviceName", { length: 128 }),
  externalId: varchar("externalId", { length: 256 }).notNull(), // Device ID from external API
  accessToken: text("accessToken"), // Encrypted token for API access
  isActive: boolean("isActive").default(true),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type WearableDevice = typeof wearableDevices.$inferSelect;
export type InsertWearableDevice = typeof wearableDevices.$inferInsert;

// ─── Biometric Data ───────────────────────────────────────────────────────────
export const biometricData = mysqlTable("biometric_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  wearableDeviceId: int("wearableDeviceId").references(() => wearableDevices.id),
  dataType: mysqlEnum("dataType", ["heart_rate", "hrv", "sleep", "stress", "activity"]).notNull(),
  value: float("value").notNull(), // Numeric value (bpm, ms, hours, %)
  unit: varchar("unit", { length: 32 }), // bpm, ms, hours, %
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BiometricData = typeof biometricData.$inferSelect;
export type InsertBiometricData = typeof biometricData.$inferInsert;

// ─── Athlete Profiles (Public Stats) ───────────────────────────────────────────
export const athleteProfiles = mysqlTable("athlete_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id).unique(),
  displayName: varchar("displayName", { length: 128 }).notNull(),
  bio: text("bio"),
  avatar: varchar("avatar", { length: 512 }), // URL to avatar image
  sport: varchar("sport", { length: 64 }).notNull(),
  skillLevel: mysqlEnum("skillLevel", ["amateur", "competitive"]).notNull(),
  isPublic: boolean("isPublic").default(true),
  totalXP: int("totalXP").default(0),
  currentLevel: int("currentLevel").default(1),
  currentStreak: int("currentStreak").default(0),
  totalAchievements: int("totalAchievements").default(0),
  mentalPerformanceScore: float("mentalPerformanceScore").default(0), // 0-100
  followerCount: int("followerCount").default(0),
  followingCount: int("followingCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AthleteProfile = typeof athleteProfiles.$inferSelect;
export type InsertAthleteProfile = typeof athleteProfiles.$inferInsert;

// ─── Mental Performance Metrics ────────────────────────────────────────────────
export const mentalPerformanceMetrics = mysqlTable("mental_performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  sessionId: int("sessionId").references(() => sessionLogs.id), // Foreign key to sessionLogs
  focus: float("focus").default(0), // 0-100
  composure: float("composure").default(0), // 0-100
  confidence: float("confidence").default(0), // 0-100
  clutchRating: float("clutchRating").default(0), // 0-100 (performance under pressure)
  overallScore: float("overallScore").default(0), // Composite score
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MentalPerformanceMetric = typeof mentalPerformanceMetrics.$inferSelect;
export type InsertMentalPerformanceMetric = typeof mentalPerformanceMetrics.$inferInsert;

// ─── Battle Pass Seasons ───────────────────────────────────────────────────────
export const battlePassSeasons = mysqlTable("battle_pass_seasons", {
  id: int("id").autoincrement().primaryKey(),
  seasonNumber: int("seasonNumber").notNull().unique(),
  title: varchar("title", { length: 128 }).notNull(),
  description: text("description"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BattlePassSeason = typeof battlePassSeasons.$inferSelect;
export type InsertBattlePassSeason = typeof battlePassSeasons.$inferInsert;

// ─── Battle Pass Tiers ────────────────────────────────────────────────────────
export const battlePassTiers = mysqlTable("battle_pass_tiers", {
  id: int("id").autoincrement().primaryKey(),
  seasonId: int("seasonId").notNull().references(() => battlePassSeasons.id),
  tierNumber: int("tierNumber").notNull(), // 1-50
  xpRequired: int("xpRequired").notNull(), // XP needed to reach this tier
  freeReward: varchar("freeReward", { length: 256 }), // Free track reward (badge, cosmetic)
  premiumReward: varchar("premiumReward", { length: 256 }), // Premium track reward
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BattlePassTier = typeof battlePassTiers.$inferSelect;
export type InsertBattlePassTier = typeof battlePassTiers.$inferInsert;

// ─── User Battle Pass Progress ────────────────────────────────────────────────
export const userBattlePassProgress = mysqlTable("user_battle_pass_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  seasonId: int("seasonId").notNull().references(() => battlePassSeasons.id),
  hasPremium: boolean("hasPremium").default(false),
  currentTier: int("currentTier").default(0),
  totalXP: int("totalXP").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UserBattlePassProgress = typeof userBattlePassProgress.$inferSelect;
export type InsertUserBattlePassProgress = typeof userBattlePassProgress.$inferInsert;

// ─── Followers ────────────────────────────────────────────────────────────────
export const followers = mysqlTable("followers", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull().references(() => users.id),
  followingId: int("followingId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Follower = typeof followers.$inferSelect;
export type InsertFollower = typeof followers.$inferInsert;

// ─── Push Notification Preferences ────────────────────────────────────────────
export const pushNotificationPreferences = mysqlTable("push_notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id).unique(),
  streakReminders: boolean("streakReminders").default(true),
  challengeAlerts: boolean("challengeAlerts").default(true),
  socialUpdates: boolean("socialUpdates").default(true),
  newContent: boolean("newContent").default(true),
  optimalSendTime: varchar("optimalSendTime", { length: 5 }), // HH:MM format
  timezone: varchar("timezone", { length: 64 }).default("UTC"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PushNotificationPreference = typeof pushNotificationPreferences.$inferSelect;
export type InsertPushNotificationPreference = typeof pushNotificationPreferences.$inferInsert;
