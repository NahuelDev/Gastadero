import { useTranslation } from "react-i18next";
import { useGroups } from "../../hooks/useGroups.js";
import { GroupCard } from "./GroupCard.js";

export function GroupList() {
  const { t } = useTranslation();
  const { data: groups, isLoading } = useGroups();

  if (isLoading) {
    return <p className="text-text-muted text-center">{t("common.loading")}</p>;
  }

  if (!groups?.length) {
    return (
      <p className="text-text-muted text-center">{t("groups.noGroups")}</p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
