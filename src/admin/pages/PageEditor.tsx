import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@admin/lib/api";
import { useToast } from "@admin/hooks/use-toast";
import { Button, Input, Label, Textarea } from "@admin/components/ui";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { RichEditor } from "@admin/components/admin/RichEditor";

export default function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sectionsData, setSectionsData] = useState<any>(null);

  const { data: page, isLoading } = useQuery({
    queryKey: ["page-content", id],
    queryFn: async () => {
      const res = await api.get(`/page-content/${id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (page?.sections) {
      setSectionsData(JSON.parse(JSON.stringify(page.sections)));
    }
  }, [page]);

  const mutation = useMutation({
    mutationFn: async (updatedSections: any) => {
      return api.put(`/page-content/${id}`, { title: page.title, sections: updatedSections });
    },
    onSuccess: () => {
      toast({ title: "Page mise à jour", description: "Le contenu a été sauvegardé avec succès." });
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de sauvegarder la page.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (sectionsData) mutation.mutate(sectionsData);
  };

  if (isLoading || !sectionsData) return <div className="tw-p-8 tw-text-center">Chargement...</div>;

  // Rendu récursif simple pour l'éditeur
  const renderField = (key: string, value: any, path: string[]) => {
    const handleChange = (newVal: any) => {
      const newData = { ...sectionsData };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) current = current[path[i]];
      current[path[path.length - 1]] = newVal;
      setSectionsData(newData);
    };

    if (typeof value === "string") {
      if (key === "content" || key === "message" || value.startsWith("<p>")) {
        return (
          <div key={path.join(".")} className="tw-mb-6">
            <Label className="tw-mb-2 tw-block tw-capitalize">{key}</Label>
            <RichEditor value={value} onChange={handleChange} />
          </div>
        );
      }
      if (value.length > 80 || key === "desc" || key === "subtitle") {
        return (
          <div key={path.join(".")} className="tw-mb-4">
            <Label className="tw-mb-2 tw-block tw-capitalize">{key}</Label>
            <Textarea value={value} onChange={(e) => handleChange(e.target.value)} />
          </div>
        );
      }
      return (
        <div key={path.join(".")} className="tw-mb-4">
          <Label className="tw-mb-2 tw-block tw-capitalize">{key}</Label>
          <Input value={value} onChange={(e) => handleChange(e.target.value)} />
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={path.join(".")} className="tw-mb-8 tw-p-4 tw-border tw-border-gray-200 tw-rounded-xl tw-bg-gray-50/50">
          <Label className="tw-mb-4 tw-block tw-text-lg tw-font-semibold tw-capitalize">{key} (Liste)</Label>
          {value.map((item, index) => (
            <div key={index} className="tw-mb-4 tw-p-4 tw-bg-white tw-border tw-border-gray-100 tw-rounded-lg tw-relative tw-shadow-sm">
              <button
                onClick={() => {
                  const newArr = [...value];
                  newArr.splice(index, 1);
                  handleChange(newArr);
                }}
                className="tw-absolute tw-top-4 tw-right-4 tw-text-red-500 hover:tw-bg-red-50 tw-p-1.5 tw-rounded-md"
              >
                <Trash2 size={16} />
              </button>
              {Object.keys(item).map((itemKey) => (
                <div key={itemKey} className="tw-mb-3">
                  <Label className="tw-mb-1 tw-block tw-text-xs tw-text-gray-500 tw-capitalize">{itemKey}</Label>
                  {typeof item[itemKey] === "string" && (itemKey === "desc" || item[itemKey].length > 50) ? (
                    <Textarea
                      value={item[itemKey]}
                      onChange={(e) => {
                        const newArr = [...value];
                        newArr[index] = { ...newArr[index], [itemKey]: e.target.value };
                        handleChange(newArr);
                      }}
                    />
                  ) : (
                    <Input
                      value={item[itemKey]}
                      onChange={(e) => {
                        const newArr = [...value];
                        newArr[index] = { ...newArr[index], [itemKey]: e.target.value };
                        handleChange(newArr);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const template = value.length > 0 ? Object.keys(value[0]).reduce((acc, k) => ({ ...acc, [k]: "" }), {}) : { title: "", desc: "" };
              handleChange([...value, template]);
            }}
            className="tw-mt-2"
          >
            <Plus size={16} className="tw-mr-2" /> Ajouter un élément
          </Button>
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div key={path.join(".")} className="tw-mb-8">
          <h3 className="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-capitalize tw-pb-2 tw-border-b tw-border-gray-100">{key}</h3>
          <div className="tw-pl-4 tw-border-l-2 tw-border-gray-100 tw-space-y-4">
            {Object.keys(value).map((subKey) => renderField(subKey, value[subKey], [...path, subKey]))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="tw-max-w-4xl tw-mx-auto tw-pb-24">
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-8">
        <div className="tw-flex tw-items-center tw-gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/pages")} className="tw-text-gray-500 tw-p-2 tw-h-auto">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900">Éditer: {page.title}</h1>
            <p className="tw-text-sm tw-text-gray-500">ID: {page.id}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={mutation.isPending} className="tw-bg-[#0D1F35] hover:tw-bg-[#0D1F35]/90">
          <Save size={18} className="tw-mr-2" />
          {mutation.isPending ? "Sauvegarde..." : "Enregistrer les modifications"}
        </Button>
      </div>

      <div className="tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-p-8 tw-shadow-sm">
        {Object.keys(sectionsData).map((key) => renderField(key, sectionsData[key], [key]))}
      </div>
    </div>
  );
}
