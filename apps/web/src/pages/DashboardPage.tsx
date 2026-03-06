import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "../components/layout/AppLayout.js";
import { GroupList } from "../components/groups/GroupList.js";
import { CreateGroupModal } from "../components/groups/CreateGroupModal.js";

export function DashboardPage() {
  const { t } = useTranslation();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">
          {t("groups.title")}
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600"
        >
          {t("groups.create")}
        </button>
      </div>
      <GroupList />
      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} />
      )}
    </AppLayout>
  );
}
