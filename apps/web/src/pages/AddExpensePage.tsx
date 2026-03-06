import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "../components/layout/AppLayout.js";
import { AddExpenseForm } from "../components/expenses/AddExpenseForm.js";
import { useGroup } from "../hooks/useGroups.js";
import { useAuth } from "../hooks/useAuth.js";

export function AddExpensePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: group, isLoading } = useGroup(id!);

  if (isLoading || !group) {
    return (
      <AppLayout>
        <p className="text-center text-text-muted">{t("common.loading")}</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center gap-2 mb-4">
        <Link
          to={`/groups/${id}`}
          className="text-text-muted hover:text-text-main"
        >
          &larr;
        </Link>
        <h2 className="text-xl font-bold text-text-main">
          {t("expenses.add")}
        </h2>
      </div>
      <AddExpenseForm
        groupId={id!}
        members={group.members}
        currentMemberId={group.members.find((m) => m.userId === user?.id)?.id}
      />
    </AppLayout>
  );
}
