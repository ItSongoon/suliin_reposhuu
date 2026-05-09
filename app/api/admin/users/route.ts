import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "users.json");

async function readData() {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function GET() {
  const data = await readData();
  const users = data.users ?? data;
  return NextResponse.json(users.map((u: any) => ({ ...u, password: undefined })));
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const data = await readData();
  const users = (data.users ?? data).filter((u: any) => u.id !== id);
  const toWrite = data.users !== undefined ? { ...data, users } : users;
  await fs.writeFile(filePath, JSON.stringify(toWrite, null, 2));
  return NextResponse.json({ ok: true });
}
