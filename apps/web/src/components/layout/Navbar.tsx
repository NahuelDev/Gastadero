import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth.js";
import { GastaderoLogo } from "../GastaderoLogo.js";

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === "es" ? "en" : "es");
  };

  return (
    <nav className="bg-primary text-white px-4 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-white">
        <GastaderoLogo className="h-7 w-auto" />
        <span className="text-lg font-bold tracking-tight">{t("app.title")}</span>
      </Link>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleLang}
          className="text-sm bg-primary px-2 py-1 rounded hover:bg-primary-hover"
        >
          {i18n.language === "es" ? "EN" : "ES"}
        </button>
        {user && (
          <>
            <span className="text-sm">{user.displayName}</span>
            <button
              onClick={logout}
              className="text-sm bg-primary px-2 py-1 rounded hover:bg-primary-hover"
            >
              {t("auth.logout")}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
