"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Edit2, Save, X, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { setActiveEnv } from "@/lib/redux/slices/environmentSlice";

// Import client Supabase
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Environment {
  id: string;
  tenant: string;
  cluster: string | null;
  cidr: string | null;
}

export default function EnvironmentsPage() {
  const dispatch = useDispatch();
  const activeEnv = useSelector(
    (state: RootState) => state.environment.activeEnv,
  );

  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);

  // States cho thêm mới
  const [newEnv, setNewEnv] = useState({ tenant: "", cluster: "", cidr: "" });

  // States cho tính năng Inline-Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    tenant: "",
    cluster: "",
    cidr: "",
  });

  // 1. Dùng useCallback để memorize hàm fetch, tránh re-render liên tục
  const fetchEnvironments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("environments")
        .select("id, tenant, cluster, cidr")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching environments:", error);
      } else {
        setEnvironments(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      // Đảm bảo setLoading chạy sau khi đã fetch xong (dù thành công hay lỗi)
      setLoading(false);
    }
  }, []);

  // Gọi fetch lần đầu khi component mount
  useEffect(() => {
    let isMounted = true;

    // Gọi hàm fetch nhưng phải kiểm tra mount để tránh set state trên component đã unmount
    const loadData = async () => {
      setLoading(true);
      await fetchEnvironments();
      if (!isMounted) return;
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchEnvironments]);

  // 2. Thêm mới (Chỉ bắt buộc tenant)
  const handleAdd = async () => {
    if (!newEnv.tenant.trim()) {
      return alert("Tenant name is required!");
    }

    const { data, error } = await supabase
      .from("environments")
      .insert([
        {
          tenant: newEnv.tenant.trim(),
          // Nếu rỗng thì truyền null xuống DB để sạch data
          cluster: newEnv.cluster.trim() || null,
          cidr: newEnv.cidr.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      alert("Error adding environment: " + error.message);
    } else if (data) {
      setEnvironments([...environments, data]);
      setNewEnv({ tenant: "", cluster: "", cidr: "" });
    }
  };

  // 3. Xóa
  const handleDelete = async (id: string, tenant: string) => {
    if (!confirm(`Are you sure you want to delete ${tenant}?`)) return;

    const { error } = await supabase.from("environments").delete().eq("id", id);

    if (error) {
      alert("Error deleting environment: " + error.message);
    } else {
      setEnvironments(environments.filter((env) => env.id !== id));

      if (activeEnv === tenant) {
        dispatch(setActiveEnv(""));
      }
    }
  };

  // 4. Các hàm cho Inline-Edit
  const startEditing = (env: Environment) => {
    setEditingId(env.id);
    // Nếu db trả về null thì chuyển thành string rỗng để Input không bị lỗi controlled/uncontrolled
    setEditForm({
      tenant: env.tenant,
      cluster: env.cluster || "",
      cidr: env.cidr || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ tenant: "", cluster: "", cidr: "" });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editForm.tenant.trim()) {
      return alert("Tenant name is required!");
    }

    const { error } = await supabase
      .from("environments")
      .update({
        tenant: editForm.tenant.trim(),
        cluster: editForm.cluster.trim() || null,
        cidr: editForm.cidr.trim() || null,
      })
      .eq("id", id);

    if (error) {
      alert("Error updating environment: " + error.message);
    } else {
      setEnvironments(
        environments.map((env) =>
          env.id === id
            ? {
                ...env,
                tenant: editForm.tenant.trim(),
                cluster: editForm.cluster.trim() || null,
                cidr: editForm.cidr.trim() || null,
              }
            : env,
        ),
      );
      setEditingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Environments</h1>
        <p className="text-muted-foreground">
          Manage the list of target environments (Tenants, Clusters, CIDR) used
          across the workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Environments</CardTitle>
          <CardDescription>
            These environments will be available in the dropdowns for JWTs and
            Commands.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Action Bar: Add new environment */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <Input
              placeholder="Tenant (e.g. elephantdev1-1) *" // Đánh dấu bắt buộc
              value={newEnv.tenant}
              onChange={(e) => setNewEnv({ ...newEnv, tenant: e.target.value })}
              className="w-full sm:w-62.5"
            />
            <Input
              placeholder="Cluster (Optional)"
              value={newEnv.cluster}
              onChange={(e) =>
                setNewEnv({ ...newEnv, cluster: e.target.value })
              }
              className="w-full sm:w-50"
            />
            <Input
              placeholder="CIDR (Optional)"
              value={newEnv.cidr}
              onChange={(e) => setNewEnv({ ...newEnv, cidr: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="w-full sm:w-50"
            />
            <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto">
              <Plus size={16} />
              Add
            </Button>
          </div>

          {/* Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12.5">#</TableHead>
                  <TableHead className="w-[30%]">Tenant</TableHead>
                  <TableHead className="w-[30%]">Cluster</TableHead>
                  <TableHead className="w-[20%]">CIDR</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={16} />
                        Loading data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : environments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No environments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  environments.map((env, index) => (
                    <TableRow key={env.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      {editingId === env.id ? (
                        <>
                          <TableCell>
                            <Input
                              value={editForm.tenant}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  tenant: e.target.value,
                                })
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editForm.cluster}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  cluster: e.target.value,
                                })
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editForm.cidr}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  cidr: e.target.value,
                                })
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSaveEdit(env.id)
                              }
                              className="h-8"
                            />
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-mono text-sm font-semibold">
                            {env.tenant}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {env.cluster || "-"}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {env.cidr || "-"}
                          </TableCell>
                        </>
                      )}

                      <TableCell className="text-right">
                        {editingId === env.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSaveEdit(env.id)}
                            >
                              <Save size={16} className="text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelEditing}
                            >
                              <X size={16} className="text-red-500" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(env)}
                            >
                              <Edit2
                                size={16}
                                className="text-muted-foreground hover:text-primary"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(env.id, env.tenant)}
                            >
                              <Trash2
                                size={16}
                                className="text-muted-foreground hover:text-destructive"
                              />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
