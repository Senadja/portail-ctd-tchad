import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@admin/lib/api";
import { Button } from "@admin/components/ui/button";
import { Input } from "@admin/components/ui/input";
import { Label } from "@admin/components/ui/label";
import { Plus, Edit2, Trash2, FolderTree, ArrowRight, Loader2, Save } from "lucide-react";
import { useToast } from "@admin/hooks/use-toast";
import { ConfirmDialog } from "@admin/components/admin/ConfirmDialog";
import { ErrorState } from "@admin/components/admin/ErrorState";

interface Organisme {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  order: number;
  children?: Organisme[];
}

const OrganigrammeAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", parentId: "", order: 0 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Organisme | null>(null);

  const { data: tree = [], isLoading, isError, refetch } = useQuery<Organisme[]>({
    queryKey: ["organismes-tree"],
    queryFn: () => api.get("/organismes/tree").then(res => res.data),
  });

  const { data: flatList = [] } = useQuery<Organisme[]>({
    queryKey: ["organismes-flat"],
    queryFn: () => api.get("/organismes").then(res => res.data),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        return api.put(`/organismes/${editingId}`, data);
      }
      return api.post("/organismes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organismes-tree"] });
      queryClient.invalidateQueries({ queryKey: ["organismes-flat"] });
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ name: "", description: "", parentId: "", order: 0 });
      toast({ title: "Organisme enregistré" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "L'enregistrement de l'organisme a échoué.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/organismes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organismes-tree"] });
      queryClient.invalidateQueries({ queryKey: ["organismes-flat"] });
      setDeleteTarget(null);
      toast({ title: "Organisme supprimé" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "La suppression de l'organisme a échoué.", variant: "destructive" });
    },
  });

  const handleEdit = (org: Organisme) => {
    setEditingId(org.id);
    setFormData({
      name: org.name,
      description: org.description || "",
      parentId: org.parentId || "",
      order: org.order || 0,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (org: Organisme) => {
    setDeleteTarget(org);
  };

  const renderTree = (nodes: Organisme[], depth = 0) => {
    return (
      <div className="space-y-3">
        {nodes.map(node => (
          <div key={node.id} className="relative">
            <div 
              className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
              style={{ marginLeft: `${depth * 2.5}rem` }}
            >
              {depth > 0 && (
                <div className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 w-6 border-t-2 border-gray-200 border-dashed" />
              )}
              {depth > 0 && (
                <div className="absolute left-[-1.5rem] top-[-1rem] bottom-1/2 border-l-2 border-gray-200 border-dashed" />
              )}

              <div className="w-10 h-10 rounded-lg bg-[#0D1F35] flex items-center justify-center text-[#FECB00] shrink-0">
                <FolderTree className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">{node.name}</h3>
                {node.description && (
                  <p className="text-sm text-gray-500 truncate">{node.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(node)}
                  className="h-8 px-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-2" />
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(node)}
                  className="h-8 px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
            
            {node.children && node.children.length > 0 && (
              <div className="mt-3 relative">
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-8 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organigramme</h1>
          <p className="text-gray-500 text-base mt-2">Gérez la structure hiérarchique de la CTD.</p>
        </div>
        <Button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "", parentId: "", order: 0 });
            setIsFormOpen(!isFormOpen);
          }}
          className="gap-2 bg-[#0D1F35] hover:bg-[#0D1F35]/90 rounded-xl h-12 px-6 text-base shadow-sm"
        >
          {isFormOpen ? "Fermer le formulaire" : <><Plus className="w-5 h-5" /> Ajouter un organisme</>}
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingId ? "Modifier l'organisme" : "Nouvel organisme"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'organisme</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Secrétariat Général"
                className="h-12 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parentId">Rattaché à (Parent)</Label>
              <select
                id="parentId"
                value={formData.parentId}
                onChange={e => setFormData({...formData, parentId: e.target.value})}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- Aucun (Racine) --</option>
                {flatList.filter(o => o.id !== editingId).map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (Optionnel)</Label>
              <Input 
                id="description" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Rôle ou courte description"
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              onClick={() => saveMutation.mutate(formData)}
              disabled={saveMutation.isPending || !formData.name}
              className="gap-2 bg-[#FECB00] text-[#0A2540] hover:bg-[#F2C200] rounded-xl h-12 px-8 text-base font-bold shadow-sm"
            >
              {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {editingId ? "Enregistrer les modifications" : "Créer l'organisme"}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
        {tree.length > 0 ? (
          renderTree(tree)
        ) : (
          <div className="text-center py-12 text-gray-400">
            <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-500">L'organigramme est vide</p>
            <p className="text-sm mt-1">Commencez par ajouter l'organisme racine.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Supprimer cet organisme ?"
        description="Les sous-organismes seront rattachés à la racine."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
        loading={deleteMutation.isPending}
        danger
      />
    </div>
  );
};

export default OrganigrammeAdmin;
