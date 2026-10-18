"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // 1. Gọi API xóa cookie
      await fetch("/api/auth/logout", { method: "POST" });

      // 2. Yêu cầu Next.js xóa bộ đệm (cache) hiện tại ở client
      router.refresh();

      // 3. Chuyển hướng an toàn bằng Next.js Router
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleLogout}
      disabled={isLoggingOut}
      title="Logout"
    >
      {isLoggingOut ? (
        <Loader2 className="h-[1.2rem] w-[1.2rem] animate-spin" />
      ) : (
        <LogOut className="h-[1.2rem] w-[1.2rem] transition-all text-muted-foreground hover:text-destructive" />
      )}
      <span className="sr-only">Logout</span>
    </Button>
  );
}
