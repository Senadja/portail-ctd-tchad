import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@admin/components/ui/button";

/**
 * État d'erreur réseau. Affiché quand un useQuery échoue (isError),
 * au lieu de laisser croire à une base vide. Propose de réessayer.
 */
export function ErrorState({
  title = "Impossible de charger les données",
  description = "Une erreur est survenue lors de la communication avec le serveur. Vérifiez votre connexion puis réessayez.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-400 mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <p className="text-gray-800 font-semibold">{title}</p>
      <p className="text-gray-400 text-sm mt-1 max-w-sm">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-5 gap-2 rounded-xl">
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
