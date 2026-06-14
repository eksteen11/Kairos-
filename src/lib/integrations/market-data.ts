const FINNHUB_BASE = "https://finnhub.io/api/v1";
const FRED_BASE = "https://api.stlouisfed.org/fred";
const FMP_BASE = "https://financialmodelingprep.com/api/v3";

function finnhubKey() {
  return process.env.FINNHUB_API_KEY ?? "";
}

function fredKey() {
  return process.env.FRED_API_KEY ?? "";
}

function fmpKey() {
  return process.env.FMP_API_KEY ?? "";
}

export async function fetchFinnhubNews(category = "general") {
  const key = finnhubKey();
  if (!key) return [];

  const res = await fetch(`${FINNHUB_BASE}/news?category=${category}&token=${key}`, {
    next: { revalidate: 900 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchFinnhubCompanyNews(symbol: string, from: string, to: string) {
  const key = finnhubKey();
  if (!key) return [];

  const res = await fetch(
    `${FINNHUB_BASE}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${key}`,
    { next: { revalidate: 900 } }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function fetchFinnhubCandles(symbol: string, from: number, to: number) {
  const key = finnhubKey();
  if (!key) return null;

  const res = await fetch(
    `${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${key}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.s === "ok" ? data : null;
}

export async function fetchFredSeries(seriesId: string, limit = 260) {
  const key = fredKey();
  if (!key) return [];

  const url = `${FRED_BASE}/series/observations?series_id=${seriesId}&api_key=${key}&file_type=json&sort_order=desc&limit=${limit}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.observations ?? [])
    .filter((o: { value: string }) => o.value !== ".")
    .map((o: { date: string; value: string }) => ({
      date: o.date,
      value: parseFloat(o.value),
    }));
}

export async function fetchFmpNews(limit = 20) {
  const key = fmpKey();
  if (!key) return [];

  const res = await fetch(`${FMP_BASE}/stock_news?limit=${limit}&apikey=${key}`, {
    next: { revalidate: 900 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSecFilings() {
  const res = await fetch(
    "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-k&company=&dateb=&owner=include&count=20&output=atom",
    {
      headers: { "User-Agent": "KairosAI/1.0 (contact@kairos.ai)" },
      next: { revalidate: 900 },
    }
  );
  if (!res.ok) return [];

  const text = await res.text();
  const entries = text.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  return entries.map((entry) => {
    const title = entry.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] ?? "";
    const link = entry.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? "";
    const updated = entry.match(/<updated>([^<]+)<\/updated>/)?.[1] ?? "";
    const summary = entry.match(/<summary[^>]*>([^<]+)<\/summary>/)?.[1] ?? "";
    return { title, link, updated, summary };
  });
}

export const RSS_FEEDS = [
  { name: "Reuters Business", url: "https://feeds.reuters.com/reuters/businessNews" },
  { name: "CNBC", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114" },
  { name: "Fed Press", url: "https://www.federalreserve.gov/feeds/press_all.xml" },
];

export async function fetchRssFeed(url: string) {
  const Parser = (await import("rss-parser")).default;
  const parser = new Parser({ timeout: 10000 });
  try {
    const feed = await parser.parseURL(url);
    return (feed.items ?? []).map((item) => ({
      title: item.title ?? "",
      summary: item.contentSnippet ?? item.content ?? "",
      url: item.link ?? "",
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    }));
  } catch {
    return [];
  }
}

export function computeHistoricalVolatility(closes: number[]): number {
  if (closes.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    returns.push(Math.log(closes[i] / closes[i - 1]));
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance * 252) * 100;
}

export function computePercentile(values: number[], current: number): number {
  if (!values.length) return 50;
  const below = values.filter((v) => v < current).length;
  return Math.round((below / values.length) * 100);
}
