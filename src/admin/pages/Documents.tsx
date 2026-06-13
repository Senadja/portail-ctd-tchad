import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@admin/lib/api";
import { Button } from "@admin/components/ui/button";
import { Input } from "@admin/components/ui/input";
import { Label } from "@admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@admin/components/ui/select";
import { Plus, Search, Trash2, X, FileText, Loader2, Upload, Download, FileCheck } from "lucide-react";
import { useToast } from "@admin/hooks/use-toast";
import { EmptyState } from "@admin/components/admin/EmptyState";
import { ErrorState } from "@admin/components/admin/ErrorState";

interface Document {
  id: string;
  title: string;
  category: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  fileType: string;
  createdAt: string;
}

const docCategories = [
  { value: "Textes",    label: "Textes réglementaires" },
  { value: "DAO",       label: "Dossiers d'appel d'offres" },
  { value: "Rapport",   label: "Rapports" },
  { value: "Étude",     label: "Études sectorielles" },
  { value: "Guide",     label: "Guides investisseurs" },
  { value: "Formulaire",label: "Formulaires" },
];

const catColors: Record<string, string> = {
  Textes:     "bg-blue-50 text-blue-600",
  DAO:        "bg-amber-50 text-amber-600",
  Rapport:    "bg-purple-50 text-purple-600",
  Étude:      "bg-teal-50 text-teal-600",
  Guide:      "bg-emerald-50 text-emerald-600",
  Formulaire: "bg-gray-100 text-gray-500",
};

const AdminDocuments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [form, setForm] = useState({ title: "", category: "Textes", description: "" });

  const { data: documents = [], isLoading, isError, refetch } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: () => api.get("/documents").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => api.post("/documents", formData, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["documents"] }); toast({ title: "Document ajouté" }); setDrawerOpen(false); setFile(null); },
    onError: (e: any) => toast({ title: "Erreur upload", description: e.response?.data?.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["documents"] }); toast({ title: "Document supprimé" }); setDeleteTarget(null); },
    onError: (e: any) => toast({ title: "Erreur de suppression", description: e.response?.data?.message || "Le document n'a pas pu être supprimé.", variant: "destructive" }),
  });

  const openCreate = () => { setForm({ title: "", category: "Textes", description: "" }); setFile(null); setDrawerOpen(true); };

  const handleSave = () => {
    if (!form.title.trim() || !file) {
      toast({ title: "Champs requis", description: "Le titre et le fichier sont obligatoires.", variant: "destructive" });
      return;
    }
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("category", form.category);
    fd.append("description", form.description);
    fd.append("file", file);
    createMutation.mutate(fd);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const filtered = documents.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || d.category === filterCat;
    return matchSearch && matchCat;
  });

  const baseUrl = api.defaults.baseURL?.replace("/api", "") || "";

  const hasFilters = search.trim() !== "" || filterCat !== "all";

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents officiels</h1>
          <p className="text-gray-500 text-sm mt-1">{documents.length} document{documents.length > 1 ? "s" : ""} disponible{documents.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl h-10 shadow-sm">
          <Plus className="w-4 h-4" />
          Ajouter un document
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Rechercher un document…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-white" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setFilterCat("all")} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterCat === "all" ? "bg-[#0D1F35] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600"}`}>Tous</button>
          {docCategories.map(c => (
            <button key={c.value} onClick={() => setFilterCat(c.value)} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterCat === c.value ? "bg-[#0D1F35] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600"}`}>
              {c.value}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm flex-1 flex flex-col">
          {filtered.length === 0 ? (
            hasFilters ? (
              <EmptyState
                icon={<FileText />}
                title="Aucun résultat"
                description="Aucun document ne correspond à votre recherche ou à ce filtre."
              />
            ) : (
              <EmptyState
                icon={<FileText />}
                title="Aucun document"
                description="Commencez par ajouter un premier document officiel."
                action={
                  <Button onClick={openCreate} className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl h-10 shadow-sm">
                    <Plus className="w-4 h-4" />
                    Ajouter un document
                  </Button>
                }
              />
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Document</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Ajouté le</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Taille</th>
                    <th className="text-right py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-red-400" />
                          </div>
                          <a href={`${baseUrl}${doc.fileUrl}`} target="_blank" rel="noreferrer" className="font-medium text-gray-900 hover:text-[#0D1F35] hover:underline max-w-xs truncate block">
                            {doc.title}
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${catColors[doc.category] || "bg-gray-100"}`}>{doc.category}</span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 text-xs hidden sm:table-cell">{new Date(doc.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="py-3.5 px-4 text-gray-400 text-xs hidden sm:table-cell">{doc.fileSize || "—"}</td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a href={`${baseUrl}${doc.fileUrl}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                            <Download className="w-4 h-4" />
                          </a>
                          <button onClick={() => setDeleteTarget(doc)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
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

      {/* ── Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="font-bold text-gray-900">Ajouter un document</h2>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="space-y-2">
                  <Label>Titre du document <span className="text-red-500">*</span></Label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Rapport annuel CTD 2023" className="h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Catégorie <span className="text-red-500">*</span></Label>
                    <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>{docCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description courte</Label>
                    <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optionnelle" className="h-11" />
                  </div>
                </div>

                {/* Drop zone */}
                <div className="space-y-2">
                  <Label>Fichier <span className="text-red-500">*</span></Label>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center gap-3 h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${dragOver ? "border-[#0D1F35] bg-[#0D1F35]/5" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"}`}
                  >
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
                    {file ? (
                      <>
                        <FileCheck className="w-10 h-10 text-emerald-500" />
                        <div className="text-center">
                          <p className="font-semibold text-gray-800 text-sm">{file.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
                        </div>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setFile(null); }}
                          className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow border hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-300" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500">Glisser-déposer ou cliquer pour sélectionner</p>
                          <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX — Max 50 Mo</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50/50 flex items-center justify-between gap-3">
                <Button variant="outline" onClick={() => setDrawerOpen(false)} className="rounded-xl">Annuler</Button>
                <Button onClick={handleSave} disabled={createMutation.isPending} className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl px-8 shadow-sm">
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Ajouter le document
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Supprimer le document ?</h3>
                <p className="text-sm text-gray-500 text-center mb-6 line-clamp-2">« {deleteTarget.title} »</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteTarget(null)}>Annuler</Button>
                  <Button className="flex-1 rounded-xl bg-red-500 hover:bg-red-600" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTarget.id)}>
                    {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Supprimer
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDocuments;
