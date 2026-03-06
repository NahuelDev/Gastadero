import { Link } from "react-router-dom";
import type { Group } from "@gastos/shared";

export function GroupCard({ group }: { group: Group }) {
  return (
    <Link
      to={`/groups/${group.id}`}
      className="block bg-surface p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="font-semibold text-text-main">{group.name}</h3>
      {group.description && (
        <p className="text-sm text-text-muted mt-1">{group.description}</p>
      )}
      <span className="text-xs text-text-muted mt-2 block">
        {group.currency}
      </span>
    </Link>
  );
}
