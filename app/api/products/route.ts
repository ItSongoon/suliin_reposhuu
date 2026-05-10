import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");

  const raw = await fs.readFile(path.join(process.cwd(), "data", "products.json"), "utf-8");
  const data = JSON.parse(raw);
  let products = data.products ?? data;

  if (storeId) {
    products = products.filter((p: any) => p.storeId === storeId);
  }

  return NextResponse.json({ products });
}
