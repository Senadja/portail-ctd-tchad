import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@admin/lib/api";
import { Button } from "@admin/components/ui/button";
import { Input } from "@admin/components/ui/input";
import { Textarea } from "@admin/components/ui/textarea";
import { Label } from "@admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@admin/components/ui/select";
import { Plus, Search, Edit2, Trash2, X, Loader2, Gavel, Calendar, Settings as SettingsIcon, Upload, FileText, GripVertical } from "lucide-react";
import { useToast } from "@admin/hooks/use-toast";

interface Stage {
  id: string;
  label: string;
  start: string;
  end: string;
}

interface Tender {
  id: string;
  reference: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  fileUrl?: string;
  customStatuses?: string; // Stored as JSON string
  createdAt: string;
}

interface TenderStatusConfig {
  label: string;
  color: string; // e.g. "#10b981"
  percentage: number;
}

const defaultStatuses: TenderStatusConfig[] = [
  { label: "En cours", color: "#10b981", percentage: 25 },
  { label: "Clôturé", color: "#6b7280", percentage: 50 },
  { label: "Attribué", color: "#3b82f6", percentage: 100 },
];

type FormState = { 
  reference: string; 
  title: string; 
  description: string; 
  status: string; 
  deadline: string; 
  fileUrl: string;
  stages: Stage[];
};

const AdminAppelsOffres = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tender | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tender | null>(null);
  const [form, setForm] = useState<FormState>({ reference: "", title: "", description: "", status: "En cours", deadline: "", fileUrl: "" });
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("/settings").then(r => r.data),
  });

  let customStatuses: TenderStatusConfig[] = defaultStatuses;
  if (settings?.tenderStatuses) {
    try {
      const parsed = typeof settings.tenderStatuses === "string" ? JSON.parse(settings.tenderStatuses) : settings.tenderStatuses;
      if (Array.isArray(parsed) && parsed.length > 0) customStatuses = parsed;
    } catch {}
  }

  // Edit status local state
  const [editingStatuses, setEditingStatuses] = useState<TenderStatusConfig[]>([]);

  const openStatusModal = () => {
    setEditingStatuses([...customStatuses]);
    setStatusModalOpen(true);
  };

  // Drag-and-drop state for status reordering
  const dragIdx = useRef<number | null>(null);

  const { data: tenders = [], isLoading } = useQuery<Tender[]>({
    queryKey: ["tenders"],
    queryFn: () => api.get("/tenders").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormState) => api.post("/tenders", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenders"] }); toast({ title: "Appel d'offres créé" }); setDrawerOpen(false); },
    onError: (e: any) => toast({ title: "Erreur", description: e.response?.data?.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormState }) => api.put(`/tenders/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenders"] }); toast({ title: "Mis à jour" }); setDrawerOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tenders/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenders"] }); toast({ title: "Supprimé" }); setDeleteTarget(null); },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newStatuses: TenderStatusConfig[]) => api.put("/settings", { tenderStatuses: JSON.stringify(newStatuses) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: "Statuts mis à jour" });
      setStatusModalOpen(false);
    }
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ 
      reference: `AO-${Date.now().toString().slice(-6)}`, 
      title: "", 
      description: "", 
      status: customStatuses[0]?.label || "En cours", 
      deadline: "", 
      fileUrl: "",
      stages: []
    });
    setDrawerOpen(true);
  };

  const openEdit = (t: Tender) => {
    let savedStages: Stage[] = [];
    if (t.customStatuses) {
      try {
        savedStages = JSON.parse(t.customStatuses);
      } catch (e) {
        console.error("Failed to parse stages", e);
      }
    }

    setEditing(t);
    setForm({ 
      reference: t.reference, 
      title: t.title, 
      description: t.description, 
      status: t.status, 
      deadline: new Date(t.deadline).toISOString().split("T")[0], 
      fileUrl: t.fileUrl || "",
      stages: savedStages
    });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.reference.trim() || !form.deadline) {
      toast({ title: "Champs requis", description: "Référence, titre et date limite sont obligatoires.", variant: "destructive" });
      return;
    }

    // On prépare les données en incluant les stages sous forme de chaîne JSON
    const payload = {
      ...form,
      customStatuses: JSON.stringify(form.stages)
    };

    if (editing) updateMutation.mutate({ id: editing.id, data: payload as any });
    else createMutation.mutate(payload as any);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Fichier trop lourd", description: "Max 50 Mo.", variant: "destructive" });
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    setUploadingFile(true);
    try {
      const res = await api.post("/documents/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm(prev => ({ ...prev, fileUrl: res.data.url }));
      toast({ title: "Fichier téléchargé" });
    } catch {
      toast({ title: "Erreur d'upload", variant: "destructive" });
    } finally {
      setUploadingFile(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const filtered = tenders.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.reference.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appels d'offres</h1>
          <p className="text-gray-500 text-sm mt-1">{tenders.length} appels d'offres total</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openStatusModal} variant="outline" className="gap-2 rounded-xl h-10 shadow-sm">
            <SettingsIcon className="w-4 h-4" />
            Gérer les statuts
          </Button>
          <Button onClick={openCreate} className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl h-10 shadow-sm">
            <Plus className="w-4 h-4" />
            Nouvel AO
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Rechercher par titre ou référence…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterStatus === "all" ? "bg-[#0D1F35] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            Tous
          </button>
          {customStatuses.map(s => (
            <button
              key={s.label}
              onClick={() => setFilterStatus(s.label)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterStatus === s.label ? "bg-[#0D1F35] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm flex-1 flex flex-col">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Gavel className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Aucun appel d'offres trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Référence</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Titre</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Échéance</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Statut</th>
                    <th className="text-right py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(t => {
                    const st = customStatuses.find(s => s.label === t.status) || customStatuses[0];
                    return (
                      <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-xs font-bold text-[#0D1F35]/60">{t.reference}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-900 max-w-xs truncate">{t.title}</td>
                        <td className="py-3.5 px-4 text-gray-400 text-xs hidden sm:table-cell">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(t.deadline).toLocaleDateString("fr-FR")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span 
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-sm"
                            style={{ backgroundColor: st?.color || "#6b7280" }}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(t)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                <h2 className="font-bold text-gray-900">{editing ? "Modifier l'appel d'offres" : "Nouvel appel d'offres"}</h2>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Référence <span className="text-red-500">*</span></Label>
                    <Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="AO-001" className="h-11 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date limite <span className="text-red-500">*</span></Label>
                    <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Titre <span className="text-red-500">*</span></Label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Intitulé complet de l'appel d'offres" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {customStatuses.map(s => (
                        <SelectItem key={s.label} value={s.label}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                            {s.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Description</Label>
                    <span className="text-xs text-gray-400">{form.description.length} caractères</span>
                  </div>
                  <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Description détaillée de l'appel d'offres…" className="resize-none" />
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-bold text-[#0D1F35]">Phases de l'Appel d'Offres</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setForm({ ...form, stages: [...form.stages, { id: Date.now().toString(), label: "Nouvelle phase", start: "", end: "" }] })}
                      className="h-8 rounded-lg gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter
                    </Button>
                  </div>
                  
                  {form.stages.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-xs text-gray-400">Aucune phase définie. Le cercle de progression sera vide.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.stages.map((stage, idx) => (
                        <div key={stage.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 relative group">
                          <button 
                            onClick={() => setForm({ ...form, stages: form.stages.filter((_, i) => i !== idx) })}
                            className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          
                          <div className="space-y-1.5">
                            <Label className="text-xs">Libellé de la phase</Label>
                            <Input 
                              value={stage.label} 
                              onChange={e => {
                                const newStages = [...form.stages];
                                newStages[idx].label = e.target.value;
                                setForm({ ...form, stages: newStages });
                              }}
                              placeholder="ex: Réception des offres"
                              className="h-9 bg-white"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Début</Label>
                              <Input 
                                type="date" 
                                value={stage.start} 
                                onChange={e => {
                                  const newStages = [...form.stages];
                                  newStages[idx].start = e.target.value;
                                  setForm({ ...form, stages: newStages });
                                }}
                                className="h-9 bg-white"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Fin</Label>
                              <Input 
                                type="date" 
                                value={stage.end} 
                                onChange={e => {
                                  const newStages = [...form.stages];
                                  newStages[idx].end = e.target.value;
                                  setForm({ ...form, stages: newStages });
                                }}
                                className="h-9 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50/50 flex items-center justify-between gap-3">
                <Button variant="outline" onClick={() => setDrawerOpen(false)} className="rounded-xl">Annuler</Button>
                <Button onClick={handleSave} disabled={isPending} className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl px-8 shadow-sm">
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? "Enregistrer" : "Créer"}
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Status Management Modal ──────────────────────── */}
      <AnimatePresence>
        {statusModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setStatusModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Configurer les statuts</h3>
                    <p className="text-sm text-gray-500">Définissez les étapes, pourcentages et couleurs.</p>
                  </div>
                  <button onClick={() => setStatusModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="space-y-3 mb-6">
                  {editingStatuses.map((st, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={() => { dragIdx.current = idx; }}
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={() => {
                        if (dragIdx.current === null || dragIdx.current === idx) return;
                        const next = [...editingStatuses];
                        const [moved] = next.splice(dragIdx.current, 1);
                        next.splice(idx, 0, moved);
                        setEditingStatuses(next);
                        dragIdx.current = null;
                      }}
                      onDragEnd={() => { dragIdx.current = null; }}
                      className="group flex flex-wrap md:flex-nowrap items-center gap-3 p-4 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing active:opacity-70 active:scale-[0.99]"
                    >
                      {/* Grip handle */}
                      <div className="text-gray-300 group-hover:text-gray-400 transition-colors shrink-0 mt-5">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Libellé</Label>
                        <Input value={st.label} onChange={e => {
                          const newSt = [...editingStatuses];
                          newSt[idx].label = e.target.value;
                          setEditingStatuses(newSt);
                        }} />
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-xs">% Progression</Label>
                        <Input type="number" min="0" max="100" value={st.percentage} onChange={e => {
                          const newSt = [...editingStatuses];
                          newSt[idx].percentage = parseInt(e.target.value) || 0;
                          setEditingStatuses(newSt);
                        }} />
                      </div>
                      <div className="w-28 space-y-1">
                        <Label className="text-xs">Couleur</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={st.color} onChange={e => {
                            const newSt = [...editingStatuses];
                            newSt[idx].color = e.target.value;
                            setEditingStatuses(newSt);
                          }} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                          <div
                            className="flex-1 h-8 rounded-lg border border-gray-200 flex items-center px-2"
                            style={{ backgroundColor: st.color + '20' }}
                          >
                            <span className="font-mono text-xs text-gray-600">{st.color}</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-5">
                        <Button variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2" onClick={() => {
                          const newSt = editingStatuses.filter((_, i) => i !== idx);
                          setEditingStatuses(newSt);
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mb-6 border-dashed" onClick={() => {
                  setEditingStatuses([...editingStatuses, { label: "Nouveau", color: "#cccccc", percentage: 0 }]);
                }}>
                  <Plus className="w-4 h-4 mr-2" /> Ajouter un statut
                </Button>

                <div className="flex gap-3 justify-end border-t pt-4">
                  <Button variant="outline" onClick={() => setStatusModalOpen(false)}>Annuler</Button>
                  <Button onClick={() => updateSettingsMutation.mutate(editingStatuses)} disabled={updateSettingsMutation.isPending} className="bg-[#0A2540] hover:bg-[#0D2F52]">
                    {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sauvegarder les statuts
                  </Button>
                </div>
              </div>
            </motion.div>
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
                <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Supprimer l'appel d'offres ?</h3>
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

export default AdminAppelsOffres;
