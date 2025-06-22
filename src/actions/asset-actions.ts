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
  tickers: string[],
): Promise<AssetNewsItem[]> {
  if (!tickers.length) return [];

  const apiToken = process.env.NEWS_API_TOKEN;
  const baseUrl =
    process.env.NEWS_API_URL || "https://api.marketaux.com/v1/news/all";

  try {
    const url =
      `${baseUrl}?symbols=${encodeURIComponent(tickers.join(","))}` +
      (apiToken ? `&api_token=${apiToken}` : "");

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      throw new Error(`News API error: ${res.status}`);
    }

    const json = await res.json();
    const articles = (json.data ?? json.results ?? []) as RawArticle[];

    return articles.map((item) => ({
      id: item.id ?? item.uuid ?? item.url,
      title: item.title,
      url: item.url,
      source: item.source ?? item.source_name ?? "",
      publishedAt: item.published_at ?? item.date ?? "",
    }));
  } catch (error) {
    console.error("Error fetching asset news:", error);
    return [];
  }
}

export async function getNewsForUserAssets() {
  const assets = await getInvestmentAssets();
  const tickers = assets.map((a) => a.ticker).filter(Boolean);
  return await getAssetNews(tickers);
}
