import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

export function TopHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        {/* Nút Trigger Sidebar */}
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-border hidden sm:block" />
      </div>

      <div className="flex-1" />

      <div className="relative w-full max-w-50 sm:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
      <ModeToggle />
    </header>
  );
}
