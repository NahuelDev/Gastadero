import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RegisterForm } from "../components/auth/RegisterForm.js";
import { useAuth } from "../hooks/useAuth.js";
import { GastaderoLogo } from "../components/GastaderoLogo.js";

export function RegisterPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  if (isAuthenticated) return <Navigate to={redirect} replace />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <GastaderoLogo className="h-16 w-auto text-primary mb-3" />
          <span className="text-2xl font-bold text-text-main tracking-tight">Gastadero</span>
        </div>
        <h1 className="text-lg font-semibold text-center mb-4 text-text-muted">
          {t("auth.register")}
        </h1>
        <div className="bg-surface p-6 rounded-xl shadow-sm">
          <RegisterForm />
          <p className="text-center text-sm text-text-muted mt-4">
            {t("auth.hasAccount")}{" "}
            <Link to={`/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`} className="text-primary hover:underline">
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
