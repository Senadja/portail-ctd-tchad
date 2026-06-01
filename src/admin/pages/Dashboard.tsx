import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@admin/lib/api";
import {
  Newspaper, FileText, Gavel, ClipboardList,
  ArrowRight, TrendingUp, Eye, Clock, CheckCircle2,
  AlertTriangle, Plus, Loader2, BarChart3,
} from "lucide-react";
import { Button } from "@admin/components/ui/button";

// ── Types ────────────────────────────────────────────────
interface Article  { id: string; title: string; published: boolean; category: string; createdAt: string }
interface Document { id: string; title: string; category: string; createdAt: string }
interface Tender   { id: string; reference: string; title: string; status: string; deadline: string }
interface Form     { id: string; type: string; status: string; data: any; createdAt: string }

const AdminDashboard = () => {
  const { data: articles  = [], isLoading: loadingA } = useQuery<Article[]>({ queryKey: ["articles"],  queryFn: () => api.get("/articles").then(r => r.data) });
  const { data: documents = [], isLoading: loadingD } = useQuery<Document[]>({ queryKey: ["documents"], queryFn: () => api.get("/documents").then(r => r.data) });
  const { data: tenders  = [], isLoading: loadingT } = useQuery<Tender[]>({ queryKey: ["tenders"],  queryFn: () => api.get("/tenders").then(r => r.data) });
  const { data: forms    = [], isLoading: loadingF } = useQuery<Form[]>({ queryKey: ["forms"],    queryFn: () => api.get("/forms").then(r => r.data) });

  const isLoading = loadingA || loadingD || loadingT || loadingF;

  const stats = [
    {
      label: "Articles publiés",
      value: articles.filter(a => a.published).length,
      total: articles.length,
      icon: Newspaper,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/actualites",
    },
    {
      label: "Documents en ligne",
      value: documents.length,
      total: documents.length,
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/admin/documents",
    },
    {
      label: "Appels d'offres actifs",
      value: tenders.filter(t => t.status === "En cours").length,
      total: tenders.length,
      icon: Gavel,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/admin/appels-offres",
    },
    {
      label: "Formulaires en attente",
      value: forms.filter(f => f.status === "NOUVEAU").length,
      total: forms.length,
      icon: ClipboardList,
      color: "text-red-600",
      bg: "bg-red-50",
      href: "/admin/formulaires",
      alert: forms.filter(f => f.status === "NOUVEAU").length > 0,
    },
  ];

  // Recent items merged & sorted
  const recentActivity = [
    ...articles.slice(0, 3).map(a => ({
      icon: Newspaper,
      text: a.title,
      meta: a.published ? "Publié" : "Brouillon",
      time: a.createdAt,
      type: a.published ? "success" : "neutral",
      href: "/admin/actualites",
    })),
    ...tenders.slice(0, 2).map(t => ({
      icon: Gavel,
      text: t.title,
      meta: t.status,
      time: t.deadline,
      type: t.status === "En cours" ? "success" : "neutral",
      href: "/admin/appels-offres",
    })),
    ...forms.filter(f => f.status === "NOUVEAU").slice(0, 3).map(f => ({
      icon: ClipboardList,
      text: `Demande ${f.type.toLowerCase()} reçue`,
      meta: "Non traité",
      time: f.createdAt,
      type: "warning",
      href: "/admin/formulaires",
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2540]/40" />
      </div>
    );
  }

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de l'activité du portail CTD</p>
        </div>
        <Link to="/admin/actualites">
          <Button className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl h-10 shadow-sm">
            <Plus className="w-4 h-4" />
            Nouvel article
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07 }}
          >
            <Link
              to={stat.href}
              className={`block bg-white rounded-2xl border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${
                stat.alert ? "border-red-200" : "border-gray-200/80"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.alert && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    Urgent
                  </span>
                )}
              </div>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              {stat.total !== stat.value && (
                <p className="text-xs text-gray-400 mt-1">{stat.total} au total</p>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        {/* Recent activity */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Activité récente
            </h2>
            <span className="text-xs text-gray-400 font-medium">{recentActivity.length} éléments</span>
          </div>
          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <Link
                key={i}
                to={activity.href}
                className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  activity.type === "success" ? "bg-emerald-50 text-emerald-500" :
                  activity.type === "warning" ? "bg-amber-50 text-amber-500" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate group-hover:text-[#0D1F35]">{activity.text}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                      activity.type === "success" ? "text-emerald-600 bg-emerald-50" :
                      activity.type === "warning" ? "text-amber-600 bg-amber-50" :
                      "text-gray-400 bg-gray-100"
                    }`}>{activity.meta}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.time).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 mt-2 transition-colors" />
              </Link>
            )) : (
              <div className="py-12 text-center text-gray-400">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Actions rapides</h2>
            </div>
            <div className="p-3 space-y-1">
              {[
                { label: "Créer un article",       icon: Newspaper,    href: "/admin/actualites",   color: "text-blue-500 bg-blue-50" },
                { label: "Ajouter un document",    icon: FileText,     href: "/admin/documents",    color: "text-emerald-500 bg-emerald-50" },
                { label: "Nouvel appel d'offres",  icon: Gavel,        href: "/admin/appels-offres",color: "text-amber-500 bg-amber-50" },
                { label: "Gérer les formulaires",  icon: ClipboardList,href: "/admin/formulaires",  color: "text-red-500 bg-red-50" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#0D1F35]">{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Summary mini-cards */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              Résumé du contenu
            </h2>
            {[
              { label: "Articles en brouillon", count: articles.filter(a => !a.published).length, icon: Eye, color: "text-gray-400" },
              { label: "AO clôturés",            count: tenders.filter(t => t.status === "Clôturé").length,  icon: CheckCircle2, color: "text-blue-400" },
              { label: "AO attribués",           count: tenders.filter(t => t.status === "Attribué").length, icon: CheckCircle2, color: "text-emerald-400" },
              { label: "Formulaires traités",    count: forms.filter(f => f.status === "TRAITE").length,     icon: CheckCircle2, color: "text-emerald-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  {item.label}
                </div>
                <span className="font-bold text-gray-800 tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
