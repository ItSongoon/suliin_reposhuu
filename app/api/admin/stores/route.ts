import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "stores.json");

async function readStores() {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function GET() {
  const data = await readStores();
  return NextResponse.json(data.stores ?? data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await readStores();
  const stores = data.stores ?? data;
  const newStore = { ...body, id: `store_${Date.now()}` };
  stores.push(newStore);
  const toWrite = data.stores !== undefined ? { ...data, stores } : stores;
  await fs.writeFile(filePath, JSON.stringify(toWrite, null, 2));
  return NextResponse.json(newStore);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const data = await readStores();
  const stores = (data.stores ?? data).filter((s: any) => s.id !== id);
  const toWrite = data.stores !== undefined ? { ...data, stores } : stores;
  await fs.writeFile(filePath, JSON.stringify(toWrite, null, 2));
  return NextResponse.json({ ok: true });
}
