import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RegisterForm } from "../components/auth/RegisterForm.js";
import { useAuth } from "../hooks/useAuth.js";

export function RegisterPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  if (isAuthenticated) return <Navigate to={redirect} replace />;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">
          {t("auth.register")}
        </h1>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <RegisterForm />
          <p className="text-center text-sm text-slate-500 mt-4">
            {t("auth.hasAccount")}{" "}
            <Link to={`/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`} className="text-emerald-500 hover:underline">
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
