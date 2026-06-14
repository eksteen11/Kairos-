import { NextResponse } from "next/server";
import { getEdges, getNodes } from "@/lib/data/queries";

export async function GET() {
  const [nodes, edges] = await Promise.all([getNodes(), getEdges()]);
  return NextResponse.json({ nodes, edges });
}
