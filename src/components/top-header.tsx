"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  TerminalSquare,
  Rocket,
  Settings,
  LayoutDashboard,
  Server,
  KeyRound,
  Bot,
  FileCode2,
} from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";
import { LogoutButton } from "./logout";
import { supabase } from "@/lib/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function TopHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // States lưu trữ dữ liệu từ toàn bộ các table
  const [commands, setCommands] = useState<any[]>([]);
  const [enhancements, setEnhancements] = useState<any[]>([]);
  const [environments, setEnvironments] = useState<any[]>([]);
  const [jwts, setJwts] = useState<any[]>([]);
  const [aiData, setAiData] = useState<any[]>([]);
  const [devopsConfigs, setDevopsConfigs] = useState<any[]>([]);

  // Bắt phím tắt ⌘K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch toàn bộ Database song song 1 lần duy nhất khi mở bảng Search
  useEffect(() => {
    if (open && !hasFetched) {
      const fetchAllSearchData = async () => {
        try {
          const [cmdRes, enhRes, envRes, jwtRes, aiRes, devopsRes] =
            await Promise.all([
              supabase.from("commands").select("id, title, template"),
              supabase.from("future_enhancements").select("id, title"),
              supabase.from("environments").select("id, tenant, cluster, cidr"),
              supabase.from("jwts").select("id, token, environments(tenant)"), // Join lấy tên tenant
              supabase.from("ai_test_data").select("id, title"),
              supabase.from("devops_configs").select("id, title, content"),
            ]);

          if (cmdRes.data) setCommands(cmdRes.data);
          if (enhRes.data) setEnhancements(enhRes.data);
          if (envRes.data) setEnvironments(envRes.data);
          if (jwtRes.data) setJwts(jwtRes.data);
          if (aiRes.data) setAiData(aiRes.data);
          if (devopsRes.data) setDevopsConfigs(devopsRes.data);

          setHasFetched(true);
        } catch (error) {
          console.error("Error fetching global search data:", error);
        }
      };
      fetchAllSearchData();
    }
  }, [open, hasFetched]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-border hidden sm:block" />
      </div>

      <div className="flex-1" />

      <div className="relative w-full max-w-50 sm:max-w-sm">
        <button
          onClick={() => setOpen(true)}
          className="relative flex h-9 w-full items-center justify-start rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Search className="mr-2 h-4 w-4 shrink-0" />
          <span className="hidden sm:inline-flex truncate">
            Search Ops Hub...
          </span>
          <span className="inline-flex sm:hidden">Search</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <ModeToggle />
      <LogoutButton />

      {/* BẢNG TÌM KIẾM TOÀN CỤC */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-xl sm:max-w-2xl bg-background border-border/50">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          <DialogDescription className="sr-only">
            Search across the entire Ops Hub.
          </DialogDescription>

          <Command className="w-full max-h-[70vh]">
            <CommandInput
              placeholder="Type to search configs, scripts, test data..."
              className="border-none focus:ring-0"
            />

            <CommandList className="max-h-[50vh] overflow-y-auto">
              <CommandEmpty>No results found in database.</CommandEmpty>

              {/* PAGE NAVIGATION */}
              <CommandGroup heading="Navigation">
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/"))}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard Roadmap</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/commands"))}
                >
                  <TerminalSquare className="mr-2 h-4 w-4" />
                  <span>Commands Hub</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/jwt-manager"))}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>JWT Manager</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/ai-test-data"))
                  }
                >
                  <Bot className="mr-2 h-4 w-4" />
                  <span>AI Test Data</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/devops-configs"))
                  }
                >
                  <FileCode2 className="mr-2 h-4 w-4" />
                  <span>DevOps Configs</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/settings/environments"))
                  }
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Environments Config</span>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              {/* 1. DEVOPS CONFIGS */}
              {devopsConfigs.length > 0 && (
                <CommandGroup heading="DevOps Configs">
                  {devopsConfigs.map((cfg) => (
                    <CommandItem
                      key={cfg.id}
                      value={`devops config yaml ${cfg.title} ${cfg.content}`} // Nhồi content vào value để có thể search nội dung YAML
                      onSelect={() =>
                        runCommand(() => router.push("/devops-configs"))
                      }
                    >
                      <FileCode2 className="mr-2 h-4 w-4 text-orange-500" />
                      <span>{cfg.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* 2. COMMAND SNIPPETS */}
              {commands.length > 0 && (
                <CommandGroup heading="Commands Hub">
                  {commands.map((cmd) => (
                    <CommandItem
                      key={cmd.id}
                      value={`command script ${cmd.title} ${cmd.template}`}
                      onSelect={() =>
                        runCommand(() => router.push("/commands"))
                      }
                    >
                      <TerminalSquare className="mr-2 h-4 w-4 text-indigo-500" />
                      <span>{cmd.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* 3. ENVIRONMENTS */}
              {environments.length > 0 && (
                <CommandGroup heading="Environments">
                  {environments.map((env) => (
                    <CommandItem
                      key={env.id}
                      value={`environment tenant ${env.tenant} ${env.cluster || ""} ${env.cidr || ""}`}
                      onSelect={() =>
                        runCommand(() => router.push("/settings/environments"))
                      }
                    >
                      <Server className="mr-2 h-4 w-4 text-emerald-500" />
                      <span>{env.tenant}</span>
                      {env.cluster && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({env.cluster})
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* 4. JWTS */}
              {jwts.length > 0 && (
                <CommandGroup heading="JWT Tokens">
                  {jwts.map((jwt) => (
                    <CommandItem
                      key={jwt.id}
                      // jwt.environments?.tenant lấy thông qua Foreign Key (ON DELETE CASCADE)
                      value={`jwt token authentication ${jwt.environments?.tenant || ""}`}
                      onSelect={() =>
                        runCommand(() => router.push("/jwt-manager"))
                      }
                    >
                      <KeyRound className="mr-2 h-4 w-4 text-amber-500" />
                      <span>
                        Token for{" "}
                        {jwt.environments?.tenant || "Unknown Environment"}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* 5. AI TEST DATA */}
              {aiData.length > 0 && (
                <CommandGroup heading="AI Test Data">
                  {aiData.map((data) => (
                    <CommandItem
                      key={data.id}
                      value={`ai test data json prompt ${data.title}`}
                      onSelect={() =>
                        runCommand(() => router.push("/ai-test-data"))
                      }
                    >
                      <Bot className="mr-2 h-4 w-4 text-blue-500" />
                      <span>{data.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* 6. FUTURE ENHANCEMENTS */}
              {enhancements.length > 0 && (
                <CommandGroup heading="Roadmap & Enhancements">
                  {enhancements.map((enh) => (
                    <CommandItem
                      key={enh.id}
                      value={`roadmap objective enhancement ${enh.title}`}
                      onSelect={() => runCommand(() => router.push("/"))}
                    >
                      <Rocket className="mr-2 h-4 w-4 text-pink-500" />
                      <span>{enh.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </header>
  );
}
