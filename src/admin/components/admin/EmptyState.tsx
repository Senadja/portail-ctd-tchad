import { ReactNode } from "react";
import { Inbox } from "lucide-react";

/**
 * État vide générique (aucune donnée, ou aucun résultat de recherche).
 * À distinguer de <ErrorState/> (panne API) — voir audit UI/UX.
 */
export function EmptyState({
  icon,
  title = "Aucun élément",
  description,
  action,
}: {
  icon?: ReactNode;
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 mb-4">
        {icon ?? <Inbox className="w-7 h-7" />}
      </div>
      <p className="text-gray-700 font-semibold">{title}</p>
      {description && <p className="text-gray-400 text-sm mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
