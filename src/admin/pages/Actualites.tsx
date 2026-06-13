import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@admin/lib/api";
import { Button } from "@admin/components/ui/button";
import { Input } from "@admin/components/ui/input";
import { Label } from "@admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@admin/components/ui/select";
import { Plus, Search, Edit2, Trash2, X, Loader2, Eye, EyeOff, Newspaper, ImageIcon, Upload, Library } from "lucide-react";
import { useToast } from "@admin/hooks/use-toast";
import { RichEditor } from "@admin/components/admin/RichEditor";
import { MediaPickerModal } from "@admin/components/admin/MediaPickerModal";
import { PageHeader } from "@admin/components/admin/PageHeader";
import { EmptyState } from "@admin/components/admin/EmptyState";
import { ErrorState } from "@admin/components/admin/ErrorState";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  published: boolean;
  slug: string;
  image?: string;
  createdAt: string;
}

const categories = [
  { value: "Actualité",        label: "Actualité générale" },
  { value: "Opportunité",      label: "Opportunité d'investissement" },
  { value: "Appel d'offres",   label: "Avis d'appels d'offres" },
  { value: "Résultat",         label: "Résultats de cessions" },
];

const catColors: Record<string, string> = {
  "Actualité":      "bg-blue-50 text-blue-600",
  "Opportunité":    "bg-emerald-50 text-emerald-600",
  "Appel d'offres": "bg-amber-50 text-amber-600",
  "Résultat":       "bg-purple-50 text-purple-600",
};

type FormState = { title: string; excerpt: string; content: string; author: string; category: string; published: boolean; image: string };

const emptyForm: FormState = { title: "", excerpt: "", content: "", author: "CTD", category: "Actualité", published: false, image: "" };

const AdminActualites = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterPub, setFilterPub] = useState<"all" | "published" | "draft">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: articles = [], isLoading, isError, refetch } = useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: () => api.get("/articles").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormState) => api.post("/articles", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["articles"] }); toast({ title: "Article créé" }); setDrawerOpen(false); },
    onError: (e: any) => toast({ title: "Erreur", description: e.response?.data?.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormState }) => api.put(`/articles/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["articles"] }); toast({ title: "Article mis à jour" }); setDrawerOpen(false); },
    onError: () => toast({ title: "Erreur", description: "La mise à jour a échoué.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/articles/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["articles"] }); toast({ title: "Article supprimé" }); setDeleteTarget(null); },
    onError: (e: any) => toast({ title: "Erreur", description: e.response?.data?.message, variant: "destructive" }),
  });

  const togglePublished = (article: Article) =>
    updateMutation.mutate({ id: article.id, data: { ...article, image: article.image || "", published: !article.published } });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDrawerOpen(true); };
  const openEdit   = (a: Article) => { setEditing(a); setForm({ title: a.title, excerpt: (a as any).excerpt || "", content: a.content, author: (a as any).author || "CTD", category: a.category, published: a.published, image: a.image || "" }); setDrawerOpen(true); };

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Champs requis", description: "Le titre et le contenu sont obligatoires.", variant: "destructive" });
      return;
    }
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Fichier trop lourd", description: "Max 10 Mo.", variant: "destructive" });
      return;
    }
    const fd = new FormData();
    fd.append("image", file);
    setUploadingImage(true);
    try {
      const res = await api.post("/settings/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm(prev => ({ ...prev, image: res.data.url }));
      toast({ title: "Image chargée" });
    } catch {
      toast({ title: "Erreur d'upload", variant: "destructive" });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchPub = filterPub === "all" || (filterPub === "published" ? a.published : !a.published);
    return matchSearch && matchPub;
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        icon={<Newspaper className="w-5 h-5" />}
        title="Actualités"
        description={
          <>
            <span className="font-semibold text-emerald-600">{articles.filter(a => a.published).length}</span> publiés
            &nbsp;·&nbsp;
            <span className="font-semibold text-gray-400">{articles.filter(a => !a.published).length}</span> brouillons
          </>
        }
        actions={
          <Button onClick={openCreate} className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl h-10 shadow-sm">
            <Plus className="w-4 h-4" />
            Nouvel article
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Rechercher un article…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-white" />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterPub(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterPub === f ? "bg-[#0D1F35] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              {f === "all" ? "Tous" : f === "published" ? "Publiés" : "Brouillons"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm flex-1 flex flex-col">
          <ErrorState onRetry={refetch} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm flex-1 flex flex-col">
          {filtered.length === 0 ? (
            search || filterPub !== "all" ? (
              <EmptyState
                icon={<Search className="w-7 h-7" />}
                title="Aucun résultat"
                description="Aucun article ne correspond à votre recherche."
              />
            ) : (
              <EmptyState
                icon={<Newspaper className="w-7 h-7" />}
                title="Aucun article"
                action={
                  <Button onClick={openCreate} className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl h-10 shadow-sm">
                    <Plus className="w-4 h-4" />
                    Nouvel article
                  </Button>
                }
              />
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Titre</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Rubrique</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Statut</th>
                    <th className="text-right py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {article.image ? (
                            <img src={article.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-100" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900 max-w-xs truncate">{article.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${catColors[article.category] || "bg-gray-100 text-gray-500"}`}>
                          {article.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 text-xs hidden sm:table-cell">
                        {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => togglePublished(article)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            article.published ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {article.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {article.published ? "Publié" : "Brouillon"}
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(article)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(article)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Drawer (panneau latéral) ──────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="font-bold text-gray-900">{editing ? "Modifier l'article" : "Nouvel article"}</h2>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="art-title">Titre <span className="text-red-500">*</span></Label>
                  <Input id="art-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titre accrocheur de l'article" className="h-11" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rubrique <span className="text-red-500">*</span></Label>
                    <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select value={form.published ? "published" : "draft"} onValueChange={v => setForm({ ...form, published: v === "published" })}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="art-excerpt">Résumé court (extrait)</Label>
                  <Input
                    id="art-excerpt"
                    value={form.excerpt}
                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="Courte description affichée dans les listes (150 car. max)"
                    className="h-11"
                    maxLength={250}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="art-author">Auteur</Label>
                  <Input
                    id="art-author"
                    value={form.author}
                    onChange={e => setForm({ ...form, author: e.target.value })}
                    placeholder="Ex: CTD, Rédaction"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" />Image de couverture</Label>
                  <div className="flex flex-col gap-3">
                    {form.image ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-100">
                        <img src={form.image.startsWith('http') ? form.image : `${api.defaults.baseURL?.replace('/api','')}${form.image}`} alt="Preview" className="w-full h-40 object-cover" />
                        <button
                          onClick={() => setForm({ ...form, image: "" })}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg shadow text-red-500 hover:bg-red-50"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex flex-col items-center justify-center gap-2 bg-gray-50">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                        <p className="text-xs text-gray-400">Aucune image sélectionnée</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="gap-2 h-9 rounded-xl text-sm" onClick={() => setMediaOpen(true)}>
                        <Library className="w-3.5 h-3.5" /> Médiathèque
                      </Button>
                      <Button type="button" variant="outline" className="gap-2 h-9 rounded-xl text-sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                        {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        Appareil
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contenu <span className="text-red-500">*</span></Label>
                  <RichEditor
                    value={form.content}
                    onChange={(html) => setForm(prev => ({ ...prev, content: html }))}
                    placeholder="Rédigez le contenu complet de l'article…"
                    minHeight={320}
                  />
                </div>
              </div>

              {/* Drawer footer */}
              <div className="px-6 py-4 border-t bg-gray-50/50 flex items-center justify-between gap-3">
                <Button variant="outline" onClick={() => setDrawerOpen(false)} className="rounded-xl">Annuler</Button>
                <Button
                  onClick={handleSave}
                  disabled={isPending}
                  className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl px-8 shadow-sm"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? "Enregistrer" : "Créer l'article"}
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Confirmation suppression ─────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Supprimer l'article ?</h3>
                <p className="text-sm text-gray-500 text-center mb-6 line-clamp-2">« {deleteTarget.title} »</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteTarget(null)}>Annuler</Button>
                  <Button
                    className="flex-1 rounded-xl bg-red-500 hover:bg-red-600"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  >
                    {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Supprimer
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Médiathèque (sélection image couverture) ─── */}
      {mediaOpen && (
        <MediaPickerModal
          onSelect={(url) => {
            setForm(prev => ({ ...prev, image: url }));
            setMediaOpen(false);
          }}
          onClose={() => setMediaOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminActualites;
