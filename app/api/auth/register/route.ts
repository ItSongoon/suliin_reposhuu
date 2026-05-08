import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { User } from "@/lib/types";
export const dynamic = "force-dynamic";
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function validateMongolianRegister(registerNumber: string): boolean {
  // Mongolian register number format: 2 letters + 8 digits (e.g., РД98010123)
  const regex = /^[А-ЯЁҮӨ]{2}\d{8}$/i;
  return regex.test(registerNumber);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registerNumber, firstName, lastName, phone, email, password } = body;

    // Validate register number
    if (!validateMongolianRegister(registerNumber)) {
      return NextResponse.json(
        { error: "Регистрийн дугаар буруу байна. Жишээ: РД98010123" },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "Нууц үг хамгийн багадаа 4 тэмдэгт байх ёстой." },
        { status: 400 }
      );
    }

    // Read existing users
    const fileContent = await fs.readFile(USERS_FILE, "utf-8");
    const data = JSON.parse(fileContent);

    // Check if user already exists
    const existingUser = data.users.find(
      (u: User) => u.registerNumber.toUpperCase() === registerNumber.toUpperCase()
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "Энэ регистрийн дугаараар бүртгэл үүссэн байна" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      registerNumber: registerNumber.toUpperCase(),
      password,
      firstName,
      lastName,
      phone,
      email,
      createdAt: new Date().toISOString(),
    };

    // Save user
    data.users.push(newUser);
    await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));

    // Don't send password to client
    const { password: _, ...safeUser } = newUser;
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Бүртгэл үүсгэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}

