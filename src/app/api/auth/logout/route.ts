import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Xóa cookie an toàn từ server (Hỗ trợ Next.js 15)
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");

  return NextResponse.json({ success: true, message: "Logged out" });
}
