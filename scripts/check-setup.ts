import { readFileSync } from "fs";

const envContent = readFileSync(".env.local", "utf8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function sbFetch(path: string) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}

async function main() {
  const sb = await sbFetch("economic_nodes?select=id&limit=1");

  if (sb.status === 404 || sb.body.includes("does not exist")) {
    console.log("TABLES MISSING");
    console.log("→ Open https://supabase.com/dashboard/project/hlfbwerpbawwjokdhuos/sql");
    console.log("→ Paste contents of supabase/migrations/0001_init.sql and run");
    process.exit(1);
  }

  console.log(sb.ok ? "Supabase connected" : `Supabase error: ${sb.status} ${sb.body}`);

  const finnhub = await fetch(
    "https://finnhub.io/api/v1/news?category=general&token=" + process.env.FINNHUB_API_KEY
  );
  console.log(finnhub.ok ? "Finnhub OK" : "Finnhub FAIL " + finnhub.status);

  const fred = await fetch(
    "https://api.stlouisfed.org/fred/series/observations?series_id=VIXCLS&api_key=" +
      process.env.FRED_API_KEY + "&file_type=json&limit=1"
  );
  console.log(fred.ok ? "FRED OK" : "FRED FAIL " + fred.status);

  const fmp = await fetch(
    "https://financialmodelingprep.com/api/v3/stock_news?limit=1&apikey=" + process.env.FMP_API_KEY
  );
  console.log(fmp.ok ? "FMP OK" : "FMP FAIL " + fmp.status);
}

main().catch(console.error);
