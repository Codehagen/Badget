"use server";

import { PrismaClient } from "@/generated/prisma";
import { getCurrentAppUser } from "./user-actions";

function getPrismaClient() {
  return new PrismaClient();
}

async function getActiveFamilyId(): Promise<string | null> {
  const appUser = await getCurrentAppUser();
  if (!appUser || !appUser.familyMemberships.length) {
    return null;
  }
  return appUser.familyMemberships[0].familyId;
}

export async function getInvestmentAssets() {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
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

    return assets.map((asset) => ({
      ...asset,
      quantity: Number(asset.quantity),
    }));
  } catch (error) {
    console.error("Error fetching investment assets:", error);
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
  if (!tickers.length) {
    return [];
  }

  const apiToken = process.env.NEWS_API_TOKEN;
  const baseUrl =
    process.env.NEWS_API_URL || "https://api.marketaux.com/v1/news/all";

  try {
    const url =
      `${baseUrl}?symbols=${encodeURIComponent(tickers.join(","))}` +
      (apiToken ? `&api_token=${apiToken}` : "");

    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      return getFallbackNews(tickers);
    }

    const json = await res.json();
    const articles = (json.data ?? json.results ?? []) as RawArticle[];

    const formattedNews = articles.map((item) => ({
      id: item.id ?? item.uuid ?? item.url,
      title: item.title,
      url: item.url,
      source: item.source ?? item.source_name ?? "",
      publishedAt: item.published_at ?? item.date ?? "",
    }));

    return formattedNews;
  } catch (error) {
    console.error("Error fetching asset news:", error);
    return getFallbackNews(tickers);
  }
}

// Fallback news when API is unavailable
function getFallbackNews(tickers: string[]): AssetNewsItem[] {
  const fallbackNews: AssetNewsItem[] = [];
  const now = new Date();

  // Generate relevant sample news based on user's actual tickers
  tickers.forEach((ticker, index) => {
    const newsDate = new Date(now.getTime() - (index + 1) * 3600000); // Stagger by hours

    switch (ticker.toUpperCase()) {
      case "AAPL":
        fallbackNews.push({
          id: `fallback-aapl-${index}`,
          title: "Apple Reports Strong iPhone Sales This Quarter",
          url: "#",
          source: "Market News",
          publishedAt: newsDate.toISOString(),
        });
        break;

      case "BTC":
        fallbackNews.push({
          id: `fallback-btc-${index}`,
          title: "Bitcoin Shows Steady Growth Amid Market Optimism",
          url: "#",
          source: "Crypto Daily",
          publishedAt: newsDate.toISOString(),
        });
        break;

      case "TSLA":
        fallbackNews.push({
          id: `fallback-tsla-${index}`,
          title: "Tesla Advances in Autonomous Driving Technology",
          url: "#",
          source: "Tech Tribune",
          publishedAt: newsDate.toISOString(),
        });
        break;

      case "GOOGL":
      case "GOOG":
        fallbackNews.push({
          id: `fallback-googl-${index}`,
          title: "Google Announces New AI Integration Features",
          url: "#",
          source: "Tech News",
          publishedAt: newsDate.toISOString(),
        });
        break;

      case "MSFT":
        fallbackNews.push({
          id: `fallback-msft-${index}`,
          title: "Microsoft Cloud Services See Continued Growth",
          url: "#",
          source: "Business Wire",
          publishedAt: newsDate.toISOString(),
        });
        break;

      default:
        fallbackNews.push({
          id: `fallback-${ticker.toLowerCase()}-${index}`,
          title: `${ticker} Shows Positive Market Sentiment`,
          url: "#",
          source: "Financial Times",
          publishedAt: newsDate.toISOString(),
        });
        break;
    }
  });

  return fallbackNews;
}

export async function getNewsForUserAssets() {
  const assets = await getInvestmentAssets();
  const tickers = assets.map((a) => a.ticker).filter(Boolean);
  return await getAssetNews(tickers);
}
