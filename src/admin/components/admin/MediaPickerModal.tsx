// Modal de sélection d'image depuis la médiathèque
// Utilisé par le RichEditor pour insérer des images

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import api from "@admin/lib/api";
import { X, Upload, Search, Copy, Check, Loader2, Trash2, ImageIcon } from "lucide-react";
import { useToast } from "@admin/hooks/use-toast";

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

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
  mode?: "insert" | "pick"; // insert = click ferme, pick = renvoie URL
}

export const MediaPickerModal = ({ onSelect, onClose, mode = "insert" }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "pdf">("image");
  const [copied, setCopied] = useState<string | null>(null);

  const { data: files = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ["media", filter, search],
    queryFn: () =>
      api.get("/media", { params: { type: filter, search: search || undefined } }).then((r) => r.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "Fichier uploadé ✓" });
    },
    onError: () => toast({ title: "Erreur upload", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "Fichier supprimé" });
    },
    onError: () => toast({ title: "Erreur suppression", variant: "destructive" }),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [], "application/pdf": [] },
    multiple: true,
    onDrop: (accepted) => accepted.forEach((f) => uploadMutation.mutate(f)),
  });

  const copyUrl = (url: string) => {
    const full = url.startsWith("http") ? url : `${BASE}${url}`;
    navigator.clipboard.writeText(full);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const fullUrl = (url: string) => (url.startsWith("http") ? url : `${BASE}${url}`);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Médiathèque</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b bg-gray-50/50">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(["all", "image", "pdf"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  filter === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "all" ? "Tous" : t === "image" ? "Images" : "PDF"}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1F35]/20"
            />
          </div>
        </div>

        {/* Drop zone + galerie */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-[#0D1F35] bg-[#0D1F35]/5"
                : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
            }`}
          >
            <input {...getInputProps()} />
            {uploadMutation.isPending ? (
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  {isDragActive ? "Déposez ici…" : "Glissez vos fichiers ou cliquez pour uploader"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Images & PDF · 20 Mo max</p>
              </>
            )}
          </div>

          {/* Galerie */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun fichier dans la médiathèque</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative bg-gray-100 rounded-xl overflow-hidden aspect-square border border-gray-200 hover:border-[#0D1F35]/30 transition-all cursor-pointer"
                  onClick={() => {
                    onSelect(fullUrl(file.url));
                  }}
                >
                  {file.mimeType.startsWith("image/") ? (
                    <img
                      src={fullUrl(file.url)}
                      alt={file.alt || file.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                      <div className="text-2xl">📄</div>
                      <p className="text-xs text-gray-500 text-center truncate w-full px-1">
                        {file.filename}
                      </p>
                    </div>
                  )}

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(file.url);
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold bg-white text-gray-800 px-2 py-1 rounded-md shadow hover:bg-gray-50"
                    >
                      {copied === file.url ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      Copier URL
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Supprimer ce fichier ?")) deleteMutation.mutate(file.id);
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold bg-red-500 text-white px-2 py-1 rounded-md shadow hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                      Suppr.
                    </button>
                  </div>

                  {/* Filename tooltip */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1.5 py-1 truncate opacity-0 group-hover:opacity-100 transition-all">
                    {file.filename}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50/50 flex items-center justify-between">
          <span className="text-xs text-gray-400">{files.length} fichier{files.length !== 1 ? "s" : ""}</span>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
