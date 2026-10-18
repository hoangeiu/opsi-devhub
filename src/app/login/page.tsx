"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // 1. Yêu cầu Next.js cập nhật lại cache/state để nhận diện HTTP-Only Cookie mới
      router.refresh();
      // 2. Chuyển hướng mượt mà bằng Next.js Router
      router.push("/");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[60px_60px]" />

      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl">
        <CardHeader className="space-y-3 items-center text-center pb-6">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
            <TerminalSquare className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Ops Hub
          </CardTitle>
          <CardDescription>
            Internal Operations & Developer Tools
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="system"
                required
                className="bg-muted/50"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="bg-muted/50 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-sm text-destructive">
                <span>⚠️</span> {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="size-4 mr-2" />
              )}
              {loading ? "Authenticating..." : "Secure Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
