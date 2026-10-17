"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Loader2,
  Search,
  TerminalSquare,
  Database as DbIcon,
  Edit2,
  Plus,
  Trash2,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface CommandCategory {
  id: string;
  name: string;
  order_index: number;
}

interface Command {
  id: string;
  category_id: string;
  title: string;
  template: string;
}

interface Environment {
  id: string;
  tenant: string;
}

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export default function CommandsPage() {
  const dispatch = useDispatch();
  const activeEnv = useSelector(
    (state: RootState) => state.environment.activeEnv,
  );

  const [categories, setCategories] = useState<CommandCategory[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");

  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const [isCmdDialogOpen, setIsCmdDialogOpen] = useState(false);
  const [cmdForm, setCmdForm] = useState({
    id: "",
    title: "",
    template: "",
    category_id: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [catsRes, cmdsRes, envsRes] = await Promise.all([
        supabase
          .from("command_categories")
          .select("*")
          .order("order_index", { ascending: true }),
        supabase.from("commands").select("*"),
        supabase
          .from("environments")
          .select("id, tenant")
          .order("tenant", { ascending: true }),
      ]);

      if (catsRes.data) {
        setCategories(catsRes.data);
        if (catsRes.data.length > 0 && !activeTab)
          setActiveTab(catsRes.data[0].id);
      }
      if (cmdsRes.data) setCommands(cmdsRes.data);
      if (envsRes.data) {
        setEnvironments(envsRes.data);
        if (envsRes.data.length > 0 && !activeEnv) {
          dispatch(setActiveEnv(envsRes.data[0].tenant));
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeEnv, activeTab, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveCategory = async () => {
    if (!newCatName.trim()) return;
    const nextOrder =
      categories.length > 0
        ? Math.max(...categories.map((c) => c.order_index)) + 1
        : 1;

    const { data, error } = await supabase
      .from("command_categories")
      .insert([{ name: newCatName.trim(), order_index: nextOrder }])
      .select()
      .single();

    if (error) return alert(error.message);
    if (data) {
      setCategories([...categories, data]);
      setActiveTab(data.id);
    }
    setIsCatDialogOpen(false);
    setNewCatName("");
  };

  const handleOpenCmdDialog = (categoryId: string, cmd?: Command) => {
    if (cmd) {
      setCmdForm(cmd);
    } else {
      setCmdForm({
        id: "new",
        title: "",
        template: "",
        category_id: categoryId,
      });
    }
    setIsCmdDialogOpen(true);
  };

  const handleSaveCommand = async () => {
    if (!cmdForm.title.trim() || !cmdForm.template.trim())
      return alert("Title and Template are required.");

    if (cmdForm.id === "new") {
      const { data, error } = await supabase
        .from("commands")
        .insert([
          {
            title: cmdForm.title,
            template: cmdForm.template,
            category_id: cmdForm.category_id,
          },
        ])
        .select()
        .single();
      if (error) return alert(error.message);
      if (data) setCommands([...commands, data]);
    } else {
      const { error } = await supabase
        .from("commands")
        .update({
          title: cmdForm.title,
          template: cmdForm.template,
          category_id: cmdForm.category_id,
        })
        .eq("id", cmdForm.id);
      if (error) return alert(error.message);
      setCommands(commands.map((c) => (c.id === cmdForm.id ? cmdForm : c)));
    }
    setIsCmdDialogOpen(false);
  };

  const handleDeleteCommand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this command?")) return;
    const { error } = await supabase.from("commands").delete().eq("id", id);
    if (error) return alert(error.message);
    setCommands(commands.filter((c) => c.id !== id));
    setIsCmdDialogOpen(false);
  };

  const filteredCommands = useMemo(() => {
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.template.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [commands, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commands Hub</h1>
          <p className="text-muted-foreground">
            Manage your snippets and scripts. Variables like{" "}
            <code>{`{{ENV}}`}</code> will be auto-replaced.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border">
          <span className="text-sm font-medium text-muted-foreground ml-1">
            Target Env:
          </span>
          <Select
            value={activeEnv}
            onValueChange={(val) => dispatch(setActiveEnv(val || ""))}
          >
            <SelectTrigger className="w-[180px] h-8 bg-background">
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

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commands, URLs, or scripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        <Button
          variant="outline"
          className="shrink-0 text-muted-foreground hover:text-foreground border-dashed"
          onClick={() => setIsCatDialogOpen(true)}
        >
          <Plus className="size-4 mr-1" /> Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-xl bg-muted/20 border-dashed text-muted-foreground">
          <DbIcon size={48} className="mb-4 opacity-20" />
          <p className="mb-4">Your command repository is empty.</p>
          <Button onClick={() => setIsCatDialogOpen(true)}>
            <Plus className="size-4 mr-2" /> Add Your First Category
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="h-auto flex-wrap justify-start bg-muted/50 p-1 w-full sm:w-auto">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="py-2">
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {activeTab && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenCmdDialog(activeTab)}
              >
                <Plus className="size-4 mr-2" /> Add Command
              </Button>
            )}
          </div>

          {categories.map((cat) => {
            const categoryCommands = filteredCommands.filter(
              (cmd) => cmd.category_id === cat.id,
            );

            return (
              <TabsContent
                key={cat.id}
                value={cat.id}
                className="mt-0 outline-none"
              >
                {categoryCommands.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                    No commands found in this category.
                  </div>
                ) : (
                  <div className="columns-1 xl:columns-2 gap-4">
                    {categoryCommands.map((cmd) => {
                      const envPlaceholder = activeEnv || "<ENV_NAME>";
                      const finalCommand = cmd.template.replace(
                        /{{ENV}}/g,
                        envPlaceholder,
                      );

                      return (
                        <Card
                          key={cmd.id}
                          // ÉP GHI ĐÈ BIẾN CSS TRỰC TIẾP Ở ĐÂY BẰNG ![--card-spacing:0px]
                          className="break-inside-avoid mb-4 overflow-hidden border-border/50 shadow-sm group ![--card-spacing:0px]"
                        >
                          <CardHeader className="p-3 pb-2 bg-muted/30 border-b flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2 overflow-hidden pr-2">
                              <TerminalSquare className="size-4 text-primary shrink-0" />
                              <CardTitle className="text-sm font-semibold truncate">
                                {cmd.title}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary transition-opacity opacity-0 group-hover:opacity-100"
                                onClick={() => handleOpenCmdDialog(cat.id, cmd)}
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            <SyntaxHighlighter
                              style={vscDarkPlus as any}
                              language="bash"
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                padding: "1rem",
                                background: "#1e1e1e",
                                fontSize: "0.85rem",
                              }}
                            >
                              {finalCommand}
                            </SyntaxHighlighter>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* DIALOG: NEW CATEGORY */}
      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. 🛠️ Utilities"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveCategory()}
            />
          </div>
          <div className="flex w-full justify-end mt-2">
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsCatDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCategory}>Save Category</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG: EDIT / NEW COMMAND */}
      <Dialog open={isCmdDialogOpen} onOpenChange={setIsCmdDialogOpen}>
        <DialogContent className="sm:max-w-[700px] w-full max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>
              {cmdForm.id === "new" ? "Add New Command" : "Edit Command"}
            </DialogTitle>
            <DialogDescription>
              Use <code>{`{{ENV}}`}</code> in the template to auto-inject the
              target environment.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4 w-full">
            <div className="flex gap-4 w-full">
              <div className="flex-[3] space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Title
                </label>
                <Input
                  value={cmdForm.title}
                  onChange={(e) =>
                    setCmdForm({ ...cmdForm, title: e.target.value })
                  }
                  placeholder="Command description"
                  className="w-full"
                />
              </div>
              <div className="flex-[2] space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Category
                </label>
                <Select
                  value={cmdForm.category_id}
                  onValueChange={(val) =>
                    setCmdForm({ ...cmdForm, category_id: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select...">
                      {cmdForm.category_id
                        ? categories.find((c) => c.id === cmdForm.category_id)
                            ?.name
                        : "Select Category"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1 w-full">
              <label className="text-xs font-semibold text-muted-foreground">
                Script / Template
              </label>
              <Textarea
                value={cmdForm.template}
                onChange={(e) =>
                  setCmdForm({ ...cmdForm, template: e.target.value })
                }
                placeholder="kubectl get pod -n {{ENV}}"
                className="min-h-[250px] font-mono text-sm bg-[#1e1e1e] text-green-400 border-none resize-none w-full"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="flex w-full justify-between items-center mt-2">
            {cmdForm.id !== "new" ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteCommand(cmdForm.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsCmdDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCommand}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
