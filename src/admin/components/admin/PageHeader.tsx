import { ReactNode } from "react";

/**
 * En-tête de page standardisé pour tout le back-office.
 * Remplace les blocs `<div className="flex justify-between"><h1/><p/></div>`
 * recodés sur chaque page.
 */
export function PageHeader({
  title,
  description,
  actions,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="w-11 h-11 rounded-xl bg-[#0D1F35]/5 flex items-center justify-center text-[#0D1F35] shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
          {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export default PageHeader;
