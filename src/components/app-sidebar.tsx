"use client";

import * as React from "react";
import Image from "next/image";
import { Key, TerminalSquare, Database, Server, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// ----------------------------------------------------------------------
// SVG CUSTOME ICONS (Thay thế cho Brand Icons đã bị xóa của Lucide)
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

const navItems = [
  {
    title: "Platform Tools",
    items: [
      { title: "JWT Manager", url: "/jwt-manager", icon: Key },
      { title: "Commands Hub", url: "/commands", icon: TerminalSquare },
      { title: "AI Test Data", url: "/ai-test-data", icon: Database },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { title: "DevOps Configs", url: "/devops-configs", icon: Server },
      { title: "Environments", url: "/settings/environments", icon: Settings },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link href="/">
                  {/* Sử dụng next/image với cờ unoptimized */}
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden border border-border/50 shrink-0">
                    <Image
                      src="https://avatars.githubusercontent.com/u/61035309?v=4"
                      alt="hoangeiu"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Ops Hub</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Internal Tools
                    </span>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {navItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={
                        <Link
                          href={item.url}
                          className="flex items-center gap-3 w-full"
                        >
                          <item.icon className="size-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-3 p-3 overflow-hidden group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground font-mono font-medium truncate group-data-[collapsible=icon]:hidden">
                hoangeiu &copy; 2026
              </span>
              <div className="flex items-center gap-3 group-data-[collapsible=icon]:flex-col">
                <a
                  href="https://github.com/hoangeiu/"
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <GithubIcon className="size-4 shrink-0" />
                </a>
                <a
                  href="https://www.linkedin.com/in/hoangeiu/"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LinkedinIcon className="size-4 shrink-0" />
                </a>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
