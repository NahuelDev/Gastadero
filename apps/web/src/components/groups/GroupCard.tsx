import { Link } from "react-router-dom";
import type { Group } from "@gastos/shared";

export function GroupCard({ group }: { group: Group }) {
  return (
    <Link
      to={`/groups/${group.id}`}
      className="block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="font-semibold text-slate-800">{group.name}</h3>
      {group.description && (
        <p className="text-sm text-slate-500 mt-1">{group.description}</p>
      )}
      <span className="text-xs text-slate-400 mt-2 block">
        {group.currency}
      </span>
    </Link>
  );
}
