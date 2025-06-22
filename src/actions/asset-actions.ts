"use server";

import { PrismaClient } from "@/generated/prisma";
import { getCurrentAppUser } from "./user-actions";

function getPrismaClient() {
  return new PrismaClient();
}

async function getActiveFamilyId(): Promise<string | null> {
  const appUser = await getCurrentAppUser();
  console.log(
    "🔍 getActiveFamilyId - appUser:",
    appUser ? "found" : "not found"
  );
  if (!appUser || !appUser.familyMemberships.length) {
    console.log("❌ No appUser or family memberships found");
    return null;
  }
  const familyId = appUser.familyMemberships[0].familyId;
  console.log("✅ Active family ID:", familyId);
  return familyId;
}

export async function getInvestmentAssets() {
  console.log("🔍 getInvestmentAssets - Starting...");
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    console.log("❌ No family ID found");
    return [];
  }

  const prisma = getPrismaClient();
  try {
    const assets = await prisma.investmentAsset.findMany({
      where: { familyId },
      select: {
        id: true,
        name: true,
        ticker: true,
        assetType: true,
        quantity: true,
      },
      orderBy: { name: "asc" },
    });

    console.log("✅ Found assets:", assets.length);
    console.log("📊 Assets details:", assets);

    return assets.map((asset) => ({
      ...asset,
      quantity: Number(asset.quantity),
    }));
  } catch (error) {
    console.error("❌ Error fetching investment assets:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export interface AssetNewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface RawArticle {
  id?: string;
  uuid?: string;
  url: string;
  title: string;
  source?: string;
  source_name?: string;
  published_at?: string;
  date?: string;
}

export async function getAssetNews(
  tickers: string[]
): Promise<AssetNewsItem[]> {
  console.log("🔍 getAssetNews - Starting with tickers:", tickers);

  if (!tickers.length) {
    console.log("❌ No tickers provided");
    return [];
  }

  const apiToken = process.env.NEWS_API_TOKEN;
  const baseUrl =
    process.env.NEWS_API_URL || "https://api.marketaux.com/v1/news/all";

  console.log("🔧 API Config:", {
    hasApiToken: !!apiToken,
    baseUrl,
    tickersCount: tickers.length,
  });

  try {
    const url =
      `${baseUrl}?symbols=${encodeURIComponent(tickers.join(","))}` +
      (apiToken ? `&api_token=${apiToken}` : "");

    console.log(
      "🌐 Fetching from URL:",
      url.replace(apiToken || "", "[REDACTED]")
    );

    const res = await fetch(url, { next: { revalidate: 300 } });

    console.log("📡 API Response status:", res.status);

    if (!res.ok) {
      console.error("❌ News API error:", res.status, res.statusText);
      throw new Error(`News API error: ${res.status}`);
    }

    const json = await res.json();
    console.log("📄 Raw API response keys:", Object.keys(json));
    console.log(
      "📊 Raw articles count:",
      (json.data ?? json.results ?? []).length
    );

    const articles = (json.data ?? json.results ?? []) as RawArticle[];

    const formattedNews = articles.map((item) => ({
      id: item.id ?? item.uuid ?? item.url,
      title: item.title,
      url: item.url,
      source: item.source ?? item.source_name ?? "",
      publishedAt: item.published_at ?? item.date ?? "",
    }));

    console.log("✅ Formatted news items:", formattedNews.length);
    if (formattedNews.length > 0) {
      console.log("📰 First news item:", formattedNews[0]);
    }

    return formattedNews;
  } catch (error) {
    console.error("❌ Error fetching asset news:", error);
    return [];
  }
}

export async function getNewsForUserAssets() {
  console.log("🔍 getNewsForUserAssets - Starting...");

  const assets = await getInvestmentAssets();
  console.log("📊 Retrieved assets:", assets.length);

  const tickers = assets.map((a) => a.ticker).filter(Boolean);
  console.log("🎯 Extracted tickers:", tickers);

  const news = await getAssetNews(tickers);
  console.log("📰 Final news count:", news.length);

  return news;
}
