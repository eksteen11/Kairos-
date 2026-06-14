import { z } from "zod";
import OpenAI from "openai";
import type { NewsEntities } from "@/types";

export const newsScoreSchema = z.object({
  impact_score: z.coerce.number().min(0).max(100),
  confidence_score: z.coerce.number().min(0).max(100),
  urgency_score: z.coerce.number().min(0).max(100),
  economic_importance: z.coerce.number().min(0).max(100),
  summary: z.string(),
  entities: z.object({
    countries: z.array(z.string()).optional(),
    tickers: z.array(z.string()).optional(),
    commodities: z.array(z.string()).optional(),
    sectors: z.array(z.string()).optional(),
  }).optional().default({}),
});

export type NewsScore = z.infer<typeof newsScoreSchema>;

export async function scoreNewsEvent(title: string, summary: string, source: string): Promise<NewsScore> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return heuristicScore(title, summary);
  }

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a world-class macro economist at a global hedge fund. Score news events for economic market impact. Return valid JSON only.",
      },
      {
        role: "user",
        content: `Score this news event:\nSource: ${source}\nTitle: ${title}\nSummary: ${summary}\n\nReturn JSON: { impact_score, confidence_score, urgency_score, economic_importance (0-100 each), summary (1 sentence), entities: { countries, tickers, commodities, sectors } }`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  try {
    return newsScoreSchema.parse(JSON.parse(text));
  } catch {
    return heuristicScore(title, summary);
  }
}

function heuristicScore(title: string, summary: string): NewsScore {
  const text = `${title} ${summary}`.toLowerCase();
  const macroKeywords = ["fed", "rate", "inflation", "china", "oil", "opec", "gdp", "stimulus", "tariff", "war"];
  const hits = macroKeywords.filter((k) => text.includes(k)).length;
  const base = Math.min(95, 50 + hits * 8);

  const entities: NewsEntities = {};
  if (text.includes("china")) entities.countries = ["China"];
  if (text.includes("oil") || text.includes("opec")) entities.commodities = ["Crude Oil"];
  if (text.includes("fed") || text.includes("rate")) entities.sectors = ["Banks"];

  return {
    impact_score: base,
    confidence_score: 70,
    urgency_score: Math.min(90, base - 5),
    economic_importance: base,
    summary: summary.slice(0, 200) || title,
    entities,
  };
}
