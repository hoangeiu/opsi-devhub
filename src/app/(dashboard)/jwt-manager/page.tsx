"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Copy, Edit2, Save, X, Loader2, Plus, Trash2 } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Environment {
  id: string;
  tenant: string;
}

interface JwtItem {
  id: string;
  env_id: string;
  tenant: string;
  token: string;
}

export default function JwtManagerPage() {
  const [allEnvs, setAllEnvs] = useState<Environment[]>([]);
  const [jwtList, setJwtList] = useState<JwtItem[]>([]);

  // Khởi tạo loading mặc định là true
  const [loading, setLoading] = useState(true);
  const [selectedEnvIdToAdd, setSelectedEnvIdToAdd] = useState<string>("");

  const [editingJwtId, setEditingJwtId] = useState<string | null>(null);
  const [editToken, setEditToken] = useState("");

  // 1. FIX LỖI USEEFFECT: Tách trạng thái state ra khỏi logic fetch
  const fetchData = useCallback(async () => {
    try {
      const { data: envsData, error: envsError } = await supabase
        .from("environments")
        .select("id, tenant")
        .order("tenant", { ascending: true });

      if (envsError) throw envsError;

      const { data: jwtsData, error: jwtsError } = await supabase.from("jwts")
        .select(`
          id,
          token,
          env_id,
          environments (tenant)
        `);

      if (jwtsError) throw jwtsError;

      const formattedJwts: JwtItem[] = (jwtsData || []).map((record: any) => ({
        id: record.id,
        env_id: record.env_id,
        tenant: record.environments?.tenant || "Unknown",
        token: record.token || "",
      }));

      formattedJwts.sort((a, b) => a.tenant.localeCompare(b.tenant));

      setAllEnvs(envsData || []);
      setJwtList(formattedJwts);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    // Chú ý: Không setLoading(false) ở đây để tránh lỗi cascading renders của React
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await fetchData(); // Đợi fetch xong hoàn toàn
      if (isMounted) {
        setLoading(false); // Chỉ set state khi component vẫn đang tồn tại trên DOM
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const availableEnvsToAdd = useMemo(() => {
    const addedEnvIds = jwtList.map((item) => item.env_id);
    return allEnvs.filter((env) => !addedEnvIds.includes(env.id));
  }, [allEnvs, jwtList]);

  const handleAddEnvironment = async () => {
    if (!selectedEnvIdToAdd) return;

    const { data, error } = await supabase
      .from("jwts")
      .insert([{ env_id: selectedEnvIdToAdd, token: "" }])
      .select(`id, token, env_id, environments (tenant)`)
      .single();

    if (error) {
      alert("Failed to add environment: " + error.message);
    } else if (data) {
      const newItem: JwtItem = {
        id: data.id,
        env_id: data.env_id,
        tenant: (data.environments as any)?.tenant || "Unknown",
        token: data.token,
      };

      setJwtList((prev) =>
        [...prev, newItem].sort((a, b) => a.tenant.localeCompare(b.tenant)),
      );
      setSelectedEnvIdToAdd("");
    }
  };

  const handleRemoveJwt = async (jwtId: string, tenant: string) => {
    if (!confirm(`Remove ${tenant} from JWT Manager?`)) return;

    const { error } = await supabase.from("jwts").delete().eq("id", jwtId);

    if (error) {
      alert("Error removing item: " + error.message);
    } else {
      setJwtList((prev) => prev.filter((item) => item.id !== jwtId));
    }
  };

  const handleCopy = async (token: string, tenant: string) => {
    if (!token) return alert(`No token available for ${tenant}.`);
    try {
      await navigator.clipboard.writeText(token);
      alert(`Token for ${tenant} copied to clipboard!`);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const startEditing = (jwtId: string, currentToken: string) => {
    setEditingJwtId(jwtId);
    setEditToken(currentToken);
  };

  const cancelEditing = () => {
    setEditingJwtId(null);
    setEditToken("");
  };

  const handleSaveEdit = async (jwtId: string) => {
    const { error } = await supabase
      .from("jwts")
      .update({ token: editToken.trim() })
      .eq("id", jwtId);

    if (error) {
      alert("Error saving JWT: " + error.message);
    } else {
      setJwtList((prev) =>
        prev.map((item) =>
          item.id === jwtId ? { ...item, token: editToken.trim() } : item,
        ),
      );
      setEditingJwtId(null);
      setEditToken("");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">JWT Manager</h1>
        <p className="text-muted-foreground">
          Select and manage authentication tokens for your active environments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Tokens</CardTitle>
          <CardDescription>
            Only environments added here will be displayed. Add a new one from
            the dropdown below.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-3 mb-6">
            <Select
              value={selectedEnvIdToAdd}
              // 2. FIX LỖI TYPE: Xử lý type 'string | null' của Base UI
              onValueChange={(val) => setSelectedEnvIdToAdd(val || "")}
            >
              <SelectTrigger className="w-[280px]">
                {/* 3. FIX LỖI HIỂN THỊ ID: Bắt ép SelectValue hiển thị đúng tên tenant */}
                <SelectValue placeholder="Select an environment to add...">
                  {selectedEnvIdToAdd
                    ? availableEnvsToAdd.find(
                        (e) => e.id === selectedEnvIdToAdd,
                      )?.tenant
                    : ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableEnvsToAdd.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    All environments are added
                  </SelectItem>
                ) : (
                  availableEnvsToAdd.map((env) => (
                    <SelectItem key={env.id} value={env.id}>
                      {env.tenant}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAddEnvironment}
              disabled={!selectedEnvIdToAdd || selectedEnvIdToAdd === "empty"}
              className="gap-2"
            >
              <Plus size={16} /> Add to List
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading tokens...
            </div>
          ) : jwtList.length === 0 ? (
            <div className="py-8 text-center border rounded-lg bg-muted/20 text-muted-foreground border-dashed">
              Your JWT list is empty. Add an environment above to get started.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {jwtList.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/10 transition-colors"
                >
                  <div className="w-[180px] shrink-0 font-mono font-semibold text-sm">
                    {item.tenant}
                  </div>

                  <div className="flex-1">
                    {editingJwtId === item.id ? (
                      <Input
                        value={editToken}
                        onChange={(e) => setEditToken(e.target.value)}
                        placeholder="Paste JWT here..."
                        className="w-full font-mono text-sm"
                        autoFocus
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSaveEdit(item.id)
                        }
                      />
                    ) : (
                      <Input
                        value={item.token}
                        readOnly
                        type="text"
                        placeholder="No token configured"
                        className="w-full font-mono text-sm bg-muted/50 text-muted-foreground cursor-default"
                      />
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {editingJwtId === item.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveEdit(item.id)}
                          className="w-[85px] border-green-500/50 text-green-600 hover:bg-green-500/10 hover:text-green-600"
                        >
                          <Save className="mr-2 size-4" /> Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                          className="w-[85px] text-muted-foreground hover:text-destructive"
                        >
                          <X className="mr-2 size-4" /> Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(item.token, item.tenant)}
                          className="w-[85px]"
                        >
                          <Copy className="mr-2 size-4" /> Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(item.id, item.token)}
                          className="w-[85px]"
                        >
                          <Edit2 className="mr-2 size-4" /> Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveJwt(item.id, item.tenant)}
                          title="Remove from list"
                        >
                          <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
