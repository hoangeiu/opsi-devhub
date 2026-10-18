"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Rocket,
  Trash2,
  Plus,
  Sparkles,
  User,
  TerminalSquare,
  Loader2,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Enhancement {
  id: string;
  title: string;
  requester: string;
  description: string;
  status: "open" | "resolved";
  resolver?: string;
  resolved_at?: string;
  created_at: string;
}

export default function Home() {
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [loading, setLoading] = useState(true);

  // States: Add New Mission Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    requester: "",
    description: "",
  });

  // States: Resolve Mission Dialog
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolverName, setResolverName] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // FETCH DATA
  const fetchEnhancements = async () => {
    try {
      const { data, error } = await supabase
        .from("future_enhancements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEnhancements(data || []);
    } catch (err) {
      console.error("Error fetching enhancements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnhancements();
  }, []);

  // PHÂN TÁCH DỮ LIỆU
  const openMissions = enhancements.filter((e) => e.status !== "resolved");
  const resolvedMissions = enhancements
    .filter((e) => e.status === "resolved")
    .sort(
      (a, b) =>
        new Date(b.resolved_at!).getTime() - new Date(a.resolved_at!).getTime(),
    );

  // ACTIONS
  const handleSaveNew = async () => {
    if (
      !form.title.trim() ||
      !form.requester.trim() ||
      !form.description.trim()
    ) {
      return alert("All fields are required.");
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("future_enhancements")
        .insert([
          {
            title: form.title,
            requester: form.requester,
            description: form.description,
            status: "open",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEnhancements([data, ...enhancements]);
        setIsAddDialogOpen(false);
        setForm({ title: "", requester: "", description: "" });
      }
    } catch (err: any) {
      alert("Error adding enhancement: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to abort mission: "${title}"?`)) return;
    try {
      const { error } = await supabase
        .from("future_enhancements")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setEnhancements(enhancements.filter((e) => e.id !== id));
    } catch (err: any) {
      alert("Error deleting enhancement: " + err.message);
    }
  };

  const handleOpenResolveDialog = (id: string) => {
    setResolvingId(id);
    setResolverName(""); // Reset input
    setIsResolveDialogOpen(true);
  };

  const handleResolve = async () => {
    if (!resolverName.trim()) return alert("Please enter the resolver's name.");
    if (!resolvingId) return;

    setIsResolving(true);
    try {
      const resolvedAt = new Date().toISOString();
      const { error } = await supabase
        .from("future_enhancements")
        .update({
          status: "resolved",
          resolver: resolverName,
          resolved_at: resolvedAt,
        })
        .eq("id", resolvingId);

      if (error) throw error;

      setEnhancements((prev) =>
        prev.map((e) =>
          e.id === resolvingId
            ? {
                ...e,
                status: "resolved",
                resolver: resolverName,
                resolved_at: resolvedAt,
              }
            : e,
        ),
      );
      setIsResolveDialogOpen(false);
    } catch (err: any) {
      alert("Error resolving mission: " + err.message);
    } finally {
      setIsResolving(false);
    }
  };

  const handleUndoResolve = async (id: string) => {
    try {
      const { error } = await supabase
        .from("future_enhancements")
        .update({ status: "open", resolver: null, resolved_at: null })
        .eq("id", id);

      if (error) throw error;

      setEnhancements((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status: "open",
                resolver: undefined,
                resolved_at: undefined,
              }
            : e,
        ),
      );
    } catch (err: any) {
      alert("Error undoing resolve: " + err.message);
    }
  };

  return (
    // Cha ngoài cùng phải cố định chiều cao (h-[calc...]) và overflow-hidden để con bên trong tự scroll
    <div className="relative h-[calc(100vh-6rem)] w-full rounded-2xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-indigo-500/20 shadow-xl dark:shadow-2xl flex flex-col transition-colors duration-300 overflow-hidden">
      {/* 🌌 HIỆU ỨNG BACKGROUND */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-300" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-[100px] pointer-events-none transition-colors duration-300" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 mix-blend-overlay pointer-events-none" />

      {/* HEADER TĨNH */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-indigo-500/20 bg-white/40 dark:bg-black/40 backdrop-blur-xl shrink-0 transition-colors duration-300">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]">
            <Rocket className="size-7 text-indigo-600 dark:text-indigo-400" />
            Mission Control Roadmap
          </h1>
          <p className="text-slate-600 dark:text-indigo-200/60 mt-1 font-mono text-xs flex items-center gap-2">
            <TerminalSquare className="size-3.5" />
            Future Enhancements & System Extensibility Log
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-md dark:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all"
        >
          <Plus className="size-4 mr-2" /> Add Objective
        </Button>
      </div>

      {/* VÙNG NỘI DUNG CHÍNH (FLEX ROW: 75% - 25%) */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ======================================================== */}
        {/* KHU VỰC TRÁI (75%): NHỮNG Ý TƯỞNG ĐANG OPEN (Scroll dọc) */}
        {/* ======================================================== */}
        <div className="flex-[3] lg:w-3/4 flex flex-col h-full border-r border-slate-200 dark:border-white/5">
          <div className="p-4 py-3 bg-slate-100/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 shrink-0 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-700 dark:text-indigo-300 uppercase tracking-widest flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
              Active Missions ({openMissions.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {loading ? (
              <div className="flex items-center justify-center h-full text-indigo-600 dark:text-indigo-400">
                <Loader2 className="size-10 animate-spin" />
              </div>
            ) : openMissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-indigo-300/40 font-mono">
                <Sparkles className="size-16 mb-4 opacity-20" />
                <p>No active missions. We are flying steady.</p>
              </div>
            ) : (
              <div className="columns-1 xl:columns-2 gap-6">
                {openMissions.map((item) => (
                  <div
                    key={item.id}
                    className="break-inside-avoid mb-6 relative group bg-white/80 dark:bg-[#111118]/80 backdrop-blur-md rounded-xl border border-slate-200 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-400/50 hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                          {item.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 font-mono text-[10px] px-2 py-0"
                          >
                            <User className="size-3 mr-1 inline" />
                            {item.requester}
                          </Badge>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {format(new Date(item.created_at), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>

                      {/* NÚT THAO TÁC (HIỆN KHI HOVER) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-green-400/10"
                          onClick={() => handleOpenResolveDialog(item.id)}
                          title="Mark as Resolved"
                        >
                          <CheckCircle2 className="size-4.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-400/10"
                          onClick={() => handleDelete(item.id, item.title)}
                          title="Abort Mission (Delete)"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-5 prose dark:prose-invert max-w-none prose-sm prose-pre:bg-slate-100 dark:prose-pre:bg-black/50 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-white/10 prose-headings:text-slate-800 dark:prose-headings:text-indigo-200 prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* KHU VỰC PHẢI (25%): NHỮNG Ý TƯỞNG ĐÃ XONG (Scroll dọc) */}
        {/* ======================================================== */}
        <div className="flex-[1] lg:w-1/4 flex flex-col h-full bg-slate-100/30 dark:bg-black/20">
          <div className="p-4 py-3 bg-slate-200/50 dark:bg-white/[0.05] border-b border-slate-200 dark:border-white/5 shrink-0">
            <span className="font-bold text-sm text-slate-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Resolved Archive
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {resolvedMissions.length === 0 ? (
              <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-10 italic">
                No items in archive yet.
              </p>
            ) : (
              resolvedMissions.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg p-3 hover:border-green-400/50 dark:hover:border-green-500/50 transition-colors"
                >
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 pr-6">
                    {item.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <User className="size-3" />
                    <span className="truncate">{item.resolver}</span>
                    <span className="mx-1">•</span>
                    <span>{format(new Date(item.resolved_at!), "MMM dd")}</span>
                  </div>

                  {/* Nút Undo trả về chưa resolve */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleUndoResolve(item.id)}
                    title="Undo Resolve"
                  >
                    <RotateCcw className="size-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DIALOG 1: THÊM MỚI OBJECTIVE */}
      {/* ======================================================== */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white dark:bg-[#09090b] border-slate-200 dark:border-indigo-500/30 text-slate-900 dark:text-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <Sparkles className="size-5" /> Initialize New Objective
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Draft the next big feature. Markdown is supported.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-[2] space-y-1">
                <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Mission Title
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Implement RBAC"
                  className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-indigo-500/30 text-slate-900 dark:text-indigo-100"
                />
              </div>
              <div className="flex-[1] space-y-1">
                <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Requester
                </label>
                <Input
                  value={form.requester}
                  onChange={(e) =>
                    setForm({ ...form, requester: e.target.value })
                  }
                  placeholder="Your Name/ID"
                  className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-indigo-500/30 text-slate-900 dark:text-indigo-100"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Description (Markdown)
              </label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="min-h-[200px] font-mono text-sm bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-indigo-500/30 text-slate-900 dark:text-indigo-100 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveNew}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Rocket className="size-4 mr-2" />
              )}{" "}
              Launch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* DIALOG 2: CONFIRM RESOLVE */}
      {/* ======================================================== */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="sm:max-w-100 bg-white dark:bg-[#09090b] border-slate-200 dark:border-green-500/30 text-slate-900 dark:text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="size-5" /> Mission Accomplished
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Who completed this objective? Date and time will be recorded
              automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
              Resolver Name
            </label>
            <Input
              value={resolverName}
              onChange={(e) => setResolverName(e.target.value)}
              placeholder="github account or your name"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleResolve()}
              className="mt-1 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-green-500/30 text-slate-900 dark:text-green-100 focus-visible:ring-green-500"
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsResolveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={isResolving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isResolving ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="size-4 mr-2" />
              )}{" "}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
