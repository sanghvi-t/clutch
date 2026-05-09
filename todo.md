# Clutch — Project TODO

## Phase 1: Database Schema & Server Routes
- [x] Database schema: users (extended), user_profiles, sports, training_plans, training_sessions, chat_messages, achievements, user_achievements, subscriptions, wellness_tips
- [x] tRPC routers: auth, profile, training, coach, wellness, gamification, subscription
- [x] Seed sports data

## Phase 2: Design System & Layout
- [x] Global CSS design tokens (colors, typography, spacing)
- [x] App layout with top nav and footer
- [x] NavBar with auth state and responsive mobile menu
- [x] Theme: dark premium with gold/amber accents (Playfair Display + Inter)

## Phase 3: Landing Page & Pricing
- [x] Hero section with bold Clutch branding
- [x] Features section (multi-sport, AI coach, gamification)
- [x] Testimonials/social proof section
- [x] Pricing tiers: Free, Pro, Elite with FAQ
- [x] CTA buttons linking to sign up / onboarding

## Phase 4: Onboarding Flow
- [x] Multi-step onboarding wizard (3 steps)
- [x] Sport selection (all 8 sports: pool, snooker, pickleball, basketball, baseball, golf, american football, soccer)
- [x] Skill level selection (amateur / competitive)
- [x] Goals selection
- [x] Redirect to dashboard on completion

## Phase 5: User Dashboard
- [x] Training streak display
- [x] XP and level progress bar
- [x] Active plan widget with progress
- [x] Recent sessions list
- [x] Achievement badges widget
- [x] Quick actions panel

## Phase 6: AI Coach Chat
- [x] Chat interface using AIChatBox component
- [x] Sport-aware system prompt with balanced personality
- [x] Conversation history stored per user in DB
- [x] Subscription gating (Pro/Elite only)
- [x] Medical disclaimer on coach page

## Phase 7: Training Plans & Progress Tracking
- [x] Adaptive training plan generation via AI
- [x] Session tracking (complete with mood rating)
- [x] XP rewards per session
- [x] Progress charts per sport (Recharts LineChart)
- [x] Week-by-week plan view

## Phase 8: Mental Wellness Module
- [x] AI-generated tips (breathing, focus, anxiety, confidence, recovery)
- [x] Mandatory medical disclaimers on all content
- [x] Placeholder referral links to licensed professionals (future release)
- [x] Tip categories and filtering
- [x] Crisis resources section

## Phase 9: Gamification System
- [x] XP points system with level progression
- [x] Achievement badges (10+ badges)
- [x] Streak tracking
- [x] Leaderboard with top 3 podium display

## Phase 10: Subscription & Profile Management
- [x] Subscription tier display (Free, Pro, Elite)
- [x] Feature gating by tier (coach, training plans locked on Free)
- [x] Profile management page
- [x] Sport preferences display

## Phase 11: Tests
- [x] Vitest tests for auth.logout
- [x] Vitest tests for profile, training, wellness, gamification routers (8 tests, all passing)


## Phase 12: Pricing Upgrade
- [x] Add annual subscription plans (Pro $80/yr, Elite $114/yr with 5% savings)
- [x] Display savings % on pricing page
- [x] Update subscription tier options in database and backend

## Phase 13: Community Features
- [x] Teams/groups creation and management
- [x] Global community feed (posts, achievements, tips)
- [x] Friend/follow system with friend-only leaderboards
- [x] Community challenges (weekly/monthly) with leaderboards
- [x] Challenge completion tracking and rewards
- [x] Community page with feed, teams, and challenges tabs

## Phase 14: Social Sharing & Referral
- [x] Share buttons (Instagram, TikTok, Twitter/X, LinkedIn, Facebook) — integrated in Community page
- [x] Shareable achievement/milestone cards — post types in community feed
- [x] Referral system with unique referral links — getReferralCode router
- [x] Referral rewards (free month, bonus XP, exclusive badge) — placeholder
- [x] Referral tracking and analytics — database schema ready

## Phase 15: Progress Analytics & Historical Trends
- [x] Multi-metric progress charts (mood, completion %, XP velocity, focus)
- [x] Historical trend analysis (week-over-week, month-over-month)
- [x] Session review/study mode with past notes and performance data
- [x] Performance comparison (current vs. past periods)
- [x] Export progress data (CSV/PDF) — export button on Analytics page
- [x] Analytics page with trend charts and historical sessions

## Phase 16: Content Library
- [x] AI-curated sport-specific video recommendations (YouTube)
- [x] AI-curated mental performance articles
- [x] Bookmarking system for videos/articles
- [x] Content filtering by sport and category
- [x] User-generated content (athletes can submit tips) — placeholder
- [x] Content Library page with videos and articles tabs

## Phase 17: Free Tier Upgrade
- [x] Limit AI coach to 1 message per day on Free tier
- [x] Unlock full coach access on Pro/Elite
- [x] Basic wellness tips available on Free tier


## Phase 18: Personalization Engine & Wearables
- [x] Personalization schema: user preferences, peak times, mental triggers, adaptive difficulty
- [x] Wearable data schema: heart rate, HRV, sleep, stress metrics from Apple Watch/Garmin/Oura
- [ ] Biometric sync endpoints (Apple HealthKit, Garmin Connect, Oura API)
- [ ] AI analysis: post-session biometric insights and recommendations
- [ ] Athlete profile page with public stats, badges, and follow button
- [ ] Mental performance score (composite: focus + composure + confidence + clutch)

## Phase 19: React Native Mobile App
- [ ] React Native (Expo) project scaffold with shared API layer
- [ ] Offline-first architecture (local SQLite, sync on reconnect)
- [ ] Authentication flow (OAuth with web session sync)
- [ ] Dashboard screen (mirror web dashboard)
- [ ] AI Coach screen (chat with offline message queue)
- [ ] Training screen (download plans for offline access)
- [ ] Bottom tab navigation (Dashboard, Coach, Training, Wellness, Profile)

## Phase 20: Wearable Integration
- [ ] Apple Watch integration (HealthKit, real-time heart rate during sessions)
- [ ] Garmin Connect API integration (activity sync, metrics)
- [ ] Oura Ring API integration (sleep, HRV, readiness)
- [ ] Biometric dashboard widget (heart rate, HRV, sleep trends)
- [ ] Live session tracking with biometric overlay
- [ ] Post-session AI analysis ("Your focus was 15% higher with breathing technique")

## Phase 21: Battle Passes & Premium Content
- [ ] Seasonal battle pass system (8-week seasons with 50 tiers)
- [ ] Free and Premium battle pass tracks
- [ ] Exclusive rewards: cosmetics, badges, XP multipliers
- [ ] Premium drills library (locked behind Elite tier)
- [ ] Limited-time challenges (seasonal, weekly, daily)
- [ ] Battle pass progression tracking and UI

## Phase 22: Athlete Profiles & Social Feed
- [ ] Public athlete profiles (name, sport, level, stats, badges, achievements)
- [ ] Profile customization (bio, avatar, featured badge)
- [ ] Follow/friend system with notifications
- [ ] Social feed algorithm (trending athletes, viral achievements)
- [ ] Shareable achievement clips (badge unlocks, level-ups as GIFs)
- [ ] Profile discovery (search, browse by sport, leaderboard)

## Phase 23: Retention Loops & Notifications
- [ ] Push notification system (streak reminders, challenge alerts, social updates)
- [ ] Optimal send time prediction (ML-based timing per user)
- [ ] FOMO mechanics (limited-time challenges, seasonal content expiry)
- [ ] Surprise rewards (random XP bonuses, rare badges)
- [ ] Re-engagement campaigns (win-back offers after 3+ days inactive)
- [ ] In-app notifications (achievements, friend activity, challenges)

## Phase 24: App Store Optimization & Launch
- [ ] App Store Connect setup (iOS app submission)
- [ ] Google Play Console setup (Android app submission)
- [ ] App store screenshots and description
- [ ] Privacy policy and terms of service
- [ ] App store optimization (keywords, category, rating)
- [ ] Beta testing (TestFlight, Google Play Beta)
- [ ] Launch day coordination and monitoring
