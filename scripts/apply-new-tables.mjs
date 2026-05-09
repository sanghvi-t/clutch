import { getDb } from "../server/db.ts";

const newTables = [
  `CREATE TABLE IF NOT EXISTS athlete_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    displayName VARCHAR(128) NOT NULL,
    bio TEXT,
    avatar VARCHAR(512),
    sport VARCHAR(64) NOT NULL,
    skillLevel ENUM('amateur','competitive') NOT NULL,
    isPublic BOOLEAN DEFAULT true,
    totalXP INT DEFAULT 0,
    currentLevel INT DEFAULT 1,
    currentStreak INT DEFAULT 0,
    totalAchievements INT DEFAULT 0,
    mentalPerformanceScore FLOAT DEFAULT 0,
    followerCount INT DEFAULT 0,
    followingCount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS battle_pass_seasons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seasonNumber INT NOT NULL UNIQUE,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS battle_pass_tiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seasonId INT NOT NULL,
    tierNumber INT NOT NULL,
    xpRequired INT NOT NULL,
    freeReward VARCHAR(256),
    premiumReward VARCHAR(256),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seasonId) REFERENCES battle_pass_seasons(id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS biometric_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    wearableDeviceId INT,
    dataType ENUM('heart_rate','hrv','sleep','stress','activity') NOT NULL,
    value FLOAT NOT NULL,
    unit VARCHAR(32),
    timestamp TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS followers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    followerId INT NOT NULL,
    followingId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (followerId) REFERENCES users(id),
    FOREIGN KEY (followingId) REFERENCES users(id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS mental_performance_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    sessionId INT,
    focus FLOAT DEFAULT 0,
    composure FLOAT DEFAULT 0,
    confidence FLOAT DEFAULT 0,
    clutchRating FLOAT DEFAULT 0,
    overallScore FLOAT DEFAULT 0,
    timestamp TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (sessionId) REFERENCES session_logs(id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS personalization_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    peakPerformanceTimes JSON,
    mentalTriggers JSON,
    adaptiveDifficulty ENUM('easy','medium','hard') DEFAULT 'medium',
    preferredCoachingStyle ENUM('motivational','analytical','balanced') DEFAULT 'balanced',
    notificationPreference ENUM('all','important','none') DEFAULT 'all',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS push_notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    streakReminders BOOLEAN DEFAULT true,
    challengeAlerts BOOLEAN DEFAULT true,
    socialUpdates BOOLEAN DEFAULT true,
    newContent BOOLEAN DEFAULT true,
    optimalSendTime VARCHAR(5),
    timezone VARCHAR(64) DEFAULT 'UTC',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS user_battle_pass_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    seasonId INT NOT NULL,
    hasPremium BOOLEAN DEFAULT false,
    currentTier INT DEFAULT 0,
    totalXP INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (seasonId) REFERENCES battle_pass_seasons(id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS wearable_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    deviceType ENUM('apple_watch','garmin','oura_ring','fitbit') NOT NULL,
    deviceName VARCHAR(128),
    externalId VARCHAR(256) NOT NULL,
    accessToken TEXT,
    isActive BOOLEAN DEFAULT true,
    lastSyncedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`
];

async function applyTables() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  for (const sql of newTables) {
    try {
      console.log(`Creating table...`);
      await db.execute(sql);
      console.log("✓ Success");
    } catch (err) {
      if (err.message?.includes("already exists")) {
        console.log("✓ Already exists (skipped)");
      } else {
        console.error("Error:", err.message);
      }
    }
  }

  console.log("\n✓ All world-class tables created!");
}

applyTables().catch(console.error);
