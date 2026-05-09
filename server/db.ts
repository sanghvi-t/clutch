import { and, asc, desc, eq, gte, or, sql } from "drizzle-orm";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  achievements,
  athleteProfiles,
  battlePassSeasons,
  battlePassTiers,
  biometricData,
  chatMessages,
  challenges,
  communityPosts,
  contentRecommendations,
  followers,
  friendships,
  mentalPerformanceMetrics,
  performanceMetrics,
  personalizationPreferences,
  pushNotificationPreferences,
  referrals,
  sessionLogs,
  subscriptions,
  teamMembers,
  teams,
  trainingPlans,
  userAchievements,
  userBattlePassProgress,
  userChallengeProgress,
  userProfiles,
  wearableDevices,
  users,
  type InsertChatMessage,
  type InsertCommunityPost,
  type InsertContentRecommendation,
  type InsertPerformanceMetric,
  type InsertReferral,
  type InsertSessionLog,
  type InsertSubscription,
  type InsertTrainingPlan,
  type InsertUserProfile,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── User Profiles ────────────────────────────────────────────────────────────
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function upsertUserProfile(data: InsertUserProfile) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserProfile(data.userId);
  if (existing) {
    await db.update(userProfiles).set(data).where(eq(userProfiles.userId, data.userId));
  } else {
    await db.insert(userProfiles).values(data);
  }
  return getUserProfile(data.userId);
}

export async function addXp(userId: number, xpAmount: number) {
  const db = await getDb();
  if (!db) return;
  const profile = await getUserProfile(userId);
  if (!profile) return;
  const newXp = (profile.xp || 0) + xpAmount;
  const newLevel = Math.floor(newXp / 500) + 1;
  await db.update(userProfiles)
    .set({ xp: newXp, level: newLevel, lastActivityDate: new Date() })
    .where(eq(userProfiles.userId, userId));
  return { xp: newXp, level: newLevel };
}

export async function updateStreak(userId: number) {
  const db = await getDb();
  if (!db) return;
  const profile = await getUserProfile(userId);
  if (!profile) return;
  const now = new Date();
  const lastActivity = profile.lastActivityDate;
  let newStreak = profile.streakDays || 0;
  if (lastActivity) {
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) newStreak += 1;
    else if (diffDays > 1) newStreak = 1;
  } else {
    newStreak = 1;
  }
  await db.update(userProfiles)
    .set({ streakDays: newStreak, lastActivityDate: now })
    .where(eq(userProfiles.userId, userId));
  return newStreak;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);
  return result[0];
}

export async function upsertSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserSubscription(data.userId);
  if (existing) {
    await db.update(subscriptions).set(data).where(eq(subscriptions.userId, data.userId));
  } else {
    await db.insert(subscriptions).values(data);
  }
}

// ─── Training Plans ───────────────────────────────────────────────────────────
export async function getUserTrainingPlans(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingPlans)
    .where(and(eq(trainingPlans.userId, userId), eq(trainingPlans.isActive, true)))
    .orderBy(desc(trainingPlans.createdAt));
}

export async function getTrainingPlan(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(trainingPlans).where(eq(trainingPlans.id, id)).limit(1);
  return result[0];
}

export async function createTrainingPlan(data: InsertTrainingPlan) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(trainingPlans).values(data);
  const result = await db.select().from(trainingPlans)
    .where(eq(trainingPlans.userId, data.userId))
    .orderBy(desc(trainingPlans.createdAt)).limit(1);
  return result[0];
}

export async function updateTrainingPlan(id: number, data: Partial<InsertTrainingPlan>) {
  const db = await getDb();
  if (!db) return;
  await db.update(trainingPlans).set(data).where(eq(trainingPlans.id, id));
}

// ─── Session Logs ─────────────────────────────────────────────────────────────
export async function logSession(data: InsertSessionLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(sessionLogs).values(data);
}

export async function getUserSessionLogs(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessionLogs)
    .where(eq(sessionLogs.userId, userId))
    .orderBy(desc(sessionLogs.completedAt))
    .limit(limit);
}

// ─── Chat Messages ────────────────────────────────────────────────────────────
export async function getChatHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(chatMessages.createdAt)
    .limit(limit);
}

export async function saveChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) return;
  await db.insert(chatMessages).values(data);
}

export async function getChatMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(chatMessages).where(eq(chatMessages.userId, userId));
  return Number(result[0]?.count || 0);
}

// ─── Achievements ─────────────────────────────────────────────────────────────
export async function getAllAchievements() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(achievements);
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: userAchievements.id,
    achievementId: userAchievements.achievementId,
    earnedAt: userAchievements.earnedAt,
    key: achievements.key,
    title: achievements.title,
    description: achievements.description,
    icon: achievements.icon,
    xpReward: achievements.xpReward,
    category: achievements.category,
  })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.earnedAt));
}

export async function grantAchievement(userId: number, achievementKey: string) {
  const db = await getDb();
  if (!db) return;
  const achievement = await db.select().from(achievements).where(eq(achievements.key, achievementKey)).limit(1);
  if (!achievement[0]) return;
  const existing = await db.select().from(userAchievements)
    .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievement[0].id)))
    .limit(1);
  if (existing[0]) return;
  await db.insert(userAchievements).values({ userId, achievementId: achievement[0].id });
  if (achievement[0].xpReward) await addXp(userId, achievement[0].xpReward);
}

// ─── Performance Metrics ──────────────────────────────────────────────────────
export async function savePerformanceMetric(data: InsertPerformanceMetric) {
  const db = await getDb();
  if (!db) return;
  await db.insert(performanceMetrics).values(data);
}

export async function getUserMetrics(userId: number, sport?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = sport
    ? and(eq(performanceMetrics.userId, userId), eq(performanceMetrics.sport, sport))
    : eq(performanceMetrics.userId, userId);
  return db.select().from(performanceMetrics)
    .where(conditions)
    .orderBy(performanceMetrics.recordedAt)
    .limit(100);
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export async function getLeaderboard(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    userId: userProfiles.userId,
    name: users.name,
    xp: userProfiles.xp,
    level: userProfiles.level,
    streakDays: userProfiles.streakDays,
  })
    .from(userProfiles)
    .innerJoin(users, eq(userProfiles.userId, users.id))
    .orderBy(desc(userProfiles.xp))
    .limit(limit);
}


// ─── Community Posts ──────────────────────────────────────────────────────────
export async function createCommunityPost(userId: number, content: string, postType: string, sport?: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(communityPosts).values({
      userId,
      content,
      postType: postType as any,
      sport,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create community post:", error);
    return null;
  }
}

export async function getCommunityFeed(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  try {
    const posts = await db
      .select({
        id: communityPosts.id,
        content: communityPosts.content,
        postType: communityPosts.postType,
        sport: communityPosts.sport,
        likes: communityPosts.likes,
        createdAt: communityPosts.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.userId, users.id))
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);
    return posts;
  } catch (error) {
    console.error("[Database] Failed to get community feed:", error);
    return [];
  }
}

// ─── Challenges ───────────────────────────────────────────────────────────────
export async function getChallenges(sport?: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    const results = await db
      .select()
      .from(challenges)
      .where(eq(challenges.isActive, true))
      .orderBy(desc(challenges.startDate));
    return results;
  } catch (error) {
    console.error("[Database] Failed to get challenges:", error);
    return [];
  }
}

export async function joinChallenge(userId: number, challengeId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(userChallengeProgress).values({
      userId,
      challengeId,
      progress: 0,
      completed: false,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to join challenge:", error);
    return null;
  }
}

export async function updateChallengeProgress(userId: number, challengeId: number, progress: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .update(userChallengeProgress)
      .set({
        progress,
        completed: progress >= 100,
        completedAt: progress >= 100 ? new Date() : null,
      })
      .where(
        and(
          eq(userChallengeProgress.userId, userId),
          eq(userChallengeProgress.challengeId, challengeId)
        )
      );
    return result;
  } catch (error) {
    console.error("[Database] Failed to update challenge progress:", error);
    return null;
  }
}

// ─── Referrals ────────────────────────────────────────────────────────────────
export async function createReferralCode(userId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const code = `CLUTCH${userId}${Date.now().toString(36).toUpperCase()}`;
    const result = await db.insert(referrals).values({
      referrerId: userId,
      referralCode: code,
    });
    return code;
  } catch (error) {
    console.error("[Database] Failed to create referral code:", error);
    return null;
  }
}

export async function getReferralCode(userId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get referral code:", error);
    return null;
  }
}

// ─── Content Recommendations ──────────────────────────────────────────────────
export async function addContentRecommendation(
  userId: number,
  contentType: string,
  title: string,
  url: string,
  sport?: string,
  category?: string
) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(contentRecommendations).values({
      userId,
      contentType: contentType as any,
      title,
      url,
      sport,
      category,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to add content recommendation:", error);
    return null;
  }
}

export async function getContentRecommendations(userId: number, sport?: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    const results = await db
      .select()
      .from(contentRecommendations)
      .where(eq(contentRecommendations.userId, userId))
      .orderBy(desc(contentRecommendations.createdAt));
    return results;
  } catch (error) {
    console.error("[Database] Failed to get content recommendations:", error);
    return [];
  }
}

export async function bookmarkContent(contentId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .update(contentRecommendations)
      .set({ isBookmarked: true })
      .where(
        and(
          eq(contentRecommendations.id, contentId),
          eq(contentRecommendations.userId, userId)
        )
      );
    return result;
  } catch (error) {
    console.error("[Database] Failed to bookmark content:", error);
    return null;
  }
}

// ─── Teams ────────────────────────────────────────────────────────────────────
export async function createTeam(name: string, createdBy: number, sport: string, description?: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(teams).values({
      name,
      createdBy,
      sport,
      description,
      isPublic: true,
      memberCount: 1,
    });
    // Add creator as team member
    await db.insert(teamMembers).values({
      teamId: (result as any).insertId,
      userId: createdBy,
      role: "owner",
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create team:", error);
    return null;
  }
}

export async function getTeams(sport?: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    const results = await db
      .select()
      .from(teams)
      .where(eq(teams.isPublic, true))
      .orderBy(desc(teams.createdAt));
    return results;
  } catch (error) {
    console.error("[Database] Failed to get teams:", error);
    return [];
  }
}

export async function joinTeam(teamId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(teamMembers).values({
      teamId,
      userId,
      role: "member",
    });
    await db
      .update(teams)
      .set({ memberCount: sql`memberCount + 1` })
      .where(eq(teams.id, teamId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to join team:", error);
    return null;
  }
}

// ─── Friends ──────────────────────────────────────────────────────────────────
export async function sendFriendRequest(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(friendships).values({
      userId1,
      userId2,
      status: "pending",
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to send friend request:", error);
    return null;
  }
}

export async function acceptFriendRequest(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(
        and(
          eq(friendships.userId1, userId1),
          eq(friendships.userId2, userId2),
          eq(friendships.status, "pending")
        )
      );
    return result;
  } catch (error) {
    console.error("[Database] Failed to accept friend request:", error);
    return null;
  }
}

export async function getFriends(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    const friends = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        xp: userProfiles.xp,
        level: userProfiles.level,
      })
      .from(friendships)
      .leftJoin(
        users,
        or(
          and(eq(friendships.userId1, userId), eq(friendships.userId2, users.id)),
          and(eq(friendships.userId2, userId), eq(friendships.userId1, users.id))
        )
      )
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(
        and(
          or(eq(friendships.userId1, userId), eq(friendships.userId2, userId)),
          eq(friendships.status, "accepted")
        )
      );
    return friends;
  } catch (error) {
    console.error("[Database] Failed to get friends:", error);
    return [];
  }
}


// ─── Personalization ──────────────────────────────────────────────────────────
export async function getPersonalizationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(personalizationPreferences)
    .where(eq(personalizationPreferences.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertPersonalizationPreferences(userId: number, prefs: any) {
  const db = await getDb();
  if (!db) return null;
  await db
    .insert(personalizationPreferences)
    .values({ userId, ...prefs })
    .onDuplicateKeyUpdate({ set: prefs });
  return getPersonalizationPreferences(userId);
}

// ─── Athlete Profiles ─────────────────────────────────────────────────────────
export async function createAthleteProfile(userId: number, profile: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(athleteProfiles).values({ userId, ...profile });
  return getAthleteProfile(userId);
}

export async function getAthleteProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(athleteProfiles)
    .where(eq(athleteProfiles.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateAthleteProfile(userId: number, updates: any) {
  const db = await getDb();
  if (!db) return null;
  await db
    .update(athleteProfiles)
    .set(updates)
    .where(eq(athleteProfiles.userId, userId));
  return getAthleteProfile(userId);
}

export async function getPublicAthleteProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(athleteProfiles)
    .where(and(eq(athleteProfiles.userId, userId), eq(athleteProfiles.isPublic, true)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ─── Followers ────────────────────────────────────────────────────────────────
export async function followUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.insert(followers).values({ followerId, followingId });
    await db
      .update(athleteProfiles)
      .set({ followingCount: sql`followingCount + 1` })
      .where(eq(athleteProfiles.userId, followerId));
    await db
      .update(athleteProfiles)
      .set({ followerCount: sql`followerCount + 1` })
      .where(eq(athleteProfiles.userId, followingId));
    return true;
  } catch {
    return false;
  }
}

export async function unfollowUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .delete(followers)
      .where(and(eq(followers.followerId, followerId), eq(followers.followingId, followingId)));
    await db
      .update(athleteProfiles)
      .set({ followingCount: sql`GREATEST(followingCount - 1, 0)` })
      .where(eq(athleteProfiles.userId, followerId));
    await db
      .update(athleteProfiles)
      .set({ followerCount: sql`GREATEST(followerCount - 1, 0)` })
      .where(eq(athleteProfiles.userId, followingId));
    return true;
  } catch {
    return false;
  }
}

export async function getFollowers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(followers)
    .innerJoin(users, eq(followers.followerId, users.id))
    .where(eq(followers.followingId, userId));
}

export async function getFollowing(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(followers)
    .innerJoin(users, eq(followers.followingId, users.id))
    .where(eq(followers.followerId, userId));
}

// ─── Battle Pass ──────────────────────────────────────────────────────────────
export async function createBattlePassSeason(season: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(battlePassSeasons).values(season);
  return result;
}

export async function getActiveBattlePassSeason() {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(battlePassSeasons)
    .where(eq(battlePassSeasons.isActive, true))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getBattlePassTiers(seasonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(battlePassTiers)
    .where(eq(battlePassTiers.seasonId, seasonId))
    .orderBy(asc(battlePassTiers.tierNumber));
}

export async function getUserBattlePassProgress(userId: number, seasonId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(userBattlePassProgress)
    .where(and(eq(userBattlePassProgress.userId, userId), eq(userBattlePassProgress.seasonId, seasonId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateBattlePassProgress(userId: number, seasonId: number, xpGained: number) {
  const db = await getDb();
  if (!db) return null;
  
  let progress = await getUserBattlePassProgress(userId, seasonId);
  if (!progress) {
    await db.insert(userBattlePassProgress).values({ userId, seasonId, totalXP: xpGained });
    progress = await getUserBattlePassProgress(userId, seasonId);
  } else if (progress.totalXP !== null) {
    const newXP = progress.totalXP + xpGained;
    const tiers = await getBattlePassTiers(seasonId);
    let newTier = progress.currentTier;
    for (const tier of tiers) {
      if (newXP >= tier.xpRequired) {
        newTier = tier.tierNumber;
      } else {
        break;
      }
    }
    await db
      .update(userBattlePassProgress)
      .set({ totalXP: newXP, currentTier: newTier })
      .where(and(eq(userBattlePassProgress.userId, userId), eq(userBattlePassProgress.seasonId, seasonId)));
    progress = await getUserBattlePassProgress(userId, seasonId);
  }
  return progress;
}

// ─── Mental Performance Metrics ────────────────────────────────────────────────
export async function recordMentalPerformanceMetrics(userId: number, metrics: any) {
  const db = await getDb();
  if (!db) return null;
  const overallScore = (metrics.focus + metrics.composure + metrics.confidence + metrics.clutchRating) / 4;
  const result = await db
    .insert(mentalPerformanceMetrics)
    .values({ userId, ...metrics, overallScore, timestamp: new Date() });
  return result;
}

export async function getMentalPerformanceHistory(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db
    .select()
    .from(mentalPerformanceMetrics)
    .where(and(eq(mentalPerformanceMetrics.userId, userId), gte(mentalPerformanceMetrics.timestamp, startDate)))
    .orderBy(desc(mentalPerformanceMetrics.timestamp));
}

// ─── Wearable Devices ─────────────────────────────────────────────────────────
export async function addWearableDevice(userId: number, device: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(wearableDevices).values({ userId, ...device });
  return result;
}

export async function getWearableDevices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wearableDevices).where(eq(wearableDevices.userId, userId));
}

export async function recordBiometricData(userId: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(biometricData).values({ userId, ...data, timestamp: new Date() });
}

export async function getBiometricData(userId: number, dataType: string, days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db
    .select()
    .from(biometricData)
    .where(
      and(
        eq(biometricData.userId, userId),
        eq(biometricData.dataType, dataType as any),
        gte(biometricData.timestamp, startDate)
      )
    )
    .orderBy(asc(biometricData.timestamp));
}

// ─── Push Notifications ────────────────────────────────────────────────────────
export async function getPushNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(pushNotificationPreferences)
    .where(eq(pushNotificationPreferences.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertPushNotificationPreferences(userId: number, prefs: any) {
  const db = await getDb();
  if (!db) return null;
  await db
    .insert(pushNotificationPreferences)
    .values({ userId, ...prefs })
    .onDuplicateKeyUpdate({ set: prefs });
  return getPushNotificationPreferences(userId);
}
