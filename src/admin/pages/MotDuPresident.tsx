import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@admin/lib/api";
import { Button } from "@admin/components/ui/button";
import { Input } from "@admin/components/ui/input";
import { Label } from "@admin/components/ui/label";
import { useToast } from "@admin/hooks/use-toast";
import { Save, Loader2, UserCircle, Image as ImageIcon, Upload, X as CloseIcon } from "lucide-react";
import { RichEditor } from "@admin/components/admin/RichEditor";

interface Settings {
  presidentName: string;
  presidentTitle: string;
  presidentMessage: string;
  presidentImage: string;
}

const DEFAULT_VALUES = {
  presidentName: "M. Jonathan Samuel",
  presidentTitle: "Président de la Commission",
  presidentMessage: "La Commission Technique du Désengagement œuvre pour une transformation structurelle de l'économie tchadienne en favorisant une participation accrue du secteur privé. À travers ce portail, nous affirmons notre engagement pour la transparence, la bonne gouvernance et l'attractivité économique du Tchad.",
  presidentImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=512&q=80&auto=format&fit=crop",
};

const AdminMotDuPresident = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Settings>({
    presidentName: "",
    presidentTitle: "",
    presidentMessage: "",
    presidentImage: "",
  });

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("/settings").then(r => r.data),
  });

  // Update form when data is loaded
  useEffect(() => {
    if (settings) {
      setForm({
        presidentName: settings.presidentName || DEFAULT_VALUES.presidentName,
        presidentTitle: settings.presidentTitle || DEFAULT_VALUES.presidentTitle,
        presidentMessage: settings.presidentMessage || DEFAULT_VALUES.presidentMessage,
        presidentImage: settings.presidentImage || DEFAULT_VALUES.presidentImage,
      });
    }
  }, [settings]);

  // Mutation for updating settings
  const updateMutation = useMutation({
    mutationFn: (newSettings: Partial<Settings>) => api.put("/settings", newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: "Mis à jour", description: "Le mot du président a été enregistré." });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.response?.data?.message || "Impossible de sauvegarder les modifications.", variant: "destructive" });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Fichier trop lourd", description: "La taille maximum est de 10Mo.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const response = await api.post("/settings/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setForm({ ...form, presidentImage: response.data.url });
      toast({ title: "Image chargée", description: "La photo a été téléchargée avec succès." });
    } catch (error: any) {
      toast({ 
        title: "Erreur d'upload", 
        description: error.response?.data?.message || "Impossible de charger l'image.", 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  // Helper to get full image URL
  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
    return `${baseUrl}${path}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">Mot du Président</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez le message officiel affiché sur la page d'accueil</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          {/* Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet du Président</Label>
              <Input 
                id="name"
                value={form.presidentName} 
                onChange={(e) => setForm({ ...form, presidentName: e.target.value })} 
                placeholder="Ex: M. Jean Dupont"
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Titre / Fonction officielle</Label>
              <Input 
                id="title"
                value={form.presidentTitle} 
                onChange={(e) => setForm({ ...form, presidentTitle: e.target.value })} 
                placeholder="Ex: Président de la Commission"
                className="h-11"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <ImageIcon className="w-4 h-4 text-gold" />
              Photo officielle
            </Label>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Preview Box */}
              <div className="relative group">
                <div className="w-40 h-48 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center relative shadow-inner transition-all group-hover:border-gold/50">
                  {form.presidentImage ? (
                    <img 
                      src={getImageUrl(form.presidentImage)} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-[10px] text-gray-400">Aucune photo</p>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-[1px]">
                      <Loader2 className="w-6 h-6 animate-spin text-gold" />
                    </div>
                  )}
                </div>
                
                {form.presidentImage && (
                  <button 
                    onClick={() => setForm({ ...form, presidentImage: "" })}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Upload Actions */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="gap-2 border-gold/30 text-gold hover:bg-gold/5 h-11 px-6 rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4" />
                    Choisir un fichier
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                </div>
                
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-700 leading-relaxed">
                  <strong>Conseil :</strong> Pour un rendu optimal, utilisez une image au format portrait (exemple: 800x1000 pixels). La taille maximum autorisée est de 10Mo.
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <Label htmlFor="message" className="flex items-center gap-2 font-semibold">
              <UserCircle className="w-4 h-4 text-gold" />
              Message officiel
            </Label>
            <RichEditor
              value={form.presidentMessage}
              onChange={(html) => setForm(prev => ({ ...prev, presidentMessage: html }))}
              placeholder="Saisissez le discours ou le mot du président ici…"
              minHeight={320}
            />
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending || uploading}
            className="gap-2 bg-[#0A2540] hover:bg-[#0D2F52] h-11 px-8 shadow-md rounded-xl transition-all"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminMotDuPresident;
