import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@admin/lib/api";
import { Button } from "@admin/components/ui/button";
import { Input } from "@admin/components/ui/input";
import { Textarea } from "@admin/components/ui/textarea";
import { Label } from "@admin/components/ui/label";
import { useToast } from "@admin/hooks/use-toast";
import {
  Save, Loader2, Plus, Trash2, GripVertical,
  Users, BarChart3, Briefcase, Target, Globe
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ErrorState } from "@admin/components/admin/ErrorState";
import { PARTNERS, PROJECTS, KEY_FIGURES, MISSIONS_CTD, SERVICES } from "../../data";

// ── Types ──────────────────────────────────────────────────────────────
interface Partner { id: string; name: string; short: string; url: string; color: string; mark: string; }
interface Project { id: string; title: string; status: string; statusLabel: string; period: string; partner: string; progress: number; sector: string; desc: string; }
interface KeyFigure { id: string; num: string; sup: string; label: string; }
interface Mission { id: string; n: string; title: string; desc: string; }
interface Service { id: string; n: string; title: string; desc: string; }

// --- Helpers pour l'ajout d'ID sur les données par défaut ---
const withIds = (arr: any[]) => arr.map((item) => ({ ...item, id: crypto.randomUUID() }));

// ── Sortable Item Helper ─────────────────────────────────────────────
const SortableItemWrapper = ({ id, children, onRemove }: { id: string, children: React.ReactNode, onRemove: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3 items-start bg-white border border-gray-200 rounded-xl p-4 group relative">
      <button {...attributes} {...listeners} className="cursor-grab mt-2 text-gray-300 hover:text-gray-500">
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 space-y-3">
        {children}
      </div>
      <button
        onClick={onRemove}
        className="mt-1 p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Tabs config ────────────────────────────────────────────────────────
const TABS = [
  { id: "partners",   label: "Partenaires",   icon: Users },
  { id: "projects",   label: "Projets",       icon: Briefcase },
  { id: "keyFigures", label: "Chiffres Clés", icon: BarChart3 },
  { id: "missions",   label: "Missions CTD",  icon: Target },
  { id: "services",   label: "Services Web",  icon: Globe },
] as const;
type TabId = typeof TABS[number]["id"];

// ── Component ──────────────────────────────────────────────────────────
const ContentBlocks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>("partners");
  const [dirty, setDirty] = useState(false);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [keyFigures, setKeyFigures] = useState<KeyFigure[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: settings, isLoading, isError, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("/settings").then(r => r.data),
  });

  useEffect(() => {
    if (!settings) return;
    const parse = (jsonStr: any, fallback: any[]) => {
      try {
        const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : withIds(fallback);
      } catch { return withIds(fallback); }
    };

    setPartners(parse(settings.partners, PARTNERS));
    setProjects(parse(settings.projects, PROJECTS));
    setKeyFigures(parse(settings.keyFigures, KEY_FIGURES));
    setMissions(parse(settings.missions, MISSIONS_CTD));
    setServices(parse(settings.services, SERVICES));
    setDirty(false);
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: () => {
      return api.put("/settings", {
        partners, projects, keyFigures, missions, services
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: "Contenus enregistrés", description: "Les données du site ont été mises à jour." });
      setDirty(false);
    },
    onError: () => {
      toast({ title: "Erreur", description: "L'enregistrement a échoué.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;
  }

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  // --- Handlers de Drag & Drop ---
  const handleDragEnd = (event: DragEndEvent, list: any[], setList: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = list.findIndex(f => f.id === active.id);
      const newIndex = list.findIndex(f => f.id === over.id);
      setList(arrayMove(list, oldIndex, newIndex));
      setDirty(true);
    }
  };

  return (
    <div className="space-y-6 pb-12 flex-1 flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blocs de contenu</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les listes, partenaires et données chiffrées du site</p>
        </div>
        {dirty && (
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="shrink-0 gap-2 bg-[#0D1F35]">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </Button>
        )}
      </div>

      <div className="flex gap-4 items-start">
        <div className="shrink-0 w-52 flex flex-col gap-1 bg-white rounded-2xl border border-gray-200 p-2.5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                tab === t.id ? "bg-[#0D1F35] text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <t.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 min-w-0">
          
          {/* ── PARTENAIRES ── */}
          {tab === "partners" && (
            <>
              <h2 className="font-semibold text-lg text-gray-900 mb-4">Partenaires Institutionnels & Financiers</h2>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, partners, setPartners)}>
                <SortableContext items={partners.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {partners.map((p, i) => (
                      <SortableItemWrapper key={p.id} id={p.id} onRemove={() => { setPartners(partners.filter((_, idx) => idx !== i)); setDirty(true); }}>
                        <div className="grid grid-cols-2 gap-3">
                          <Input value={p.name} onChange={e => { const n = [...partners]; n[i].name = e.target.value; setPartners(n); setDirty(true); }} placeholder="Nom complet" />
                          <Input value={p.short} onChange={e => { const n = [...partners]; n[i].short = e.target.value; setPartners(n); setDirty(true); }} placeholder="Sigle (ex: BM)" />
                          <Input value={p.url} onChange={e => { const n = [...partners]; n[i].url = e.target.value; setPartners(n); setDirty(true); }} placeholder="Lien URL du site web" />
                          <Input value={p.color} onChange={e => { const n = [...partners]; n[i].color = e.target.value; setPartners(n); setDirty(true); }} placeholder="Couleur HEX (ex: #0E2A5E)" type="color" className="h-10 px-1" />
                        </div>
                      </SortableItemWrapper>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button onClick={() => { setPartners([...partners, { id: crypto.randomUUID(), name: "", short: "", url: "", color: "#000000", mark: "circle" }]); setDirty(true); }} variant="outline" className="w-full mt-3">
                <Plus className="w-4 h-4 mr-2" /> Ajouter un partenaire
              </Button>
            </>
          )}

          {/* ── PROJETS ── */}
          {tab === "projects" && (
            <>
              <h2 className="font-semibold text-lg text-gray-900 mb-4">Portefeuille de projets</h2>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, projects, setProjects)}>
                <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {projects.map((p, i) => (
                      <SortableItemWrapper key={p.id} id={p.id} onRemove={() => { setProjects(projects.filter((_, idx) => idx !== i)); setDirty(true); }}>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <Input value={p.title} onChange={e => { const n = [...projects]; n[i].title = e.target.value; setProjects(n); setDirty(true); }} placeholder="Titre du projet" className="col-span-2 font-semibold" />
                          <Input value={p.sector} onChange={e => { const n = [...projects]; n[i].sector = e.target.value; setProjects(n); setDirty(true); }} placeholder="Secteur (ex: Télécommunications)" />
                          <Input value={p.period} onChange={e => { const n = [...projects]; n[i].period = e.target.value; setProjects(n); setDirty(true); }} placeholder="Période (ex: 2025 - 2027)" />
                          <div className="flex gap-2">
                            <Input value={p.statusLabel} onChange={e => { const n = [...projects]; n[i].statusLabel = e.target.value; setProjects(n); setDirty(true); }} placeholder="Statut affiché (ex: En cours)" className="flex-1" />
                            <select className="border border-gray-200 rounded-lg px-2 text-sm" value={p.status} onChange={e => { const n = [...projects]; n[i].status = e.target.value; setProjects(n); setDirty(true); }}>
                              <option value="ongoing">ongoing</option><option value="completed">completed</option><option value="planned">planned</option>
                            </select>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Label className="text-xs text-gray-500 whitespace-nowrap">Progression (%)</Label>
                            <Input type="number" min="0" max="100" value={p.progress} onChange={e => { const n = [...projects]; n[i].progress = Number(e.target.value); setProjects(n); setDirty(true); }} className="w-20" />
                          </div>
                        </div>
                        <Textarea rows={2} value={p.desc} onChange={e => { const n = [...projects]; n[i].desc = e.target.value; setProjects(n); setDirty(true); }} placeholder="Description..." className="resize-none" />
                      </SortableItemWrapper>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button onClick={() => { setProjects([...projects, { id: crypto.randomUUID(), title: "", status: "planned", statusLabel: "Programmé", period: "", partner: "", progress: 0, sector: "", desc: "" }]); setDirty(true); }} variant="outline" className="w-full mt-3">
                <Plus className="w-4 h-4 mr-2" /> Ajouter un projet
              </Button>
            </>
          )}

          {/* ── CHIFFRES CLES ── */}
          {tab === "keyFigures" && (
            <>
              <h2 className="font-semibold text-lg text-gray-900 mb-4">Chiffres-clés CTD</h2>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, keyFigures, setKeyFigures)}>
                <SortableContext items={keyFigures.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {keyFigures.map((p, i) => (
                      <SortableItemWrapper key={p.id} id={p.id} onRemove={() => { setKeyFigures(keyFigures.filter((_, idx) => idx !== i)); setDirty(true); }}>
                        <div className="flex gap-3 items-center">
                          <Input value={p.num} onChange={e => { const n = [...keyFigures]; n[i].num = e.target.value; setKeyFigures(n); setDirty(true); }} placeholder="Nombre (ex: 6)" className="w-24 font-mono font-bold text-lg" />
                          <Input value={p.sup} onChange={e => { const n = [...keyFigures]; n[i].sup = e.target.value; setKeyFigures(n); setDirty(true); }} placeholder="Suffixe (ex: M$)" className="w-24 font-mono text-gray-500" />
                          <Input value={p.label} onChange={e => { const n = [...keyFigures]; n[i].label = e.target.value; setKeyFigures(n); setDirty(true); }} placeholder="Libellé (ex: Opérations en cours)" className="flex-1" />
                        </div>
                      </SortableItemWrapper>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button onClick={() => { setKeyFigures([...keyFigures, { id: crypto.randomUUID(), num: "0", sup: "", label: "" }]); setDirty(true); }} variant="outline" className="w-full mt-3">
                <Plus className="w-4 h-4 mr-2" /> Ajouter un chiffre-clé
              </Button>
            </>
          )}

          {/* ── MISSIONS ── */}
          {tab === "missions" && (
            <>
              <h2 className="font-semibold text-lg text-gray-900 mb-4">Missions de la CTD</h2>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, missions, setMissions)}>
                <SortableContext items={missions.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {missions.map((p, i) => (
                      <SortableItemWrapper key={p.id} id={p.id} onRemove={() => { setMissions(missions.filter((_, idx) => idx !== i)); setDirty(true); }}>
                        <div className="flex gap-3 mb-2">
                          <Input value={p.n} onChange={e => { const n = [...missions]; n[i].n = e.target.value; setMissions(n); setDirty(true); }} placeholder="01" className="w-16 font-mono font-bold text-gray-400" />
                          <Input value={p.title} onChange={e => { const n = [...missions]; n[i].title = e.target.value; setMissions(n); setDirty(true); }} placeholder="Titre de la mission" className="flex-1 font-semibold" />
                        </div>
                        <Textarea rows={2} value={p.desc} onChange={e => { const n = [...missions]; n[i].desc = e.target.value; setMissions(n); setDirty(true); }} placeholder="Description..." className="resize-none" />
                      </SortableItemWrapper>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button onClick={() => { setMissions([...missions, { id: crypto.randomUUID(), n: "", title: "", desc: "" }]); setDirty(true); }} variant="outline" className="w-full mt-3">
                <Plus className="w-4 h-4 mr-2" /> Ajouter une mission
              </Button>
            </>
          )}

          {/* ── SERVICES ── */}
          {tab === "services" && (
            <>
              <h2 className="font-semibold text-lg text-gray-900 mb-4">Services en ligne</h2>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, services, setServices)}>
                <SortableContext items={services.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {services.map((p, i) => (
                      <SortableItemWrapper key={p.id} id={p.id} onRemove={() => { setServices(services.filter((_, idx) => idx !== i)); setDirty(true); }}>
                        <div className="flex gap-3 mb-2">
                          <Input value={p.n} onChange={e => { const n = [...services]; n[i].n = e.target.value; setServices(n); setDirty(true); }} placeholder="01" className="w-16 font-mono font-bold text-gray-400" />
                          <Input value={p.title} onChange={e => { const n = [...services]; n[i].title = e.target.value; setServices(n); setDirty(true); }} placeholder="Titre du service" className="flex-1 font-semibold" />
                        </div>
                        <Textarea rows={2} value={p.desc} onChange={e => { const n = [...services]; n[i].desc = e.target.value; setServices(n); setDirty(true); }} placeholder="Description..." className="resize-none" />
                      </SortableItemWrapper>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button onClick={() => { setServices([...services, { id: crypto.randomUUID(), n: "", title: "", desc: "" }]); setDirty(true); }} variant="outline" className="w-full mt-3">
                <Plus className="w-4 h-4 mr-2" /> Ajouter un service
              </Button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ContentBlocks;
