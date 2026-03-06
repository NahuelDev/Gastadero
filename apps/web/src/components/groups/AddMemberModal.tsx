import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAddMember } from "../../hooks/useGroups.js";

export function AddMemberModal({
  groupId,
  onClose,
}: {
  groupId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const addMember = useAddMember(groupId);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await addMember.mutateAsync({ displayName });
      setSuccess(true);
      setTimeout(() => onClose(), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-8">
            <p className="text-primary font-medium text-lg">
              {t("common.saved")}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">
              {t("groups.addMember")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-danger p-3 rounded text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  {t("groups.memberName")}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder={t("groups.memberNamePlaceholder")}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-slate-300 py-2 rounded-lg hover:bg-background"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={addMember.isPending}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50"
                >
                  {t("common.save")}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
