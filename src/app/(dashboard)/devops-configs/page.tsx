"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  Copy,
  Search,
  FileText,
  Info,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { setActiveEnv } from "@/lib/redux/slices/environmentSlice";

import { supabase } from "@/lib/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DevOpsConfig {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

interface Environment {
  id: string;
  tenant: string;
}

export default function DevOpsConfigsPage() {
  const dispatch = useDispatch();
  const activeEnv = useSelector(
    (state: RootState) => state.environment.activeEnv,
  );

  const [configs, setConfigs] = useState<DevOpsConfig[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<DevOpsConfig>({
    id: "",
    title: "",
    content: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  // FETCH DATA VÀ AUTO SELECT MÔI TRƯỜNG ĐẦU TIÊN
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Dùng Promise.all để fetch song song 2 bảng, tăng tốc độ load
        const [configRes, envRes] = await Promise.all([
          supabase
            .from("devops_configs")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("environments")
            .select("id, tenant")
            .order("tenant", { ascending: true }),
        ]);

        if (configRes.error) throw configRes.error;
        if (envRes.error) throw envRes.error;

        if (isMounted) {
          setConfigs(configRes.data || []);
          setEnvironments(envRes.data || []);
          setLoading(false);

          // LOGIC AUTO-SELECT: Nếu Redux chưa có activeEnv và danh sách Env có data
          if (envRes.data && envRes.data.length > 0 && !activeEnv) {
            dispatch(setActiveEnv(envRes.data[0].tenant));
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // Tắt cảnh báo exhaustive-deps vì chúng ta chỉ muốn chạy hàm này 1 lần duy nhất khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredConfigs = useMemo(() => {
    return configs.filter(
      (cfg) =>
        cfg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cfg.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
  }, [configs, searchQuery]);

  const selectedConfig = useMemo(() => {
    return configs.find((c) => c.id === selectedId);
  }, [configs, selectedId]);

  const displayContent = useMemo(() => {
    if (!selectedConfig) return "";
    const envPlaceholder = activeEnv || "<ENV_NAME>";
    return selectedConfig.content.replace(/{{ENV}}/g, envPlaceholder);
  }, [selectedConfig, activeEnv]);

  const handleAddNew = () => {
    setEditForm({
      id: "new",
      title: "",
      content:
        "# RABBITMQ UI: https://rabbitmq.{{ENV}}.sdx.dev...\n\n**Username/Password:** ...\n\n```yaml\nnamespace: {{ENV}}-service\n```",
      tags: [],
    });
    setIsEditing(true);
    setSelectedId("new");
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const { error } = await supabase
      .from("devops_configs")
      .delete()
      .eq("id", id);
    if (error) {
      alert("Error deleting config: " + error.message);
    } else {
      setConfigs(configs.filter((c) => c.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  const handleSave = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      return alert("Title and Content are required.");
    }
    if (editForm.id === "new") {
      const { data, error } = await supabase
        .from("devops_configs")
        .insert([
          {
            title: editForm.title,
            content: editForm.content,
            tags: editForm.tags,
          },
        ])
        .select()
        .single();
      if (error) return alert("Error creating: " + error.message);
      if (data) {
        setConfigs([data, ...configs]);
        setSelectedId(data.id);
        setIsEditing(false);
      }
    } else {
      const { error } = await supabase
        .from("devops_configs")
        .update({
          title: editForm.title,
          content: editForm.content,
          tags: editForm.tags,
        })
        .eq("id", editForm.id);
      if (error) return alert("Error updating: " + error.message);
      setConfigs(configs.map((c) => (c.id === editForm.id ? editForm : c)));
      setIsEditing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!editForm.tags.includes(tagInput.trim())) {
        setEditForm({ ...editForm, tags: [...editForm.tags, tagInput.trim()] });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            DevOps Configurations
          </h1>
          <p className="text-muted-foreground">
            Centralized repository for infrastructure scripts and YAML configs.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border">
          <span className="text-sm font-medium text-muted-foreground ml-1">
            Target Env:
          </span>
          <Select
            value={activeEnv}
            onValueChange={(val) => dispatch(setActiveEnv(val))}
          >
            <SelectTrigger className="w-45 h-8 bg-background">
              <SelectValue placeholder="Select environment..." />
            </SelectTrigger>
            <SelectContent>
              {environments.map((env) => (
                <SelectItem key={env.id} value={env.tenant}>
                  {env.tenant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-full min-h-125">
        {/* CỘT TRÁI: DANH SÁCH TÀI LIỆU */}
        <Card className="w-full md:w-1/3 flex flex-col h-full border-r">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <CardTitle className="text-lg">Documents</CardTitle>
              <Button size="sm" onClick={handleAddNew} className="h-8">
                <Plus size={16} className="mr-1" /> New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search configs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2
                  className="animate-spin text-muted-foreground"
                  size={24}
                />
              </div>
            ) : filteredConfigs.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No documents found.
              </div>
            ) : (
              <div className="flex flex-col divide-y">
                {filteredConfigs.map((cfg) => (
                  <button
                    key={cfg.id}
                    onClick={() => {
                      setSelectedId(cfg.id);
                      setIsEditing(false);
                    }}
                    className={`flex flex-col text-left p-4 hover:bg-muted/50 transition-colors ${
                      selectedId === cfg.id
                        ? "bg-muted/50 border-l-2 border-l-primary"
                        : "border-l-2 border-l-transparent"
                    }`}
                  >
                    <span className="font-semibold text-sm truncate w-full">
                      {cfg.title}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cfg.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CỘT PHẢI: CHI TIẾT HOẶC FORM EDIT */}
        <Card className="w-full md:w-2/3 flex flex-col h-full overflow-hidden relative">
          {!selectedId && !isEditing ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>Select a document from the left or create a new one.</p>
            </div>
          ) : isEditing ? (
            <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editForm.id === "new" ? "Create Document" : "Edit Document"}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      if (editForm.id === "new") setSelectedId(null);
                    }}
                  >
                    <X size={16} className="mr-2" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save size={16} className="mr-2" /> Save
                  </Button>
                </div>
              </div>

              <Input
                placeholder="Document Title (e.g., RabbitMQ Configuration)"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="font-bold text-lg"
              />

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">
                  Tags (Press Enter to add)
                </span>
                <div className="flex items-center gap-2 flex-wrap p-2 border rounded-md bg-background focus-within:ring-1 focus-within:ring-ring">
                  {editForm.tags.map((tag) => (
                    <Badge key={tag} className="gap-1 flex items-center pr-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={
                      editForm.tags.length === 0 ? "Add tags..." : ""
                    }
                    className="flex-1 bg-transparent outline-none min-w-30 text-sm"
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-md flex items-start gap-3 text-sm">
                <Info size={16} className="mt-0.5 shrink-0" />
                <p>
                  <strong>Pro Tip:</strong> Type <code>{`{{ENV}}`}</code>{" "}
                  anywhere in your markdown or YAML code. It will be
                  automatically replaced by the target environment you select
                  from the dropdown (e.g.,{" "}
                  <code>{`namespace: {{ENV}}-service`}</code>).
                </p>
              </div>

              <Textarea
                placeholder="Write your Markdown content here... (Press Enter twice for a new paragraph)"
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                className="flex-1 min-h-75 font-mono text-sm resize-none"
              />
            </div>
          ) : selectedConfig ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b shrink-0 bg-muted/20">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedConfig.title}
                  </h2>
                  <div className="flex gap-2">
                    {selectedConfig.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditForm(selectedConfig);
                      setIsEditing(true);
                    }}
                  >
                    <Edit2 size={16} className="mr-2" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      handleDelete(selectedConfig.id, selectedConfig.title)
                    }
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a({ node, href, children, ...props }: any) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline bg-blue-500/10 px-3 py-1.5 rounded-md my-2 break-all"
                          {...props}
                        >
                          🔗 {children}
                        </a>
                      );
                    },
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = String(children).replace(/\n$/, "");

                      return !inline && match ? (
                        <div className="relative group my-4 rounded-md overflow-hidden bg-[#1e1e1e]">
                          <button
                            onClick={() => copyToClipboard(codeString)}
                            className="absolute right-2 top-2 p-2 bg-muted/20 hover:bg-muted/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Copy code"
                          >
                            <Copy size={16} />
                          </button>
                          <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, padding: "1.5rem 1rem" }}
                            {...props}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code
                          className={`${className} bg-muted px-1.5 py-0.5 rounded text-sm text-primary font-mono font-semibold`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {displayContent}
                </ReactMarkdown>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
