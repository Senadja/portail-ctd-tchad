import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@admin/lib/api";
import { Input } from "@admin/components/ui/input";
import { Button } from "@admin/components/ui/button";
import { useToast } from "@admin/hooks/use-toast";
import { ErrorState } from "@admin/components/admin/ErrorState";
import { EmptyState } from "@admin/components/admin/EmptyState";
import {
  Search, Eye, CheckCircle2, Clock, Archive, X, Loader2,
  ClipboardList, Mail, Phone, User, Building2, Calendar,
  ChevronRight,
} from "lucide-react";

interface FormSubmission {
  id: string;
  type: string;
  data: Record<string, any>;
  status: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  NOUVEAU:  { label: "Nouveau",  color: "bg-red-50 text-red-600 border border-red-100",    dot: "bg-red-400" },
  EN_COURS: { label: "En cours", color: "bg-amber-50 text-amber-600 border border-amber-100", dot: "bg-amber-400" },
  TRAITE:   { label: "Traité",   color: "bg-emerald-50 text-emerald-600 border border-emerald-100", dot: "bg-emerald-400" },
  ARCHIVE:  { label: "Archivé",  color: "bg-gray-100 text-gray-500 border border-gray-200", dot: "bg-gray-300" },
};

// Map field keys to French labels
const fieldLabels: Record<string, string> = {
  nom: "Nom", name: "Nom", prenom: "Prénom", email: "Email", phone: "Téléphone",
  telephone: "Téléphone", organisation: "Organisation", entreprise: "Entreprise",
  sujet: "Sujet", objet: "Objet", message: "Message", pays: "Pays",
  secteur: "Secteur", montant: "Montant envisagé", description: "Description",
};

const fieldIcon = (key: string) => {
  if (key.includes("email")) return Mail;
  if (key.includes("phone") || key.includes("tel")) return Phone;
  if (key.includes("organisation") || key.includes("entreprise")) return Building2;
  if (key.includes("nom") || key.includes("name")) return User;
  return ChevronRight;
};

const typeColors: Record<string, string> = {
  CONTACT:      "bg-blue-50 text-blue-600",
  INVESTISSEUR: "bg-emerald-50 text-emerald-600",
  INFORMATION:  "bg-purple-50 text-purple-600",
};

const AdminFormulaires = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<FormSubmission | null>(null);

  const { data: submissions = [], isLoading, isError, refetch } = useQuery<FormSubmission[]>({
    queryKey: ["forms"],
    queryFn: () => api.get("/forms").then(r => r.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/forms/${id}/status`, { status }),
    onSuccess: (_, { id, status }) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast({ title: "Statut mis à jour" });
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Le changement de statut a échoué.", variant: "destructive" });
    },
  });

  const handleStatus = (id: string, status: string) => updateStatusMutation.mutate({ id, status });

  const filtered = submissions.filter(f => {
    const data = f.data || {};
    const name = data.nom || data.name || data.prenom || "";
    const email = data.email || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const newCount = submissions.filter(f => f.status === "NOUVEAU").length;

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Formulaires reçus</h1>
          {newCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
              {newCount} nouveau{newCount > 1 ? "x" : ""}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-1">
          {submissions.length} soumission{submissions.length > 1 ? "s" : ""} au total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Rechercher par nom ou email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "NOUVEAU", "EN_COURS", "TRAITE", "ARCHIVE"].map(s => {
            const cfg = statusConfig[s];
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterStatus === s ? "bg-[#0D1F35] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
              >
                {cfg && <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />}
                {s === "all" ? "Tous" : cfg?.label}
                {s === "NOUVEAU" && newCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">{newCount}</span>
                )}
              </button>
            );
          })}
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
            search || filterStatus !== "all" ? (
              <EmptyState
                icon={<ClipboardList />}
                title="Aucun résultat"
                description="Aucun formulaire ne correspond à votre recherche ou à ce filtre."
              />
            ) : (
              <EmptyState
                icon={<ClipboardList />}
                title="Aucun formulaire reçu"
                description="Les soumissions des formulaires du site apparaîtront ici."
              />
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Statut</th>
                    <th className="text-right py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(f => {
                    const data = f.data || {};
                    const name = data.nom || data.name || "Inconnu";
                    const email = data.email || "";
                    const cfg = statusConfig[f.status] || statusConfig.ARCHIVE;
                    return (
                      <tr key={f.id} className={`hover:bg-gray-50/60 transition-colors ${f.status === "NOUVEAU" ? "bg-red-50/20" : ""}`}>
                        <td className="py-3.5 px-5">
                          <div>
                            <p className="font-semibold text-gray-900">{name}</p>
                            {email && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Mail className="w-3 h-3" />{email}</p>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${typeColors[f.type] || "bg-gray-100 text-gray-500"}`}>{f.type}</span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 text-xs hidden sm:table-cell">
                          {new Date(f.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setSelected(f)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            {f.status !== "TRAITE" && (
                              <button onClick={() => handleStatus(f.id, "TRAITE")} className="p-2 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-500 transition-colors">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {f.status !== "ARCHIVE" && (
                              <button onClick={() => handleStatus(f.id, "ARCHIVE")} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
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

      {/* ── Détail formulaire (drawer) ───────────────────── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h2 className="font-bold text-gray-900">Détails de la demande</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Reçu le {new Date(selected.createdAt).toLocaleString("fr-FR")}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status + type */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${typeColors[selected.type] || "bg-gray-100"}`}>
                    {selected.type}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${statusConfig[selected.status]?.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selected.status]?.dot}`} />
                    {statusConfig[selected.status]?.label}
                  </span>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  {Object.entries(selected.data)
                    .filter(([, v]) => v !== null && v !== undefined && v !== "")
                    .map(([key, value]) => {
                      const Icon = fieldIcon(key);
                      const label = fieldLabels[key] || key;
                      return (
                        <div key={key} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
                          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100 mt-0.5">
                            <Icon className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                            <p className="text-sm font-medium text-gray-800 mt-0.5 break-words">
                              {key.includes("email") ? (
                                <a href={`mailto:${value}`} className="text-blue-600 hover:underline">{String(value)}</a>
                              ) : key.includes("phone") || key.includes("tel") ? (
                                <a href={`tel:${value}`} className="text-blue-600 hover:underline">{String(value)}</a>
                              ) : typeof value === "string" ? value : JSON.stringify(value)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                  <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date de réception</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{new Date(selected.createdAt).toLocaleString("fr-FR")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t bg-gray-50/50 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Changer le statut</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 flex-1 rounded-xl" onClick={() => handleStatus(selected.id, "EN_COURS")} disabled={selected.status === "EN_COURS"}>
                    <Clock className="w-3.5 h-3.5" />En cours
                  </Button>
                  <Button size="sm" className="gap-1.5 flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600" onClick={() => handleStatus(selected.id, "TRAITE")} disabled={selected.status === "TRAITE"}>
                    <CheckCircle2 className="w-3.5 h-3.5" />Marquer traité
                  </Button>
                </div>
                <Button size="sm" variant="ghost" className="gap-1.5 w-full rounded-xl text-gray-500" onClick={() => handleStatus(selected.id, "ARCHIVE")} disabled={selected.status === "ARCHIVE"}>
                  <Archive className="w-3.5 h-3.5" />Archiver
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFormulaires;
