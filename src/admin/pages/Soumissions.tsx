// Page Soumissions d'Appels d'Offres — /admin/soumissions
// Gestion complète : liste, fiche détaillée, workflow statuts, export CSV

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@admin/lib/api";
import { useToast } from "@admin/hooks/use-toast";
import { Button } from "@admin/components/ui/button";
import {
  Gavel, ChevronLeft, Loader2, Download, FileText,
  CheckCircle2, XCircle, Eye, Clock, ExternalLink,
  ArrowRight, Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorState } from "@admin/components/admin/ErrorState";

// ── Types ────────────────────────────────────────────────────────
interface Tender {
  id: string;
  reference: string;
  title: string;
  status: string;
  deadline: string;
  submissions?: Submission[];
}

interface Submission {
  id: string;
  tenderId: string;
  structureName: string;
  legalRep: string;
  legalRepRole?: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  proposedAmount?: number;
  message?: string;
  documents: SubmissionDoc[];
  submissionRound: number;
  status: string;
  submittedAt: string;
}

interface SubmissionDoc {
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

const STATUS_CONFIG = {
  "REÇUE":          { label: "Reçue",           color: "bg-blue-100 text-blue-700 border-blue-200",    icon: Clock },
  "EN_EVALUATION":  { label: "En évaluation",   color: "bg-amber-100 text-amber-700 border-amber-200",  icon: Eye },
  "RETENUE":        { label: "Retenue ✓",       color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  "REJETÉE":        { label: "Rejetée",          color: "bg-red-100 text-red-700 border-red-200",        icon: XCircle },
} as const;

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

const fmtMoney = (n?: number) =>
  n != null ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(n) : "—";

const BASE = api.defaults.baseURL?.replace("/api", "") ?? "http://localhost:5015";
const fullUrl = (url: string) => (url.startsWith("http") ? url : `${BASE}${url}`);

// ── Export CSV ─────────────────────────────────────────────────────
const exportCSV = (submissions: Submission[], tenderRef: string) => {
  const headers = ["Structure", "Représentant", "Rôle", "Email", "Téléphone", "Pays", "Ville", "Montant proposé (FCFA)", "Statut", "Tour", "Date soumission"];
  const rows = submissions.map(s => [
    s.structureName, s.legalRep, s.legalRepRole || "", s.email,
    s.phone || "", s.country || "", s.city || "",
    s.proposedAmount?.toString() || "", s.status,
    s.submissionRound.toString(), new Date(s.submittedAt).toLocaleDateString("fr-FR"),
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `soumissions-${tenderRef}-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Composant principal ────────────────────────────────────────────
const AdminSoumissions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch all tenders (avec leurs soumissions via query séparée)
  const { data: tenders = [], isLoading, isError, refetch } = useQuery<Tender[]>({
    queryKey: ["tenders-admin"],
    queryFn: () => api.get("/tenders").then(r => {
      const data = r.data;
      return Array.isArray(data) ? data : (data.tenders || []);
    }),
  });

  // Fetch soumissions d'un AO précis
  const { data: submissions = [], isLoading: loadingSubs, isError: subsError, refetch: refetchSubs } = useQuery<Submission[]>({
    queryKey: ["submissions", selectedTender?.id],
    queryFn: () => api.get(`/tenders/${selectedTender!.id}/submissions`).then(r => r.data),
    enabled: !!selectedTender,
  });

  // Mutation : changer statut soumission
  const statusMutation = useMutation({
    mutationFn: ({ subId, status }: { subId: string; status: string }) =>
      api.patch(`/tenders/submissions/${subId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", selectedTender?.id] });
      toast({ title: "Statut mis à jour" });
      setSelectedSub(null);
    },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  const filteredSubs = submissions.filter(s => {
    const matchSearch = !search ||
      s.structureName.toLowerCase().includes(search.toLowerCase()) ||
      s.legalRep.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Vue liste des AOs ─────────────────────────────────────────
  if (!selectedTender) {
    const filteredTenders = tenders.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.reference.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="space-y-6 flex-1 flex flex-col">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soumissions en ligne</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les offres reçues pour chaque appel d'offres</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher un AO…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D1F35]/20 bg-white"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <div className="grid gap-3">
            {filteredTenders.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelectedTender(t); setSearch(""); }}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#0D1F35]/30 hover:shadow-md transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0D1F35]/5 flex items-center justify-center shrink-0">
                  <Gavel className="w-5 h-5 text-[#0D1F35]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs font-bold text-gray-400">{t.reference}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      t.status === "En cours" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}>{t.status}</span>
                  </div>
                  <p className="font-semibold text-gray-800 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Clôture : {new Date(t.deadline).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </button>
            ))}
            {filteredTenders.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Gavel className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucun appel d'offres trouvé</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Vue soumissions d'un AO ────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setSelectedTender(null); setSelectedSub(null); }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Tous les AOs
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700 truncate">{selectedTender.reference}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 truncate">{selectedTender.title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {submissions.length} soumission{submissions.length !== 1 ? "s" : ""} reçue{submissions.length !== 1 ? "s" : ""}
          </p>
        </div>
        {submissions.length > 0 && (
          <Button
            variant="outline"
            className="gap-2 rounded-xl h-9 text-sm"
            onClick={() => exportCSV(submissions, selectedTender.reference)}
          >
            <Download className="w-3.5 h-3.5" />
            Exporter CSV
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {["all", "REÇUE", "EN_EVALUATION", "RETENUE", "REJETÉE"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s === "all" ? "Toutes" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher une structure, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Content */}
      {loadingSubs ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
      ) : subsError ? (
        <ErrorState onRetry={refetchSubs} />
      ) : filteredSubs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 font-medium">Aucune soumission</p>
          <p className="text-gray-300 text-sm mt-1">
            {submissions.length === 0 ? "Aucune offre n'a encore été soumise pour cet AO" : "Modifiez vos filtres"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/80">
                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Structure</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Montant</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="text-right py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSubs.map(sub => {
                const cfg = STATUS_CONFIG[sub.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG["REÇUE"];
                return (
                  <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-medium text-gray-800">{sub.structureName}</p>
                      <p className="text-xs text-gray-400">{sub.legalRep}{sub.legalRepRole ? ` — ${sub.legalRepRole}` : ""}</p>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <p className="text-gray-600">{sub.email}</p>
                      {sub.phone && <p className="text-xs text-gray-400">{sub.phone}</p>}
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <span className="font-medium text-gray-700">{fmtMoney(sub.proposedAmount)}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.color}`}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400 hidden sm:table-cell">
                      {new Date(sub.submittedAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="text-xs font-semibold text-[#0D1F35] hover:underline"
                      >
                        Voir détail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal détail soumission ── */}
      <AnimatePresence>
        {selectedSub && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedSub(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                {/* Modal header */}
                <div className="flex items-start justify-between p-6 border-b">
                  <div>
                    <h2 className="font-bold text-gray-900">{selectedSub.structureName}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Soumis le {fmtDate(selectedSub.submittedAt)}</p>
                  </div>
                  <button onClick={() => setSelectedSub(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* Identité */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Représentant légal</p>
                      <p className="font-medium text-gray-800">{selectedSub.legalRep}</p>
                      {selectedSub.legalRepRole && <p className="text-sm text-gray-500">{selectedSub.legalRepRole}</p>}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Contact</p>
                      <p className="text-gray-800">{selectedSub.email}</p>
                      {selectedSub.phone && <p className="text-sm text-gray-500">{selectedSub.phone}</p>}
                    </div>
                    {selectedSub.country && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Localisation</p>
                        <p className="text-gray-800">{[selectedSub.city, selectedSub.country].filter(Boolean).join(", ")}</p>
                      </div>
                    )}
                    {selectedSub.proposedAmount != null && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Montant proposé</p>
                        <p className="text-lg font-bold text-gray-900">{fmtMoney(selectedSub.proposedAmount)}</p>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  {selectedSub.message && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Message / Notes</p>
                      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border">
                        {selectedSub.message}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {selectedSub.documents?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Documents joints ({selectedSub.documents.length})</p>
                      <div className="space-y-2">
                        {selectedSub.documents.map((doc, i) => (
                          <a
                            key={i}
                            href={fullUrl(doc.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-700 flex-1 truncate">{doc.name}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Workflow statut */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Changer le statut</p>
                    <div className="flex gap-2 flex-wrap">
                      {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => statusMutation.mutate({ subId: selectedSub.id, status: key })}
                          disabled={selectedSub.status === key || statusMutation.isPending}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 ${
                            selectedSub.status === key
                              ? cfg.color + " ring-2 ring-offset-1 ring-current"
                              : "bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {statusMutation.isPending && selectedSub.status !== key ? <Loader2 className="w-3 h-3 animate-spin" /> : <cfg.icon className="w-3 h-3" />}
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal footer */}
                <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedSub(null)} className="rounded-xl">
                    Fermer
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

export default AdminSoumissions;
