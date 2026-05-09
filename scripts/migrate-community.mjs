import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL.split('@')[1].split('/')[0],
  user: process.env.DATABASE_URL.split('://')[1].split(':')[0],
  password: process.env.DATABASE_URL.split(':')[2].split('@')[0],
  database: process.env.DATABASE_URL.split('/').pop(),
});

const statements = [
  'CREATE TABLE IF NOT EXISTS `challenges` (`id` int AUTO_INCREMENT NOT NULL, `title` varchar(128) NOT NULL, `description` text, `sport` varchar(64), `goal` varchar(256) NOT NULL, `xpReward` int DEFAULT 100, `startDate` timestamp NOT NULL, `endDate` timestamp NOT NULL, `isActive` boolean DEFAULT true, `createdAt` timestamp NOT NULL DEFAULT (now()), CONSTRAINT `challenges_id` PRIMARY KEY(`id`))',
  'CREATE TABLE IF NOT EXISTS `community_posts` (`id` int AUTO_INCREMENT NOT NULL, `userId` int NOT NULL, `content` text NOT NULL, `postType` enum("achievement","milestone","tip","motivation") NOT NULL, `sport` varchar(64), `likes` int DEFAULT 0, `createdAt` timestamp NOT NULL DEFAULT (now()), CONSTRAINT `community_posts_id` PRIMARY KEY(`id`))',
  'CREATE TABLE IF NOT EXISTS `content_recommendations` (`id` int AUTO_INCREMENT NOT NULL, `userId` int NOT NULL, `contentType` enum("video","article") NOT NULL, `title` varchar(256) NOT NULL, `description` text, `url` text NOT NULL, `sport` varchar(64), `category` varchar(64), `isBookmarked` boolean DEFAULT false, `createdAt` timestamp NOT NULL DEFAULT (now()), CONSTRAINT `content_recommendations_id` PRIMARY KEY(`id`))',
  'CREATE TABLE IF NOT EXISTS `friendships` (`id` int AUTO_INCREMENT NOT NULL, `userId1` int NOT NULL, `userId2` int NOT NULL, `status` enum("pending","accepted","blocked") DEFAULT "pending", `createdAt` timestamp NOT NULL DEFAULT (now()), CONSTRAINT `friendships_id` PRIMARY KEY(`id`))',
  'CREATE TABLE IF NOT EXISTS `referrals` (`id` int AUTO_INCREMENT NOT NULL, `referrerId` int NOT NULL, `referralCode` varchar(32) NOT NULL, `refereeId` int, `rewardStatus` enum("pending","earned","claimed") DEFAULT "pending", `createdAt` timestamp NOT NULL DEFAULT (now()), CONSTRAINT `referrals_id` PRIMARY KEY(`id`), CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`))',
  'CREATE TABLE IF NOT EXISTS `team_members` (`id` int AUTO_INCREMENT NOT NULL, `teamId` int NOT NULL, `userId` int NOT NULL, `role` enum("owner","member") DEFAULT "member", `joinedAt` timestamp NOT NULL DEFAULT (now()), CONSTRAINT `team_members_id` PRIMARY KEY(`id`))',
  'CREATE TABLE IF NOT EXISTS `teams` (`id` int AUTO_INCREMENT NOT NULL, `name` varchar(128) NOT NULL, `description` text, `createdBy` int NOT NULL, `sport` varchar(64) NOT NULL, `isPublic` boolean DEFAULT true, `memberCount` int DEFAULT 1, `createdAt` timestamp NOT NULL DEFAULT (now()), CONSTRAINT `teams_id` PRIMARY KEY(`id`))',
  'CREATE TABLE IF NOT EXISTS `user_challenge_progress` (`id` int AUTO_INCREMENT NOT NULL, `userId` int NOT NULL, `challengeId` int NOT NULL, `progress` int DEFAULT 0, `completed` boolean DEFAULT false, `completedAt` timestamp, `joinedAt` timestamp NOT NULL DEFAULT (now()), CONSTRAINT `user_challenge_progress_id` PRIMARY KEY(`id`))',
];

const fks = [
  'ALTER TABLE `community_posts` ADD CONSTRAINT `community_posts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action',
  'ALTER TABLE `content_recommendations` ADD CONSTRAINT `content_recommendations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action',
  'ALTER TABLE `friendships` ADD CONSTRAINT `friendships_userId1_users_id_fk` FOREIGN KEY (`userId1`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action',
  'ALTER TABLE `friendships` ADD CONSTRAINT `friendships_userId2_users_id_fk` FOREIGN KEY (`userId2`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action',
  'ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrerId_users_id_fk` FOREIGN KEY (`referrerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action',
  'ALTER TABLE `referrals` ADD CONSTRAINT `referrals_refereeId_users_id_fk` FOREIGN KEY (`refereeId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action',
  'ALTER TABLE `team_members` ADD CONSTRAINT `team_members_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action',
  'ALTER TABLE `team_members` ADD CONSTRAINT `team_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action',
  'ALTER TABLE `teams` ADD CONSTRAINT `teams_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action',
  'ALTER TABLE `user_challenge_progress` ADD CONSTRAINT `user_challenge_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action',
  'ALTER TABLE `user_challenge_progress` ADD CONSTRAINT `user_challenge_progress_challengeId_challenges_id_fk` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE no action ON UPDATE no action',
];

try {
  console.log('Creating tables...');
  for (const stmt of statements) {
    try {
      await connection.execute(stmt);
      console.log('✓ Created table');
    } catch (e) {
      if (e.code !== 'ER_TABLE_EXISTS_ERROR') {
        console.error('Error:', e.message);
      }
    }
  }

  console.log('Adding foreign keys...');
  for (const fk of fks) {
    try {
      await connection.execute(fk);
      console.log('✓ Added FK');
    } catch (e) {
      if (e.code !== 'ER_DUP_KEYNAME') {
        console.error('Error:', e.message);
      }
    }
  }

  console.log('✓ Migration complete');
  await connection.end();
  process.exit(0);
} catch (e) {
  console.error('Fatal error:', e);
  await connection.end();
  process.exit(1);
}
