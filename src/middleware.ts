import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các file tĩnh và API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  const isLoginPage = pathname === "/login";

  // 1. CHƯA ĐĂNG NHẬP
  if (!token) {
    if (isLoginPage) return NextResponse.next(); // Đang ở trang login thì cho qua
    return NextResponse.redirect(new URL("/login", request.url)); // Ở trang khác thì đá về login
  }

  // 2. ĐÃ CÓ TOKEN -> XÁC THỰC
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secretKey);

    // Nếu token chuẩn mà lại mò vào /login -> Đá về home
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // 3. TOKEN HẾT HẠN HOẶC SAI
    const response = isLoginPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete("auth_token"); // Xóa token hỏng
    return response;
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
