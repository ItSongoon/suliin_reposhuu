import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "products.json");

async function readProducts() {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function GET() {
  const data = await readProducts();
  return NextResponse.json(data.products ?? data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await readProducts();
  const products = data.products ?? data;
  const newProduct = { ...body, id: `prod_${Date.now()}` };
  products.push(newProduct);
  const toWrite = data.products !== undefined ? { ...data, products } : products;
  await fs.writeFile(filePath, JSON.stringify(toWrite, null, 2));
  return NextResponse.json(newProduct);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const data = await readProducts();
  const products = (data.products ?? data).filter((p: any) => p.id !== id);
  const toWrite = data.products !== undefined ? { ...data, products } : products;
  await fs.writeFile(filePath, JSON.stringify(toWrite, null, 2));
  return NextResponse.json({ ok: true });
}
