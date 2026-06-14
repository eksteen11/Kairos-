import { createHash } from "crypto";
import type { RawNewsItem } from "@/types";

export function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 32);
}

export function dedupeNews(items: RawNewsItem[]): RawNewsItem[] {
  const seen = new Set<string>();
  const result: RawNewsItem[] = [];

  for (const item of items) {
    const key = hashUrl(item.url || item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

export function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

export async function ingestAllNews(): Promise<RawNewsItem[]> {
  const {
    fetchFinnhubNews,
    fetchFmpNews,
    fetchSecFilings,
    fetchRssFeed,
    RSS_FEEDS,
  } = await import("@/lib/integrations/market-data");

  const all: RawNewsItem[] = [];

  const [finnhub, fmp, sec, ...rssResults] = await Promise.allSettled([
    fetchFinnhubNews("general"),
    fetchFmpNews(15),
    fetchSecFilings(),
    ...RSS_FEEDS.map((f) => fetchRssFeed(f.url)),
  ]);

  if (finnhub.status === "fulfilled") {
    for (const item of finnhub.value) {
      all.push({
        title: item.headline ?? item.title ?? "",
        summary: item.summary ?? "",
        source: item.source ?? "Finnhub",
        url: item.url ?? item.id?.toString() ?? "",
        publishedAt: new Date((item.datetime ?? 0) * 1000),
        rawPayload: item,
      });
    }
  }

  if (fmp.status === "fulfilled") {
    for (const item of fmp.value) {
      all.push({
        title: item.title ?? "",
        summary: item.text ?? "",
        source: item.site ?? "FMP",
        url: item.url ?? "",
        publishedAt: new Date(item.publishedDate ?? Date.now()),
        rawPayload: item,
      });
    }
  }

  if (sec.status === "fulfilled") {
    for (const item of sec.value) {
      all.push({
        title: item.title,
        summary: item.summary,
        source: "SEC EDGAR",
        url: item.link,
        publishedAt: new Date(item.updated || Date.now()),
        rawPayload: item,
      });
    }
  }

  rssResults.forEach((result, i) => {
    if (result.status !== "fulfilled") return;
    const feedName = RSS_FEEDS[i]?.name ?? "RSS";
    for (const item of result.value) {
      all.push({
        title: item.title,
        summary: item.summary,
        source: feedName,
        url: item.url,
        publishedAt: item.publishedAt,
      });
    }
  });

  return dedupeNews(all).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}
