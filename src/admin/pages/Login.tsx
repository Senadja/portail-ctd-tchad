import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@admin/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@admin/components/ui/button";
import { Input } from "@admin/components/ui/input";
import { Label } from "@admin/components/ui/label";
import { Lock, User, AlertCircle, ArrowLeft, Eye, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  username: z.string().trim().min(3, "L'identifiant doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginForm = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.username, data.password);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#153465] p-4">
      <div className="relative w-full max-w-lg">
        {/* Form card */}
        <div className="bg-white rounded-xl shadow-2xl p-10 sm:p-12 relative">
          
          <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au site
          </Link>

          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto mb-6">
              <img src="/logo-chad.png" alt="Armoiries du Tchad" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-[#0A2540] mb-2">Console d'administration</h1>
            <p className="text-gray-500 text-sm">Connectez-vous pour accéder à l'espace de gestion.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                Email ou numéro de téléphone
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Ex: admin@mci.td"
                  className="pl-12 h-12 bg-[#F9F8F6] border-gray-200 focus:bg-white transition-colors text-base"
                  {...register("username")}
                />
              </div>
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  className="pl-12 pr-12 h-12 bg-[#F9F8F6] border-gray-200 focus:bg-white transition-colors text-base"
                  {...register("password")}
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#153465] hover:bg-[#0D2245] text-white h-12 text-base font-medium flex items-center justify-center mt-8"
            >
              {isLoading ? "Connexion en cours…" : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
