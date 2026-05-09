CREATE TABLE `athlete_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(128) NOT NULL,
	`bio` text,
	`avatar` varchar(512),
	`sport` varchar(64) NOT NULL,
	`skillLevel` enum('amateur','competitive') NOT NULL,
	`isPublic` boolean DEFAULT true,
	`totalXP` int DEFAULT 0,
	`currentLevel` int DEFAULT 1,
	`currentStreak` int DEFAULT 0,
	`totalAchievements` int DEFAULT 0,
	`mentalPerformanceScore` float DEFAULT 0,
	`followerCount` int DEFAULT 0,
	`followingCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `athlete_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `athlete_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `battle_pass_seasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonNumber` int NOT NULL,
	`title` varchar(128) NOT NULL,
	`description` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `battle_pass_seasons_id` PRIMARY KEY(`id`),
	CONSTRAINT `battle_pass_seasons_seasonNumber_unique` UNIQUE(`seasonNumber`)
);
--> statement-breakpoint
CREATE TABLE `battle_pass_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonId` int NOT NULL,
	`tierNumber` int NOT NULL,
	`xpRequired` int NOT NULL,
	`freeReward` varchar(256),
	`premiumReward` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `battle_pass_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `biometric_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`wearableDeviceId` int,
	`dataType` enum('heart_rate','hrv','sleep','stress','activity') NOT NULL,
	`value` float NOT NULL,
	`unit` varchar(32),
	`timestamp` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `biometric_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `followers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `followers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mental_performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`focus` float DEFAULT 0,
	`composure` float DEFAULT 0,
	`confidence` float DEFAULT 0,
	`clutchRating` float DEFAULT 0,
	`overallScore` float DEFAULT 0,
	`timestamp` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mental_performance_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personalization_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`peakPerformanceTimes` json,
	`mentalTriggers` json,
	`adaptiveDifficulty` enum('easy','medium','hard') DEFAULT 'medium',
	`preferredCoachingStyle` enum('motivational','analytical','balanced') DEFAULT 'balanced',
	`notificationPreference` enum('all','important','none') DEFAULT 'all',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personalization_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `personalization_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `push_notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`streakReminders` boolean DEFAULT true,
	`challengeAlerts` boolean DEFAULT true,
	`socialUpdates` boolean DEFAULT true,
	`newContent` boolean DEFAULT true,
	`optimalSendTime` varchar(5),
	`timezone` varchar(64) DEFAULT 'UTC',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `push_notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_battle_pass_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`seasonId` int NOT NULL,
	`hasPremium` boolean DEFAULT false,
	`currentTier` int DEFAULT 0,
	`totalXP` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_battle_pass_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceType` enum('apple_watch','garmin','oura_ring','fitbit') NOT NULL,
	`deviceName` varchar(128),
	`externalId` varchar(256) NOT NULL,
	`accessToken` text,
	`isActive` boolean DEFAULT true,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wearable_devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `athlete_profiles` ADD CONSTRAINT `athlete_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `battle_pass_tiers` ADD CONSTRAINT `battle_pass_tiers_seasonId_battle_pass_seasons_id_fk` FOREIGN KEY (`seasonId`) REFERENCES `battle_pass_seasons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `biometric_data` ADD CONSTRAINT `biometric_data_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `biometric_data` ADD CONSTRAINT `biometric_data_wearableDeviceId_wearable_devices_id_fk` FOREIGN KEY (`wearableDeviceId`) REFERENCES `wearable_devices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `followers` ADD CONSTRAINT `followers_followerId_users_id_fk` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `followers` ADD CONSTRAINT `followers_followingId_users_id_fk` FOREIGN KEY (`followingId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mental_performance_metrics` ADD CONSTRAINT `mental_performance_metrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mental_performance_metrics` ADD CONSTRAINT `mental_performance_metrics_sessionId_session_logs_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `session_logs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personalization_preferences` ADD CONSTRAINT `personalization_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_notification_preferences` ADD CONSTRAINT `push_notification_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_battle_pass_progress` ADD CONSTRAINT `user_battle_pass_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_battle_pass_progress` ADD CONSTRAINT `user_battle_pass_progress_seasonId_battle_pass_seasons_id_fk` FOREIGN KEY (`seasonId`) REFERENCES `battle_pass_seasons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wearable_devices` ADD CONSTRAINT `wearable_devices_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;