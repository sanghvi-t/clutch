import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const statements = [
  `CREATE TABLE IF NOT EXISTS achievements (
    id int AUTO_INCREMENT NOT NULL,
    \`key\` varchar(64) NOT NULL,
    title varchar(128) NOT NULL,
    description text,
    icon varchar(64),
    xpReward int DEFAULT 50,
    category enum('training','streak','coach','wellness','social') DEFAULT 'training',
    CONSTRAINT achievements_id PRIMARY KEY(id),
    CONSTRAINT achievements_key_unique UNIQUE(\`key\`)
  )`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id int AUTO_INCREMENT NOT NULL,
    userId int NOT NULL,
    role enum('user','assistant') NOT NULL,
    content text NOT NULL,
    sport varchar(64),
    createdAt timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT chat_messages_id PRIMARY KEY(id)
  )`,
  `CREATE TABLE IF NOT EXISTS performance_metrics (
    id int AUTO_INCREMENT NOT NULL,
    userId int NOT NULL,
    sport varchar(64) NOT NULL,
    metricType varchar(64) NOT NULL,
    value float NOT NULL,
    recordedAt timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT performance_metrics_id PRIMARY KEY(id)
  )`,
  `CREATE TABLE IF NOT EXISTS training_plans (
    id int AUTO_INCREMENT NOT NULL,
    userId int NOT NULL,
    sport varchar(64) NOT NULL,
    title varchar(255) NOT NULL,
    description text,
    difficulty enum('beginner','intermediate','advanced') DEFAULT 'beginner',
    durationWeeks int DEFAULT 4,
    sessions json,
    isActive boolean NOT NULL DEFAULT true,
    completedSessions int NOT NULL DEFAULT 0,
    totalSessions int NOT NULL DEFAULT 0,
    createdAt timestamp NOT NULL DEFAULT (now()),
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT training_plans_id PRIMARY KEY(id)
  )`,
  `CREATE TABLE IF NOT EXISTS session_logs (
    id int AUTO_INCREMENT NOT NULL,
    userId int NOT NULL,
    planId int,
    sessionId varchar(64),
    sport varchar(64),
    type varchar(64),
    durationMinutes int,
    moodBefore int,
    moodAfter int,
    notes text,
    xpEarned int DEFAULT 0,
    completedAt timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT session_logs_id PRIMARY KEY(id)
  )`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id int AUTO_INCREMENT NOT NULL,
    userId int NOT NULL,
    tier enum('free','pro','elite') NOT NULL DEFAULT 'free',
    status enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
    startedAt timestamp NOT NULL DEFAULT (now()),
    expiresAt timestamp NULL,
    createdAt timestamp NOT NULL DEFAULT (now()),
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT subscriptions_id PRIMARY KEY(id)
  )`,
  `CREATE TABLE IF NOT EXISTS user_achievements (
    id int AUTO_INCREMENT NOT NULL,
    userId int NOT NULL,
    achievementId int NOT NULL,
    earnedAt timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT user_achievements_id PRIMARY KEY(id)
  )`,
  `CREATE TABLE IF NOT EXISTS user_profiles (
    id int AUTO_INCREMENT NOT NULL,
    userId int NOT NULL,
    primarySport varchar(64),
    sports json,
    skillLevel enum('amateur','competitive') DEFAULT 'amateur',
    goals text,
    onboardingCompleted boolean NOT NULL DEFAULT false,
    xp int NOT NULL DEFAULT 0,
    level int NOT NULL DEFAULT 1,
    streakDays int NOT NULL DEFAULT 0,
    lastActivityDate timestamp NULL,
    createdAt timestamp NOT NULL DEFAULT (now()),
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT user_profiles_id PRIMARY KEY(id)
  )`,
  // Seed achievements
  `INSERT IGNORE INTO achievements (\`key\`, title, description, icon, xpReward, category) VALUES
    ('first_session', 'First Step', 'Completed your first training session', 'Trophy', 100, 'training'),
    ('week_streak', 'Week Warrior', 'Maintained a 7-day training streak', 'Flame', 200, 'streak'),
    ('month_streak', 'Iron Mind', 'Maintained a 30-day training streak', 'Zap', 500, 'streak'),
    ('first_coach', 'Coach Connect', 'Had your first AI coach conversation', 'MessageCircle', 75, 'coach'),
    ('ten_sessions', 'Dedicated', 'Completed 10 training sessions', 'Star', 150, 'training'),
    ('fifty_sessions', 'Elite Performer', 'Completed 50 training sessions', 'Award', 400, 'training'),
    ('wellness_explorer', 'Wellness Explorer', 'Read 5 mental wellness tips', 'Heart', 50, 'wellness'),
    ('clutch_moment', 'Clutch Moment', 'Achieved a perfect focus score', 'Target', 300, 'training'),
    ('multi_sport', 'Multi-Sport Athlete', 'Trained across 3 different sports', 'Layers', 200, 'training'),
    ('level_5', 'Rising Star', 'Reached Level 5', 'TrendingUp', 250, 'training'),
    ('level_10', 'Mental Elite', 'Reached Level 10', 'Crown', 500, 'training'),
    ('coach_100', 'Conversation Master', 'Had 100 messages with your AI coach', 'Brain', 300, 'coach')`
];

for (const sql of statements) {
  try {
    await conn.execute(sql);
    console.log('✓', sql.trim().split('\n')[0].substring(0, 60));
  } catch(e) {
    console.error('✗', e.message.substring(0, 100));
  }
}

await conn.end();
console.log('\nAll migrations complete');
