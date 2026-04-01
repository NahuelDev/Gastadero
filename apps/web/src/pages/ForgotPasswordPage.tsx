import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GastaderoLogo } from "../components/GastaderoLogo.js";
import { forgotPassword } from "../api/auth.api.js";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <GastaderoLogo className="h-16 w-auto text-primary mb-3" />
          <span className="text-2xl font-bold text-text-main tracking-tight">
            Gastadero
          </span>
        </div>
        <h1 className="text-lg font-semibold text-center mb-4 text-text-muted">
          {t("auth.forgotPasswordTitle")}
        </h1>
        <div className="bg-surface p-6 rounded-xl shadow-sm">
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-text-muted">
                {t("auth.forgotPasswordSuccess")}
              </p>
              <Link
                to="/login"
                className="text-sm text-primary hover:underline"
              >
                {t("auth.backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-danger p-3 rounded text-sm">
                  {error}
                </div>
              )}
              <p className="text-sm text-text-muted">
                {t("auth.forgotPasswordDescription")}
              </p>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? t("common.loading") : t("auth.sendResetLink")}
              </button>
            </form>
          )}
          <p className="text-center text-sm text-text-muted mt-4">
            <Link to="/login" className="text-primary hover:underline">
              {t("auth.backToLogin")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
