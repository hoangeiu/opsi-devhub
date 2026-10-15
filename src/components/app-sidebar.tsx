"use client";

import * as React from "react";
import {
  Key,
  TerminalSquare,
  Database,
  Server,
  Settings,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

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
            {/* THAY ĐỔI: Dùng render thay cho asChild ở Logo */}
            <SidebarMenuButton
              size="lg"
              render={
                <Link href="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Terminal className="size-4" />
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

      <SidebarRail />
    </Sidebar>
  );
}
