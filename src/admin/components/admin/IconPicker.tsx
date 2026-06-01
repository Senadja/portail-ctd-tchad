import { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@admin/components/ui/popover";
import { Button } from "@admin/components/ui/button";
import { Input } from "@admin/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@admin/components/ui/scroll-area";

// Extraire les noms des icônes
const iconNames = Object.keys(LucideIcons).filter(
  (name) => /^[A-Z]/.test(name) && name !== "createLucideIcon"
);

export function IconPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    if (!search) return iconNames.slice(0, 150); // Afficher 150 par défaut pour les performances
    return iconNames.filter(name => name.toLowerCase().includes(search.toLowerCase())).slice(0, 150);
  }, [search]);

  const SelectedIcon = (LucideIcons as any)[value] || LucideIcons.HelpCircle;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-start h-9 bg-white px-3 font-normal">
          <SelectedIcon className="w-4 h-4 mr-2 shrink-0 text-muted-foreground" />
          <span className="truncate">{value || "Choisir une icône"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Rechercher une icône (ex: Target, User)..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ScrollArea className="h-64 p-2">
          <div className="grid grid-cols-5 gap-1">
            {filteredIcons.map(name => {
              const IconComponent = (LucideIcons as any)[name];
              if (!IconComponent) return null;
              return (
                <Button
                  key={name}
                  variant="ghost"
                  className={`h-10 w-10 p-0 rounded-md ${value === name ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  title={name}
                >
                  <IconComponent className="h-5 w-5" />
                </Button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">Aucune icône trouvée.</p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
