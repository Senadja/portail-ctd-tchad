// src/admin/AdminApp.tsx — Point d'entrée du CMS admin CTD
// Arbre React complètement isolé du portail public
import "../admin.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@admin/contexts/AuthContext";
import { Toaster } from "sonner";

// Layout & guards
import AdminLayout    from "@admin/components/admin/AdminLayout";
import ProtectedRoute from "@admin/components/admin/ProtectedRoute";

// Pages
import Login          from "@admin/pages/Login";
import Dashboard      from "@admin/pages/Dashboard";
import Actualites     from "@admin/pages/Actualites";
import AppelsOffres   from "@admin/pages/AppelsOffres";
import Documents      from "@admin/pages/Documents";
import Formulaires    from "@admin/pages/Formulaires";
import Medias         from "@admin/pages/Medias";
import MotDuPresident from "@admin/pages/MotDuPresident";
import Parametres     from "@admin/pages/Parametres";
import Soumissions    from "@admin/pages/Soumissions";
import Organigramme   from "@admin/pages/Organigramme";
import ContentBlocks  from "@admin/pages/ContentBlocks";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const AdminApp = () => (
  <div id="admin-root">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            {/* Login public */}
            <Route path="/admin/login" element={<Login />} />

            {/* Routes protégées sous AdminLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin"               element={<Dashboard />} />
                <Route path="/admin/president"     element={<MotDuPresident />} />
                <Route path="/admin/actualites"    element={<Actualites />} />
                <Route path="/admin/documents"     element={<Documents />} />
                <Route path="/admin/appels-offres" element={<AppelsOffres />} />
                <Route path="/admin/medias"        element={<Medias />} />
                <Route path="/admin/formulaires"   element={<Formulaires />} />
                <Route path="/admin/soumissions"   element={<Soumissions />} />
                <Route path="/admin/parametres"    element={<Parametres />} />
                <Route path="/admin/organigramme"  element={<Organigramme />} />
                <Route path="/admin/blocks"        element={<ContentBlocks />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </div>
);

export default AdminApp;
