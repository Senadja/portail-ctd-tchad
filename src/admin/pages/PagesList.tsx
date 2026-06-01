import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@admin/lib/api";
import { Link } from "react-router-dom";
import { Edit2, LayoutTemplate } from "lucide-react";
import { Badge } from "@admin/components/ui";

interface PageContent {
  id: string;
  title: string;
  updatedAt: string;
}

export default function PagesList() {
  const { data: pages = [], isLoading } = useQuery<PageContent[]>({
    queryKey: ["pages-content"],
    queryFn: async () => {
      const res = await api.get("/page-content");
      return res.data;
    },
  });

  return (
    <div className="tw-space-y-6 flex-1 flex flex-col">
      <div className="tw-flex tw-items-center tw-justify-between">
        <div>
          <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900">Pages du site</h1>
          <p className="tw-text-gray-500 tw-mt-1">
            Modifiez le contenu textuel et les sections des pages publiques.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="tw-py-12 tw-text-center tw-text-gray-500 tw-flex-1 tw-flex tw-flex-col tw-items-center tw-justify-center">Chargement des pages...</div>
      ) : (
        <div className="tw-bg-white tw-rounded-xl tw-border tw-border-gray-200 tw-overflow-hidden tw-flex-1 tw-flex tw-flex-col">
          <table className="tw-w-full tw-text-left tw-text-sm">
            <thead className="tw-bg-gray-50 tw-border-b tw-border-gray-200">
              <tr>
                <th className="tw-px-6 tw-py-3 tw-font-semibold tw-text-gray-900">Titre de la page</th>
                <th className="tw-px-6 tw-py-3 tw-font-semibold tw-text-gray-900">ID / Chemin</th>
                <th className="tw-px-6 tw-py-3 tw-font-semibold tw-text-gray-900">Dernière modification</th>
                <th className="tw-px-6 tw-py-3 tw-font-semibold tw-text-gray-900 tw-text-right">Action</th>
              </tr>
            </thead>
            <tbody className="tw-divide-y tw-divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:tw-bg-gray-50/50 tw-transition-colors">
                  <td className="tw-px-6 tw-py-4">
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <div className="tw-p-2 tw-bg-blue-50 tw-text-blue-600 tw-rounded-lg">
                        <LayoutTemplate size={18} />
                      </div>
                      <span className="tw-font-medium tw-text-gray-900">{page.title}</span>
                    </div>
                  </td>
                  <td className="tw-px-6 tw-py-4">
                    <Badge className="tw-bg-gray-100 tw-text-gray-600 hover:tw-bg-gray-200">
                      /{page.id}
                    </Badge>
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-text-gray-500">
                    {new Date(page.updatedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-text-right">
                    <Link
                      to={`/admin/pages/${page.id}`}
                      className="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-blue-600 tw-bg-blue-50 tw-rounded-lg hover:tw-bg-blue-100 tw-transition-colors"
                    >
                      <Edit2 size={16} />
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
