"use client";

import {
  Check,
  ChevronRight,
  Copy,
  Edit2,
  FileJson,
  Link as LinkIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ----------------------------------------------------------------------
// SMART COPY BUTTON (Tự đổi thành chữ OK màu xanh lá 5s)
// ----------------------------------------------------------------------
const CopyButton = ({
  payload,
  label = "Copy",
}: {
  payload: string;
  label?: string;
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`h-7 px-2 text-xs transition-all ${
        copied
          ? "border-green-500 text-green-600 bg-green-500/10 hover:bg-green-500/20 hover:text-green-700"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={(e) => {
        e.stopPropagation(); // Ngăn sự kiện click làm đóng/mở Collapsible
        handleCopy();
      }}
      title={copied ? "Copied!" : label}
    >
      {copied ? (
        <Check className="mr-1.5 size-3" />
      ) : (
        <Copy className="mr-1.5 size-3" />
      )}
      {copied ? "OK" : label}
    </Button>
  );
};

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface TestItem {
  id: string;
  title: string;
  body: string; // Chứa JSON, Text, hoặc URL
}

interface TestSuite {
  id: string;
  title: string;
  items: TestItem[];
}

// ----------------------------------------------------------------------
// MAIN PAGE
// ----------------------------------------------------------------------
export default function AITestDataPage() {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // States cho Dialog của Bộ Data (Suite)
  const [isSuiteDialogOpen, setIsSuiteDialogOpen] = useState(false);
  const [editingSuiteId, setEditingSuiteId] = useState<string | null>(null);
  const [suiteTitleInput, setSuiteTitleInput] = useState("");

  // States cho Dialog của Item bên trong (Data con)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [activeSuiteId, setActiveSuiteId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemTitleInput, setItemTitleInput] = useState("");
  const [itemBodyInput, setItemBodyInput] = useState("");

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("ai_test_data")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSuites(data || []);
    } catch (err) {
      console.error("Error fetching AI test data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- BỘ LỌC ---
  const filteredSuites = useMemo(() => {
    return suites.filter((suite) =>
      suite.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [suites, searchQuery]);

  // ==========================================
  // LOGIC SUITE (BỘ DATA LỚN)
  // ==========================================
  const handleOpenSuiteDialog = (suite?: TestSuite) => {
    if (suite) {
      setEditingSuiteId(suite.id);
      setSuiteTitleInput(suite.title);
    } else {
      setEditingSuiteId(null);
      setSuiteTitleInput("");
    }
    setIsSuiteDialogOpen(true);
  };

  const handleSaveSuite = async () => {
    if (!suiteTitleInput.trim()) return alert("Title is required.");

    if (editingSuiteId) {
      const { error } = await supabase
        .from("ai_test_data")
        .update({ title: suiteTitleInput })
        .eq("id", editingSuiteId);
      if (error) return alert(error.message);
      setSuites((prev) =>
        prev.map((s) =>
          s.id === editingSuiteId ? { ...s, title: suiteTitleInput } : s,
        ),
      );
    } else {
      const { data, error } = await supabase
        .from("ai_test_data")
        .insert([{ title: suiteTitleInput, items: [] }])
        .select()
        .single();
      if (error) return alert(error.message);
      if (data) setSuites([data, ...suites]);
    }
    setIsSuiteDialogOpen(false);
  };

  const handleDeleteSuite = async (id: string, title: string) => {
    if (!confirm(`Delete entire collection "${title}"?`)) return;
    const { error } = await supabase.from("ai_test_data").delete().eq("id", id);
    if (error) return alert(error.message);
    setSuites((prev) => prev.filter((s) => s.id !== id));
  };

  // ==========================================
  // LOGIC ITEM (TỪNG DATA BÊN TRONG)
  // ==========================================
  const handleOpenItemDialog = (suiteId: string, item?: TestItem) => {
    setActiveSuiteId(suiteId);
    if (item) {
      setEditingItemId(item.id);
      setItemTitleInput(item.title);
      setItemBodyInput(item.body);
    } else {
      setEditingItemId(null);
      setItemTitleInput("");
      setItemBodyInput("");
    }
    setIsItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!itemTitleInput.trim() || !itemBodyInput.trim())
      return alert("Both title and body are required.");
    if (!activeSuiteId) return;

    const currentSuite = suites.find((s) => s.id === activeSuiteId);
    if (!currentSuite) return;

    let updatedItems = [...(currentSuite.items || [])];

    if (editingItemId) {
      updatedItems = updatedItems.map((i) =>
        i.id === editingItemId
          ? { ...i, title: itemTitleInput, body: itemBodyInput }
          : i,
      );
    } else {
      const newItem: TestItem = {
        id: crypto.randomUUID(),
        title: itemTitleInput,
        body: itemBodyInput,
      };
      updatedItems.push(newItem);
    }

    const { error } = await supabase
      .from("ai_test_data")
      .update({ items: updatedItems })
      .eq("id", activeSuiteId);
    if (error) return alert(error.message);

    setSuites((prev) =>
      prev.map((s) =>
        s.id === activeSuiteId ? { ...s, items: updatedItems } : s,
      ),
    );
    setIsItemDialogOpen(false);
  };

  const handleDeleteItem = async (
    suiteId: string,
    itemId: string,
    itemTitle: string,
  ) => {
    if (!confirm(`Delete item "${itemTitle}"?`)) return;

    const currentSuite = suites.find((s) => s.id === suiteId);
    if (!currentSuite) return;

    const updatedItems = currentSuite.items.filter((i) => i.id !== itemId);
    const { error } = await supabase
      .from("ai_test_data")
      .update({ items: updatedItems })
      .eq("id", suiteId);

    if (error) return alert(error.message);
    setSuites((prev) =>
      prev.map((s) => (s.id === suiteId ? { ...s, items: updatedItems } : s)),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Test Data</h1>
          <p className="text-muted-foreground">
            Manage collections of test payloads, JSON blocks, or URLs for AI
            evaluation.
          </p>
        </div>
        <Button
          onClick={() => handleOpenSuiteDialog()}
          className="gap-2 shrink-0"
        >
          <Plus size={16} /> New Test Collection
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        </div>
      ) : filteredSuites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-xl bg-muted/20 border-dashed text-muted-foreground">
          <p>No test data found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredSuites.map((suite) => (
            <Collapsible
              key={suite.id}
              className="border rounded-lg bg-card shadow-sm group"
            >
              <div className="flex items-center justify-between p-3 border-b border-transparent group-data-[state=open]:border-border/50 group-data-[state=open]:bg-muted/30 transition-colors">
                <CollapsibleTrigger className="flex flex-1 items-center gap-2 hover:text-primary outline-none">
                  <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
                  <span className="font-semibold text-base">{suite.title}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-2">
                    {suite.items?.length || 0} items
                  </span>
                </CollapsibleTrigger>

                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => handleOpenSuiteDialog(suite)}
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteSuite(suite.id, suite.title)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <CollapsibleContent className="p-3 bg-muted/10 flex flex-col gap-2">
                {!suite.items || suite.items.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4 border-dashed border rounded-md">
                    No data entries yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {suite.items.map((item) => {
                      const isUrl =
                        item.body.startsWith("http://") ||
                        item.body.startsWith("https://");
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-md border bg-background hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {isUrl ? (
                              <LinkIcon className="size-4 text-blue-500 shrink-0" />
                            ) : (
                              <FileJson className="size-4 text-green-500 shrink-0" />
                            )}
                            <div className="flex flex-col truncate">
                              <span
                                className="text-sm font-semibold truncate"
                                title={item.title}
                              >
                                {item.title}
                              </span>
                              <span
                                className="text-xs text-muted-foreground truncate font-mono opacity-60"
                                title={item.body}
                              >
                                {item.body}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-4">
                            <CopyButton payload={item.body} label="Copy" />
                            <div className="h-4 w-px bg-border mx-1" />
                            {/* Bỏ class opacity-0 group-hover, luôn hiện icon bằng text-muted-foreground */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() =>
                                handleOpenItemDialog(suite.id, item)
                              }
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                handleDeleteItem(suite.id, item.id, item.title)
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full border-dashed text-muted-foreground hover:text-foreground"
                  onClick={() => handleOpenItemDialog(suite.id)}
                >
                  <Plus className="mr-2 size-4" /> Add Data
                </Button>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {/* DIALOG 1: TẠO/SỬA TÊN BỘ DATA (SUITE) */}
      <Dialog open={isSuiteDialogOpen} onOpenChange={setIsSuiteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSuiteId ? "Edit Collection" : "New Test Collection"}
            </DialogTitle>
            <DialogDescription>
              Group your test data by feature or ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={suiteTitleInput}
              onChange={(e) => setSuiteTitleInput(e.target.value)}
              placeholder="e.g. SMTP Relay Test Cases"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveSuite()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSuiteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSuite}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: TẠO/SỬA NỘI DUNG DATA (ITEM) */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingItemId ? "Edit Data" : "Add Data to Collection"}
            </DialogTitle>
            <DialogDescription>
              Paste your raw JSON, text, or a URL link below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 py-4 flex flex-col gap-3">
            <Input
              value={itemTitleInput}
              onChange={(e) => setItemTitleInput(e.target.value)}
              placeholder="Data Title (e.g. Worknote 1, Ticket Incident...)"
              className="font-semibold"
            />
            <Textarea
              value={itemBodyInput}
              onChange={(e) => setItemBodyInput(e.target.value)}
              placeholder="Paste JSON or URL here..."
              className="flex-1 min-h-[350px] font-mono text-sm bg-[#1e1e1e] text-green-400 border-none resize-none focus-visible:ring-1 focus-visible:ring-primary"
              spellCheck={false}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>Save Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
