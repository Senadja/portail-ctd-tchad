// Page Médiathèque — /admin/medias
// Gestion centralisée de tous les fichiers uploadés

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import api from "@admin/lib/api";
import { useToast } from "@admin/hooks/use-toast";
import {
  Upload, Search, Copy, Check, Loader2, Trash2,
  ImageIcon, FileText, Grid3X3, List, ExternalLink,
} from "lucide-react";
import { Button } from "@admin/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
  createdAt: string;
}

const BASE = api.defaults.baseURL?.replace("/api", "") ?? "http://localhost:5015";
const fullUrl = (url: string) => (url.startsWith("http") ? url : `${BASE}${url}`);
const fmtSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
};
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const AdminMedias = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "pdf">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaFile | null>(null);

  const { data: files = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ["media-page", filter, search],
    queryFn: () =>
      api.get("/media", { params: { type: filter, search: search || undefined } }).then((r) => r.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => {
      return Promise.all(
        files.map((f) => {
          const fd = new FormData();
          fd.append("file", f);
          return api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        })
      );
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["media-page"] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: `${results.length} fichier${results.length > 1 ? "s" : ""} uploadé${results.length > 1 ? "s" : ""} ✓` });
    },
    onError: () => toast({ title: "Erreur upload", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-page"] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
      setSelected(null);
      toast({ title: "Fichier supprimé" });
    },
    onError: () => toast({ title: "Erreur suppression", variant: "destructive" }),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [], "application/pdf": [] },
    multiple: true,
    onDrop: (accepted) => uploadMutation.mutate(accepted),
  });

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(fullUrl(url));
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "URL copiée dans le presse-papiers" });
  };

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médiathèque</h1>
          <p className="text-gray-500 text-sm mt-1">
            {files.length} fichier{files.length !== 1 ? "s" : ""} · {fmtSize(totalSize)} utilisés
          </p>
        </div>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <Button className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl h-10 shadow-sm">
            {uploadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Uploader des fichiers
          </Button>
        </div>
      </div>

      {/* Drop zone large */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-[#0D1F35] bg-[#0D1F35]/5 scale-[1.01]"
            : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
        }`}
      >
        <input {...getInputProps()} />
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 animate-spin text-[#0D1F35]/40" />
            <p className="text-sm text-gray-500">Upload en cours…</p>
          </div>
        ) : (
          <>
            <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragActive ? "text-[#0D1F35]" : "text-gray-300"}`} />
            <p className="text-sm font-medium text-gray-600">
              {isDragActive ? "Déposez vos fichiers ici" : "Glissez & déposez vos fichiers ici"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Images (JPG, PNG, WebP, SVG) · PDF · 20 Mo max par fichier</p>
          </>
        )}
      </div>

      {/* Filters + search + view toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {([
            { id: "all", label: "Tous", icon: Grid3X3 },
            { id: "image", label: "Images", icon: ImageIcon },
            { id: "pdf", label: "PDF", icon: FileText },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === t.id
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher un fichier…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D1F35]/20 bg-white"
          />
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setView("grid")} className={`p-2 rounded-lg ${view === "grid" ? "bg-white shadow-sm" : "text-gray-400"}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")} className={`p-2 rounded-lg ${view === "list" ? "bg-white shadow-sm" : "text-gray-400"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        {/* Galerie */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Aucun fichier trouvé</p>
              <p className="text-sm mt-1">Uploadez votre premier fichier ci-dessus</p>
            </div>
          ) : view === "grid" ? (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3"
            >
              <AnimatePresence>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`group relative bg-gray-100 rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      selected?.id === file.id
                        ? "border-[#0D1F35] ring-2 ring-[#0D1F35]/20"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    onClick={() => setSelected(file)}
                  >
                    {file.mimeType.startsWith("image/") ? (
                      <img src={fullUrl(file.url)} alt={file.alt || file.filename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 bg-gray-50">
                        <FileText className="w-8 h-8 text-gray-400" />
                        <p className="text-xs text-gray-500 text-center truncate w-full">{file.filename}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-all">
                      <p className="text-white text-[9px] truncate">{file.filename}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            // List view
            <div className="space-y-1.5">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer border transition-all ${
                    selected?.id === file.id
                      ? "border-[#0D1F35] bg-[#0D1F35]/5"
                      : "border-gray-100 hover:bg-gray-50 bg-white"
                  }`}
                  onClick={() => setSelected(file)}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {file.mimeType.startsWith("image/") ? (
                      <img src={fullUrl(file.url)} alt={file.filename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.filename}</p>
                    <p className="text-xs text-gray-400">{fmtSize(file.size)} · {fmtDate(file.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    {copied === file.url ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panneau latéral — détail fichier sélectionné */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-64 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4 self-start sticky top-4"
            >
              <div className="rounded-xl overflow-hidden bg-gray-100 aspect-video">
                {selected.mimeType.startsWith("image/") ? (
                  <img src={fullUrl(selected.url)} alt={selected.alt || selected.filename} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-800 break-all">{selected.filename}</p>
                <p className="text-xs text-gray-400">{selected.mimeType}</p>
                <p className="text-xs text-gray-400">{fmtSize(selected.size)} · {fmtDate(selected.createdAt)}</p>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 rounded-xl h-8 text-xs"
                  onClick={() => copyUrl(selected.url)}
                >
                  {copied === selected.url ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copier l'URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 rounded-xl h-8 text-xs"
                  onClick={() => window.open(fullUrl(selected.url), "_blank")}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ouvrir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 rounded-xl h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm(`Supprimer "${selected.filename}" ?`)) {
                      deleteMutation.mutate(selected.id);
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminMedias;
