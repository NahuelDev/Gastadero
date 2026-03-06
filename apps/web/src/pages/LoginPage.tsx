import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoginForm } from "../components/auth/LoginForm.js";
import { useAuth } from "../hooks/useAuth.js";
import { GastaderoLogo } from "../components/GastaderoLogo.js";

export function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  if (isAuthenticated) return <Navigate to={redirect} replace />;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <GastaderoLogo className="h-16 w-auto text-emerald-500 mb-3" />
          <span className="text-2xl font-bold text-slate-800 tracking-tight">Gastadero</span>
        </div>
        <h1 className="text-lg font-semibold text-center mb-4 text-slate-600">
          {t("auth.login")}
        </h1>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <LoginForm />
          <p className="text-center text-sm text-slate-500 mt-4">
            {t("auth.noAccount")}{" "}
            <Link to={`/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`} className="text-emerald-500 hover:underline">
              {t("auth.register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
