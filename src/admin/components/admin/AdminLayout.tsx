import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@admin/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@admin/lib/api";
import {
  LayoutDashboard, UserCircle, Newspaper, FileText,
  Gavel, ClipboardList, Settings, LogOut, Menu, X,
  ChevronRight, Bell, ExternalLink, Shield, ChevronDown, Image as ImageIcon, FileCheck, FolderTree
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@admin/components/ui/dropdown-menu";
import logoChad from "/logo-chad.png";

const navGroups = [
  {
    label: "Vue d'ensemble",
    items: [
      { icon: LayoutDashboard, label: "Tableau de bord", href: "/admin" },
    ],
  },
  {
    label: "Contenu éditorial",
    items: [
      { icon: FolderTree,   label: "Organigramme",      href: "/admin/organigramme" },
      { icon: Newspaper,    label: "À la Une",          href: "/admin/actualites" },
      { icon: Gavel,        label: "Appels d'offres",   href: "/admin/appels-offres" },
      { icon: ImageIcon,    label: "Médiathèque",       href: "/admin/medias" },
    ],
  },
  {
    label: "Gestion",
    items: [
      { icon: ClipboardList, label: "Formulaires",  href: "/admin/formulaires", badge: true },
      { icon: FileCheck,     label: "Soumissions AO",href: "/admin/soumissions" },
      { icon: Settings,      label: "Paramètres",   href: "/admin/parametres" },
    ],
  },
];

const NavLink = ({
  item, isActive, badge, onClick,
}: {
  item: { icon: any; label: string; href: string };
  isActive: boolean;
  badge?: number;
  onClick?: () => void;
}) => (
  <Link
    to={item.href}
    onClick={onClick}
    className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-150 ${
      isActive
        ? "bg-[#FECB00] text-[#0A2540] shadow-sm"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`}
  >
    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#0A2540]" : "text-white/50 group-hover:text-white"}`} />
    <span className="truncate">{item.label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="ml-auto shrink-0 min-w-[18px] h-4.5 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
        {badge > 99 ? "99+" : badge}
      </span>
    )}
  </Link>
);

const SidebarContent = ({
  onClose,
  newFormsCount,
}: {
  onClose?: () => void;
  newFormsCount: number;
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/10 flex items-center justify-between shrink-0">
        <Link to="/admin" className="flex items-center gap-3 min-w-0" onClick={onClose}>
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-1.5 shrink-0">
            <img src={logoChad} alt="CTD" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-white leading-tight truncate">CTD — Portail Admin</p>
            <p className="text-xs text-white/50 uppercase tracking-wider mt-0.5">Back-office</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-4 mb-2 text-xs font-bold text-white/40 uppercase tracking-widest">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={location.pathname === item.href}
                  badge={item.badge ? newFormsCount : undefined}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // Fetch new forms count for badge
  const { data: forms = [] } = useQuery<any[]>({
    queryKey: ["forms-badge"],
    queryFn: async () => {
      const res = await api.get("/forms");
      return res.data;
    },
    refetchInterval: 60_000,
  });
  const newFormsCount = forms.filter((f) => f.status === "NOUVEAU").length;

  const currentPage =
    navGroups.flatMap((g) => g.items).find((item) => item.href === location.pathname)?.label ||
    "Administration";

  return (
    <div className="min-h-screen flex bg-[#F4F6FA]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0D1F35] shrink-0 shadow-xl z-10 fixed inset-y-0 left-0">
        <SidebarContent newFormsCount={newFormsCount} />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#0D1F35] flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 h-screen">
            <SidebarContent onClose={() => setSidebarOpen(false)} newFormsCount={newFormsCount} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 h-16 shrink-0 flex items-center px-6 md:px-8 gap-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-base text-gray-500">
            <span className="font-medium text-gray-500">Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-gray-900">{currentPage}</span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* Notification badge */}
            {newFormsCount > 0 && (
              <Link
                to="/admin/formulaires"
                className="relative flex p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {newFormsCount > 9 ? "9+" : newFormsCount}
                </span>
              </Link>
            )}

            {/* View site */}
            <Link
              to="/"
              target="_blank"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Voir le site public
            </Link>

            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors outline-none">
                  <div className="w-10 h-10 rounded-full bg-[#0D1F35] flex items-center justify-center text-[#FECB00] text-sm font-black shrink-0">
                    {admin?.username?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="hidden md:block text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">{admin?.username || "Administrateur"}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{admin?.username || "Administrateur"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{admin?.email || ""}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] w-full mx-auto flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
