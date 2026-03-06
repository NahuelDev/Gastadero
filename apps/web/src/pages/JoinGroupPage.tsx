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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || t("groups.invalidLink")}
          </p>
          <Link to="/" className="text-emerald-500 hover:underline">
            {t("groups.goHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-xl shadow-sm p-6 w-full max-w-sm text-center">
        <h2 className="text-lg font-semibold mb-1">{t("groups.joinTitle")}</h2>
        <p className="text-2xl font-bold text-slate-800 mb-1">{group.name}</p>
        {group.description && (
          <p className="text-sm text-slate-500 mb-4">{group.description}</p>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">
            {error}
          </div>
        )}

        {isAuthenticated ? (
          unclaimed.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 mb-3">
                {t("groups.selectMember")}
              </p>
              {unclaimed.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleClaim(member.id)}
                  disabled={claiming}
                  className="w-full border border-slate-200 rounded-lg p-3 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 text-left"
                >
                  <span className="font-medium text-slate-800">
                    {member.displayName}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              {t("groups.noUnclaimed")}
            </p>
          )
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {t("groups.loginToJoin")}
            </p>
            <Link
              to={`/login?redirect=/join/${code}`}
              className="block w-full bg-emerald-500 text-white py-2.5 rounded-lg hover:bg-emerald-600"
            >
              {t("auth.login")}
            </Link>
            <Link
              to={`/register?redirect=/join/${code}`}
              className="block w-full border border-emerald-500 text-emerald-500 py-2.5 rounded-lg hover:bg-emerald-50"
            >
              {t("auth.register")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
