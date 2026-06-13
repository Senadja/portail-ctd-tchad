import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@admin/lib/api";
import { Button } from "@admin/components/ui/button";
import { Input } from "@admin/components/ui/input";
import { Label } from "@admin/components/ui/label";
import { Textarea } from "@admin/components/ui/textarea";
import { useToast } from "@admin/hooks/use-toast";
import {
  Save, Building2, Phone, Mail, Globe, Loader2,
  Layout, Info, Link as LinkIcon, Plus, Trash2, Upload, ImageIcon, Zap, GripVertical, Users,
} from "lucide-react";
import { IconPicker } from "@admin/components/admin/IconPicker";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── Types ──────────────────────────────────────────────────────────────
interface Pillar {
  icon: string;
  title: string;
  description: string;
}

interface FlashInfo {
  id: string;
  severity: "info" | "warning" | "danger" | "success";
  label: string;
  text: string;
}

interface FullSettings {
  siteName: string;
  headerTitle: string;
  // Hero
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCta1Label: string;
  heroCta2Label: string;
  // About
  aboutSectionLabel: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutCtaLabel: string;
  aboutImage1: string;
  aboutImage2: string;
  aboutPillars: Pillar[];
  // Contact
  address: string;
  contactPhone: string;
  contactEmail: string;
  // Social
  linkedinUrl: string;
  facebookUrl: string;
  // Flash Infos
  flashInfos: FlashInfo[];
}

import { FLASH_INFOS } from "../../data";

const EMPTY: FullSettings = {
  siteName: "Commission Technique du Désengagement",
  headerTitle: "République du Tchad — Présidence de la République",
  heroBadge: "",
  heroTitle: "",
  heroSubtitle: "",
  heroImage: "",
  heroCta1Label: "",
  heroCta2Label: "",
  aboutSectionLabel: "",
  aboutTitle: "",
  aboutDescription: "",
  aboutCtaLabel: "",
  aboutImage1: "",
  aboutImage2: "",
  aboutPillars: [],
  address: "",
  contactPhone: "",
  contactEmail: "",
  linkedinUrl: "",
  facebookUrl: "",
  flashInfos: FLASH_INFOS,
};

const SEVERITY_OPTIONS = [
  { value: "info",    label: "Info",     color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "success", label: "Succès",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "warning", label: "Attention",color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "danger",  label: "Urgent",   color: "bg-red-100 text-red-700 border-red-200" },
] as const;

// Sortable Flash Info item
const SortableFlashItem = ({
  item, index, onUpdate, onRemove,
}: {
  item: FlashInfo; index: number;
  onUpdate: (index: number, field: keyof FlashInfo, value: string) => void;
  onRemove: (index: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const sev = SEVERITY_OPTIONS.find(s => s.value === item.severity) || SEVERITY_OPTIONS[0];

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3 items-start bg-white border border-gray-200 rounded-xl p-3 group">
      <button {...attributes} {...listeners} className="cursor-grab mt-1 text-gray-300 hover:text-gray-500">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {SEVERITY_OPTIONS.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => onUpdate(index, "severity", s.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                item.severity === s.value ? s.color : "bg-gray-100 text-gray-400 border-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Input
          value={item.label}
          onChange={e => onUpdate(index, "label", e.target.value)}
          placeholder="Étiquette courte (ex: URGENT)"
          className="h-8 text-sm"
        />
        <Input
          value={item.text}
          onChange={e => onUpdate(index, "text", e.target.value)}
          placeholder="Message défilant affiché sur le portail…"
          className="h-8 text-sm"
        />
      </div>
      <button
        onClick={() => onRemove(index)}
        className="mt-1 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Tabs config ────────────────────────────────────────────────────────
const TABS = [
  { id: "hero",       label: "Page d'accueil",  icon: Layout },
  { id: "about",      label: "Qui sommes-nous", icon: Info },
  { id: "contact",    label: "Contact",         icon: Phone },
  { id: "social",     label: "Réseaux",         icon: LinkIcon },
  { id: "flashinfos",  label: "Flash Infos",    icon: Zap },
] as const;
type TabId = typeof TABS[number]["id"];

// ── Helper ─────────────────────────────────────────────────────────────
const Field = ({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700">{label}</Label>
    {children}
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

const ImgPreview = ({ url }: { url: string }) =>
  url ? (
    <div className="rounded-xl overflow-hidden border border-gray-100 mt-2 h-28">
      <img src={url} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
    </div>
  ) : null;

// ── FlashInfosPanel ────────────────────────────────────────────────────
const FlashInfosPanel = ({
  form, setForm, setDirty,
}: { form: FullSettings; setForm: React.Dispatch<React.SetStateAction<FullSettings>>; setDirty: (v: boolean) => void }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addFlash = () => {
    const newItem: FlashInfo = { id: crypto.randomUUID(), severity: "info", label: "INFO", text: "" };
    setForm(f => ({ ...f, flashInfos: [...f.flashInfos, newItem] }));
    setDirty(true);
  };

  const updateFlash = (index: number, field: keyof FlashInfo, value: string) => {
    const updated = [...form.flashInfos];
    updated[index] = { ...updated[index], [field]: value };
    setForm(f => ({ ...f, flashInfos: updated }));
    setDirty(true);
  };

  const removeFlash = (index: number) => {
    setForm(f => ({ ...f, flashInfos: f.flashInfos.filter((_, i) => i !== index) }));
    setDirty(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = form.flashInfos.findIndex(f => f.id === active.id);
      const newIndex = form.flashInfos.findIndex(f => f.id === over.id);
      setForm(f => ({ ...f, flashInfos: arrayMove(f.flashInfos, oldIndex, newIndex) }));
      setDirty(true);
    }
  };

  return (
    <>
      <div className="pb-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Flash Infos — Bande défilante</h2>
        <p className="text-sm text-gray-500 mt-0.5">Messages affichés dans la barre défilante en haut du portail. Glissez pour réordonner.</p>
      </div>

      {form.flashInfos.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Aucun message défilant configuré</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter" pour en créer un</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={form.flashInfos.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {form.flashInfos.map((item, idx) => (
              <SortableFlashItem
                key={item.id}
                item={item}
                index={idx}
                onUpdate={updateFlash}
                onRemove={removeFlash}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button type="button" onClick={addFlash} variant="outline" className="gap-2 h-9 rounded-xl w-full mt-2">
        <Plus className="w-3.5 h-3.5" /> Ajouter un message
      </Button>

      {form.flashInfos.length > 0 && (
        <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 px-3 py-2 bg-gray-50 border-b">Aperçu bande défilante</p>
          <div className="bg-[#0D1F35] px-4 py-2.5 flex gap-6 overflow-x-auto text-sm text-white">
            {form.flashInfos.map((fi) => {
              const colors: Record<string, string> = { info: "text-blue-300", success: "text-emerald-300", warning: "text-amber-300", danger: "text-red-300" };
              return (
                <span key={fi.id} className="flex items-center gap-2 shrink-0">
                  <span className={`font-bold text-xs ${colors[fi.severity]}`}>[{fi.label}]</span>
                  <span className="text-white/80 text-xs">{fi.text || "(texte vide)"}</span>
                  <span className="text-white/20">·</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

// ── Component ──────────────────────────────────────────────────────────
const AdminParametres = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>("hero");
  const [form, setForm] = useState<FullSettings>(EMPTY);
  const [dirty, setDirty] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("/settings").then(r => r.data),
  });

  useEffect(() => {
    if (!settings) return;
    
    let parsedPillars: Pillar[] = [];
    if (settings.aboutPillars) {
      try {
        parsedPillars = typeof settings.aboutPillars === "string" ? JSON.parse(settings.aboutPillars) : settings.aboutPillars;
      } catch (e) {
        console.error("Error parsing pillars", e);
      }
    }

    setForm({
      siteName:         settings.siteName         ?? EMPTY.siteName,
      headerTitle:      settings.headerTitle       ?? EMPTY.headerTitle,
      heroBadge:        settings.heroBadge         ?? "",
      heroTitle:        settings.heroTitle         ?? "",
      heroSubtitle:     settings.heroSubtitle      ?? "",
      heroImage:        settings.heroImage         ?? "",
      heroCta1Label:    settings.heroCta1Label     ?? "",
      heroCta2Label:    settings.heroCta2Label     ?? "",
      aboutSectionLabel:settings.aboutSectionLabel ?? "",
      aboutTitle:       settings.aboutTitle        ?? "",
      aboutDescription: settings.aboutDescription  ?? "",
      aboutCtaLabel:    settings.aboutCtaLabel     ?? "",
      aboutImage1:      settings.aboutImage1       ?? "",
      aboutImage2:      settings.aboutImage2       ?? "",
      aboutPillars:     parsedPillars,
      address:          settings.address           ?? "",
      contactPhone:     settings.contactPhone      ?? "",
      contactEmail:     settings.contactEmail      ?? "",
      linkedinUrl:      settings.linkedinUrl       ?? "",
      facebookUrl:      settings.facebookUrl       ?? "",
      flashInfos:       (() => {
        try {
          const fi = settings.flashInfos;
          if (!fi) return FLASH_INFOS;
          const parsed = typeof fi === "string" ? JSON.parse(fi) : fi;
          return parsed.length > 0 ? parsed : FLASH_INFOS;
        } catch { return FLASH_INFOS; }
      })(),
    });
    setDirty(false);
  }, [settings]);

  const set = (field: keyof FullSettings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setDirty(true);
    };

  const uploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Fichier trop lourd", description: "Max 10 Mo.", variant: "destructive" });
      return;
    }
    const fd = new FormData();
    fd.append("image", file);
    setUploadingHero(true);
    try {
      const res = await api.post("/settings/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm(f => ({ ...f, heroImage: res.data.url }));
      setDirty(true);
      toast({ title: "Image chargée" });
    } catch {
      toast({ title: "Erreur d'upload", variant: "destructive" });
    } finally {
      setUploadingHero(false);
      if (heroFileRef.current) heroFileRef.current.value = "";
    }
  };

  const updatePillar = (index: number, field: keyof Pillar, value: string) => {
    const newPillars = [...form.aboutPillars];
    newPillars[index] = { ...newPillars[index], [field]: value };
    setForm(f => ({ ...f, aboutPillars: newPillars }));
    setDirty(true);
  };

  const removePillar = (index: number) => {
    const newPillars = form.aboutPillars.filter((_, i) => i !== index);
    setForm(f => ({ ...f, aboutPillars: newPillars }));
    setDirty(true);
  };

  const addPillar = () => {
    setForm(f => ({
      ...f,
      aboutPillars: [...f.aboutPillars, { icon: "Star", title: "Nouveau pilier", description: "Description..." }]
    }));
    setDirty(true);
  };

  const updateMutation = useMutation({
    mutationFn: (data: FullSettings) => {
      const payload = {
        ...data,
        aboutPillars: JSON.stringify(data.aboutPillars),
        flashInfos:   JSON.stringify(data.flashInfos),
      };
      return api.put("/settings", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings-public"] });
      toast({ title: "Paramètres enregistrés", description: "Les modifications sont visibles en ligne." });
      setDirty(false);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'enregistrer les paramètres.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2540]/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 flex-1 flex flex-col">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres du site</h1>
          <p className="text-gray-500 text-sm mt-1">
            Personnalisez tous les contenus éditables du portail CTD
          </p>
        </div>
        {dirty && (
          <Button
            onClick={() => updateMutation.mutate(form)}
            disabled={updateMutation.isPending}
            className="shrink-0 gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl h-10 shadow-sm"
          >
            {updateMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />}
            Enregistrer
          </Button>
        )}
      </div>

      {/* Layout: sidebar nav + panel */}
      <div className="flex gap-4 items-start">

        {/* Vertical sidebar nav */}
        <div className="shrink-0 w-52 flex flex-col gap-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-2.5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                tab === t.id
                  ? "bg-[#0D1F35] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <t.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>

      {/* Panel */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
        <div className="p-6 md:p-8 space-y-6">

          {/* ── HERO & IDENTITÉ ─────────────────────────────────── */}
          {tab === "hero" && (
            <>
              <div className="pb-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Identité & Page d'accueil</h2>
                <p className="text-sm text-gray-500 mt-0.5">Configuration du bandeau, du nom officiel et de la bannière d'accueil.</p>
              </div>
              <Field
                label="Bandeau institutionnel (barre du haut)"
                hint="Texte dans la fine barre bleue au-dessus du menu."
              >
                <Input value={form.headerTitle} onChange={set("headerTitle")} placeholder="République du Tchad — Présidence de la République" className="h-11" />
              </Field>
              <Field
                label="Nom officiel du portail"
                hint="Utilisé dans le pied de page et les balises meta (titre navigateur)."
              >
                <Input value={form.siteName} onChange={set("siteName")} placeholder="Commission Technique du Désengagement" className="h-11" />
              </Field>
              
              <div className="mt-8 pb-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Section héro</h3>
              </div>
              <Field label="Badge / Étiquette">
                <Input value={form.heroBadge} onChange={set("heroBadge")} placeholder="Ex : Portail officiel de la CTD" className="h-11" />
              </Field>
              <Field label="Titre principal">
                <Input value={form.heroTitle} onChange={set("heroTitle")} placeholder="Ex : Investir au Tchad" className="h-11" />
              </Field>
              <Field label="Sous-titre / Description">
                <Textarea value={form.heroSubtitle} onChange={set("heroSubtitle")} rows={3} placeholder="Texte de présentation sous le titre…" className="resize-none" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Bouton principal (CTA 1)">
                  <Input value={form.heroCta1Label} onChange={set("heroCta1Label")} placeholder="Découvrir la commission" className="h-11" />
                </Field>
                <Field label="Bouton secondaire (CTA 2)">
                  <Input value={form.heroCta2Label} onChange={set("heroCta2Label")} placeholder="Devenir investisseur" className="h-11" />
                </Field>
              </div>
              <Field label="Image de fond de la bannière">
                <div className="flex flex-col gap-3">
                  {form.heroImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-100 h-28">
                      <img
                        src={form.heroImage.startsWith('http') ? form.heroImage : `${api.defaults.baseURL?.replace('/api','')}${form.heroImage}`}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => { setForm(f => ({ ...f, heroImage: "" })); setDirty(true); }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                      >
                        <ImageIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl h-28 flex flex-col items-center justify-center gap-2 bg-gray-50">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                      <p className="text-xs text-gray-400">Aucune image sélectionnée</p>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 h-10 rounded-xl self-start"
                    onClick={() => heroFileRef.current?.click()}
                    disabled={uploadingHero}
                  >
                    {uploadingHero ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingHero ? "Téléchargement..." : "Choisir depuis l'appareil"}
                  </Button>
                  <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={uploadHeroImage} />
                </div>
              </Field>
            </>
          )}

          {/* ── À PROPOS ─────────────────────────────── */}
          {tab === "about" && (
            <>
              <div className="pb-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Section "Qui sommes-nous"</h2>
                <p className="text-sm text-gray-500 mt-0.5">Section de présentation et piliers (icônes) sur la page d'accueil.</p>
              </div>
              <Field label="Surtitre (Label de section)" hint="Petit texte doré au-dessus du titre principal.">
                <Input value={form.aboutSectionLabel} onChange={set("aboutSectionLabel")} placeholder="Qui sommes-nous ?" className="h-11" />
              </Field>
              <Field label="Titre de la section">
                <Input value={form.aboutTitle} onChange={set("aboutTitle")} placeholder="La Commission Technique du Désengagement" className="h-11" />
              </Field>
              <Field label="Texte de description">
                <Textarea value={form.aboutDescription} onChange={set("aboutDescription")} rows={5} placeholder="Paragraphe de présentation de la CTD…" className="resize-none leading-relaxed" />
              </Field>
              <Field label="Libellé du bouton (CTA)" hint="Texte du bouton affiché sous la description (ex : Découvrir la CTD).">
                <Input value={form.aboutCtaLabel} onChange={set("aboutCtaLabel")} placeholder="Découvrir la CTD" className="h-11" />
              </Field>

              {/* Pilars Manager */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-gray-900">Éléments de droite (Piliers / Icônes)</Label>
                  <Button type="button" onClick={addPillar} variant="outline" size="sm" className="gap-1 h-8">
                    <Plus className="w-3.5 h-3.5" /> Ajouter
                  </Button>
                </div>
                
                {form.aboutPillars.map((pillar, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Titre</Label>
                        <Input value={pillar.title} onChange={e => updatePillar(idx, "title", e.target.value)} className="h-9 bg-white" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Icône</Label>
                        <IconPicker 
                          value={pillar.icon} 
                          onChange={(val) => updatePillar(idx, "icon", val)} 
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Description</Label>
                        <Textarea value={pillar.description} onChange={e => updatePillar(idx, "description", e.target.value)} className="resize-none h-16 bg-white text-sm" />
                      </div>
                    </div>
                    <button 
                      onClick={() => removePillar(idx)}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── CONTACT ──────────────────────────────── */}
          {tab === "contact" && (
            <>
              <div className="pb-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Coordonnées de l'institution</h2>
                <p className="text-sm text-gray-500 mt-0.5">Apparaissent dans le pied de page et la page Contact.</p>
              </div>
              <Field label="Adresse du siège">
                <Textarea value={form.address} onChange={set("address")} rows={3} placeholder="Avenue Charles de Gaulle, BP 456, N'Djamena, Tchad" className="resize-none" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Téléphone">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <Input value={form.contactPhone} onChange={set("contactPhone")} placeholder="+235 22 XX XX XX" className="h-11 pl-10" />
                  </div>
                </Field>
                <Field label="Email officiel">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <Input value={form.contactEmail} onChange={set("contactEmail")} placeholder="contact@ctd.td" className="h-11 pl-10" />
                  </div>
                </Field>
              </div>
            </>
          )}

          {/* ── RÉSEAUX ──────────────────────────────── */}
          {tab === "social" && (
            <>
              <div className="pb-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Réseaux sociaux officiels</h2>
                <p className="text-sm text-gray-500 mt-0.5">Liens affichés dans le pied de page.</p>
              </div>
              <Field label="Lien LinkedIn">
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <Input value={form.linkedinUrl} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/company/ctd-tchad" className="h-11 pl-10" />
                </div>
              </Field>
              <Field label="Lien Facebook">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <Input value={form.facebookUrl} onChange={set("facebookUrl")} placeholder="https://facebook.com/ctdtchad" className="h-11 pl-10" />
                </div>
              </Field>
            </>
          )}

          {/* ── FLASH INFOS ──────────────────────────────────────────── */}
          {tab === "flashinfos" && (
            <FlashInfosPanel form={form} setForm={setForm} setDirty={setDirty} />
          )}

        </div>

        {/* Footer save */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 border-t bg-gray-50/50">
          <p className="text-xs text-gray-400">
            {dirty
              ? "Modifications non enregistrées"
              : "Tout est à jour"}
          </p>
          <Button
            onClick={() => updateMutation.mutate(form)}
            disabled={updateMutation.isPending || !dirty}
            className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl h-10 px-8 shadow-sm disabled:opacity-40"
          >
            {updateMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />}
            Enregistrer les modifications
          </Button>
        </div>
      </div>

      </div> {/* end layout flex */}
    </div>
  );
};

export default AdminParametres;
