import { Loader2 } from "lucide-react";

/** Spinner de chargement centré, cohérent sur toutes les pages. */
export function LoadingState({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-20 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-[#0D1F35]/30" />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );
}

/** Squelette de lignes pour les tableaux pendant le chargement. */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-gray-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 12}%` }} />
            <div className="h-3 bg-gray-50 rounded animate-pulse w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoadingState;
