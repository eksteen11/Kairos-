import { readFileSync } from "fs";
import { Client } from "pg";

const envContent = readFileSync(".env.local", "utf8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const sql = readFileSync("supabase/migrations/0001_init.sql", "utf8");

async function main() {
  const client = new Client({
    host: "aws-0-eu-west-1.pooler.supabase.com",
    port: 5432,
    database: "postgres",
    user: "postgres.hlfbwerpbawwjokdhuos",
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Supabase Postgres");
    await client.query(sql);
    console.log("Migration applied successfully");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("already exists")) {
      console.log("Tables already exist — skipping");
    } else {
      console.error("Migration failed:", msg);
      console.log("\nFallback: paste supabase/migrations/0001_init.sql in Supabase SQL Editor");
      process.exit(1);
    }
  } finally {
    await client.end().catch(() => {});
  }
}

main();
