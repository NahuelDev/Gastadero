import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoginForm } from "../components/auth/LoginForm.js";
import { useAuth } from "../hooks/useAuth.js";

export function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  if (isAuthenticated) return <Navigate to={redirect} replace />;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">
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
