import { ReactNode } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@admin/components/ui/dialog";
import { Button } from "@admin/components/ui/button";

/**
 * Boîte de confirmation unifiée (remplace window.confirm() et les modales
 * custom dupliquées). Accessible via Radix Dialog : role=dialog, aria-modal,
 * fermeture Échap et focus-trap natifs.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  loading = false,
  danger = false,
  icon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
  danger?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 ${
              danger ? "bg-red-50 text-red-500" : "bg-[#0D1F35]/5 text-[#0D1F35]"
            }`}
          >
            {icon ?? <AlertTriangle className="w-6 h-6" />}
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-center">{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "destructive" : "default"}
            className="flex-1 rounded-xl"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDialog;
