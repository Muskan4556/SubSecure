-- CreateEnum
CREATE TYPE "SubscriptionCategory" AS ENUM ('ENTERTAINMENT', 'MUSIC', 'PRODUCTIVITY', 'CLOUD_STORAGE', 'DEVELOPMENT', 'EDUCATION', 'HEALTH_FITNESS', 'NEWS_READING', 'GAMING', 'UTILITIES', 'FINANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "CategorySource" AS ENUM ('RULE', 'USER');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "category_new" "SubscriptionCategory",
ADD COLUMN "categorySource" "CategorySource" NOT NULL DEFAULT 'RULE';

-- Migrate existing text category -> enum
UPDATE "Subscription"
SET
  "category_new" = CASE
    WHEN LOWER("category") IN ('entertainment','netflix','hulu','hotstar','disney+','disney plus','amazon prime video','sony liv','zee5','voot','youtube','twitch','crunchyroll') THEN 'ENTERTAINMENT'::"SubscriptionCategory"
    WHEN LOWER("category") IN ('music','spotify','apple music','tidal','gaana','jiosaavn','saavn','amazon music') THEN 'MUSIC'::"SubscriptionCategory"
    WHEN LOWER("category") IN ('productivity','notion','slack','trello','asana','monday','clickup','todoist','evernote','zoom','microsoft365','microsoft 365','office 365','google workspace') THEN 'PRODUCTIVITY'::"SubscriptionCategory"
    WHEN LOWER("category") IN ('cloud storage','cloud_storage','dropbox','google one','icloud','onedrive','box') THEN 'CLOUD_STORAGE'::"SubscriptionCategory"
    WHEN LOWER("category") IN ('development','dev tools','devtools','github','gitlab','bitbucket','figma','vercel','heroku','digitalocean','jetbrains','postman','linear') THEN 'DEVELOPMENT'::"SubscriptionCategory"
    WHEN LOWER("category") IN ('education','coursera','udemy','skillshare','linkedin learning','duolingo','pluralsight') THEN 'EDUCATION'::"SubscriptionCategory"
    WHEN LOWER("category") IN ('health','fitness','health & fitness','health_fitness','headspace','calm','peloton','noom','apple fitness') THEN 'HEALTH_FITNESS'::"SubscriptionCategory"
    WHEN LOWER("category") IN ('news','reading','news & reading','news_reading','medium','substack','new york times','bloomberg','wsj','the economist') THEN 'NEWS_READING'::"SubscriptionCategory"
    WHEN LOWER("category") IN ('gaming','apple arcade','xbox game pass','ps plus','playstation plus','steam','ea play') THEN 'GAMING'::"SubscriptionCategory"
    WHEN LOWER("category") IN ('utilities','1password','lastpass','nordvpn','expressvpn','grammarly','zapier') THEN 'UTILITIES'::"SubscriptionCategory"
    WHEN LOWER("category") IN ('finance','robinhood','zerodha','groww','credit karma','mint') THEN 'FINANCE'::"SubscriptionCategory"
    WHEN "category" IS NOT NULL THEN 'OTHER'::"SubscriptionCategory"
    ELSE 'OTHER'::"SubscriptionCategory"
  END,
  "categorySource" = CASE
    WHEN "category" IS NOT NULL AND "category" != '' THEN 'USER'::"CategorySource"
    ELSE 'RULE'::"CategorySource"
  END;

-- Set remaining NULLs to OTHER
UPDATE "Subscription"
SET "category_new" = 'OTHER'::"SubscriptionCategory"
WHERE "category_new" IS NULL;

-- Drop old text column and rename new column
ALTER TABLE "Subscription" DROP COLUMN "category";
ALTER TABLE "Subscription" RENAME COLUMN "category_new" TO "category";

-- Make category NOT NULL with default OTHER
ALTER TABLE "Subscription" ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "category" SET DEFAULT 'OTHER';

-- CreateTable
CREATE TABLE "AiInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dataHash" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "lastRefreshAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDailyCount" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AiDailyCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiInsight_userId_key" ON "AiInsight"("userId");

-- CreateIndex
CREATE INDEX "AiInsight_userId_idx" ON "AiInsight"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AiDailyCount_date_key" ON "AiDailyCount"("date");

-- CreateIndex
CREATE INDEX "Subscription_userId_category_idx" ON "Subscription"("userId", "category");

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

