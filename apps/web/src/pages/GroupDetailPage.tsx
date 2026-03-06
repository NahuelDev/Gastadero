import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "../components/layout/AppLayout.js";
import { ExpenseList } from "../components/expenses/ExpenseList.js";
import { BalanceSummary } from "../components/balances/BalanceSummary.js";
import { SettlementList } from "../components/settlements/SettlementList.js";
import { RecordSettlementModal } from "../components/settlements/RecordSettlementModal.js";
import { AddMemberModal } from "../components/groups/AddMemberModal.js";
import { GroupSummary } from "../components/groups/GroupSummary.js";
import { useGroup } from "../hooks/useGroups.js";
import { useAuth } from "../hooks/useAuth.js";
import { useExpenses } from "../hooks/useExpenses.js";
import { useBalances } from "../hooks/useBalances.js";
import { useSettlements } from "../hooks/useSettlements.js";
import { generateReport } from "../lib/pdf-report.js";

type Tab = "expenses" | "balances" | "settlements";

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("expenses");
  const [showSettle, setShowSettle] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { user } = useAuth();

  const { data: group, isLoading } = useGroup(id!);
  const { data: expenses } = useExpenses(id!);
  const { data: balances, simplifiedDebts } = useBalances(id!);
  const { data: settlements } = useSettlements(id!);

  const copyInviteLink = useCallback(() => {
    if (!group) return;
    const url = `${window.location.origin}/join/${group.inviteCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [group]);

  if (isLoading || !group) {
    return (
      <AppLayout>
        <p className="text-center text-slate-500">{t("common.loading")}</p>
      </AppLayout>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "expenses", label: t("expenses.title") },
    { key: "balances", label: t("balances.title") },
    { key: "settlements", label: t("settlements.title") },
  ];

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{group.name}</h2>
          <p className="text-sm text-slate-500">
            {group.members.length} {t("groups.members").toLowerCase()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddMember(true)}
            className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
          >
            {t("groups.addMember")}
          </button>
          <button
            onClick={copyInviteLink}
            className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
          >
            {linkCopied ? t("groups.linkCopied") : t("groups.shareLink")}
          </button>
          <button
            onClick={() =>
              generateReport(
                group.name,
                expenses ?? [],
                simplifiedDebts,
                group.currency
              )
            }
            className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
          >
            {t("common.downloadPdf")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-medium border-b-2 ${
              tab === t.key
                ? "border-emerald-500 text-emerald-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "expenses" && (
        <div>
          <Link
            to={`/groups/${id}/add`}
            className="block w-full bg-emerald-500 text-white text-center py-2 rounded-lg hover:bg-emerald-600 mb-4"
          >
            {t("expenses.add")}
          </Link>
          <ExpenseList
            expenses={expenses ?? []}
            groupId={id!}
            currency={group.currency}
            members={group.members}
            currentMemberId={group.members.find((m) => m.userId === user?.id)?.id}
          />
          <GroupSummary
            groupName={group.name}
            debts={simplifiedDebts}
            balances={balances ?? []}
            currency={group.currency}
          />
        </div>
      )}

      {tab === "balances" && (
        <div>
          <BalanceSummary
            debts={simplifiedDebts}
            groupName={group.name}
            currency={group.currency}
          />
          <button
            onClick={() => setShowSettle(true)}
            className="w-full mt-4 border border-emerald-500 text-emerald-500 py-2 rounded-lg hover:bg-emerald-50"
          >
            {t("balances.settle")}
          </button>
        </div>
      )}

      {tab === "settlements" && (
        <SettlementList
          settlements={settlements ?? []}
          currency={group.currency}
        />
      )}

      {showSettle && (
        <RecordSettlementModal
          groupId={id!}
          members={group.members}
          currentMemberId={group.members.find((m) => m.userId === user?.id)?.id}
          onClose={() => setShowSettle(false)}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          groupId={id!}
          onClose={() => setShowAddMember(false)}
        />
      )}
    </AppLayout>
  );
}
