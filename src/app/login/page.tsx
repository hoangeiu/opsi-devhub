"use client";

import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // Thêm useEffect
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// ----------------------------------------------------------------------
// SVG CUSTOM ICONS (Github & Linkedin)
// ----------------------------------------------------------------------
function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
// ----------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // BẢO VỆ: Ép reset trạng thái mỗi khi trang login được mở/render lại
  useEffect(() => {
    setLoading(false);
    setPassword("");
  }, []);

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

      router.refresh();
      router.push("/");

      setTimeout(() => {
        setLoading(false);
      }, 800);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl">
        <CardHeader className="space-y-3 items-center text-center pb-6">
          {/* Avatar thay cho TerminalSquare */}
          <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 overflow-hidden border border-border/50 shadow-sm shrink-0">
            <Image
              src="https://avatars.githubusercontent.com/u/61035309?v=4"
              alt="hoangeiu"
              width={56}
              height={56}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            OpsI Hub
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

      <div className="absolute bottom-6 flex flex-col items-center gap-3 text-muted-foreground z-10">
        <span className="text-xs font-mono font-medium tracking-wide">
          hoangeiu &copy; 2026
        </span>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/hoangeiu/"
            target="_blank"
            rel="noreferrer"
            title="GitHub"
            className="hover:text-foreground transition-colors duration-200"
          >
            <GithubIcon className="size-4.5" />
          </a>
          <a
            href="https://www.linkedin.com/in/hoangeiu/"
            target="_blank"
            rel="noreferrer"
            title="LinkedIn"
            className="hover:text-foreground transition-colors duration-200"
          >
            <LinkedinIcon className="size-4.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
