import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth.js";

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === "es" ? "en" : "es");
  };

  return (
    <nav className="bg-emerald-500 text-white px-4 py-3 flex items-center justify-between">
      <Link to="/" className="text-lg font-bold">
        {t("app.title")}
      </Link>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleLang}
          className="text-sm bg-emerald-500 px-2 py-1 rounded hover:bg-emerald-400"
        >
          {i18n.language === "es" ? "EN" : "ES"}
        </button>
        {user && (
          <>
            <span className="text-sm">{user.displayName}</span>
            <button
              onClick={logout}
              className="text-sm bg-emerald-500 px-2 py-1 rounded hover:bg-emerald-400"
            >
              {t("auth.logout")}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
