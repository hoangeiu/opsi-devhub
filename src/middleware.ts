import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các file tĩnh, API login, và trang login
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname === "/login" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  // Nếu không có token -> đá về trang Login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Xác thực token bằng jose
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secretKey);

    // Hợp lệ thì cho đi tiếp
    return NextResponse.next();
  } catch (error) {
    // Token sai, hết hạn (12h) -> đá về Login
    console.error("JWT Verification failed:", error);

    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token"); // Xóa token hỏng
    return response;
  }
}

// Chỉ áp dụng middleware cho các route cần thiết (tránh chặn nhầm)
export const config = {
  matcher: ["/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)"],
};
