import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase/client";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 },
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("12h")
      .sign(secretKey);

    // FIX NEXT.JS 15: Thêm await trước hàm cookies()
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return NextResponse.json({
      success: true,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
