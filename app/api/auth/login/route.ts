import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { User } from "@/lib/types";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registerNumber, password } = body;

    // Read users
    const fileContent = await fs.readFile(USERS_FILE, "utf-8");
    const data = JSON.parse(fileContent);

    // Find user
    const user = data.users.find(
      (u: User) => u.registerNumber.toUpperCase() === registerNumber.toUpperCase()
    );

    if (!user) {
      return NextResponse.json(
        { error: "Хэрэглэгч олдсонгүй. Эхлээд бүртгүүлнэ үү." },
        { status: 404 }
      );
    }

    // Check password
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Нууц үг буруу байна." },
        { status: 401 }
      );
    }

    // Don't send password to client
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Нэвтрэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
