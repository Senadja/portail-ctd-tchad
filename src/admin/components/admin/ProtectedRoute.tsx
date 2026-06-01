import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@admin/contexts/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Avoid redirecting while checking session

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
