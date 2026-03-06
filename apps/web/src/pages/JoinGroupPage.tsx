import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.js";
import {
  fetchGroupByInviteCode,
  fetchUnclaimedMembers,
  claimMember,
} from "../api/groups.api.js";
import type { GroupPreview } from "@gastos/shared";

interface UnclaimedMember {
  id: string;
  displayName: string;
}

export function JoinGroupPage() {
  const { code } = useParams<{ code: string }>();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState<GroupPreview | null>(null);
  const [unclaimed, setUnclaimed] = useState<UnclaimedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    Promise.all([
      fetchGroupByInviteCode(code),
      fetchUnclaimedMembers(code),
    ])
      .then(([g, members]) => {
        setGroup(g);
        setUnclaimed(members);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : t("common.error"))
      )
      .finally(() => setLoading(false));
  }, [code, t]);

  const handleClaim = async (memberId: string) => {
    if (!code) return;
    setClaiming(true);
    setError("");
    try {
      const { groupId } = await claimMember(code, memberId);
      navigate(`/groups/${groupId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted">{t("common.loading")}</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-danger mb-4">
            {error || t("groups.invalidLink")}
          </p>
          <Link to="/" className="text-primary hover:underline">
            {t("groups.goHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-surface rounded-xl shadow-sm p-6 w-full max-w-sm text-center">
        <h2 className="text-lg font-semibold mb-1">{t("groups.joinTitle")}</h2>
        <p className="text-2xl font-bold text-text-main mb-1">{group.name}</p>
        {group.description && (
          <p className="text-sm text-text-muted mb-4">{group.description}</p>
        )}

        {error && (
          <div className="bg-red-50 text-danger p-3 rounded text-sm mb-4">
            {error}
          </div>
        )}

        {isAuthenticated ? (
          unclaimed.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-text-muted mb-3">
                {t("groups.selectMember")}
              </p>
              {unclaimed.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleClaim(member.id)}
                  disabled={claiming}
                  className="w-full border border-slate-200 rounded-lg p-3 hover:bg-primary/10 hover:border-primary disabled:opacity-50 text-left"
                >
                  <span className="font-medium text-text-main">
                    {member.displayName}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              {t("groups.noUnclaimed")}
            </p>
          )
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">
              {t("groups.loginToJoin")}
            </p>
            <Link
              to={`/login?redirect=/join/${code}`}
              className="block w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover"
            >
              {t("auth.login")}
            </Link>
            <Link
              to={`/register?redirect=/join/${code}`}
              className="block w-full border border-primary text-primary py-2.5 rounded-lg hover:bg-primary/10"
            >
              {t("auth.register")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
