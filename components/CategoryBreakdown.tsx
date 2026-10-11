import { categoryIcon } from "@/lib/categories";
import { formatTL } from "@/lib/money";

type Row = { category: string; amount: number };

export default function CategoryBreakdown({ data }: { data: Row[] }) {
  const total = data.reduce((sum, row) => sum + row.amount, 0);
  const max = data[0]?.amount ?? 0;

  if (data.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-muted">Bu dönemde henüz harcama yok.</p>;
  }

  return (
    <ul className="flex flex-col gap-3.5 px-5 py-4">
      {data.map(({ category, amount }) => {
        const Icon = categoryIcon(category);
        const share = total > 0 ? Math.round((amount / total) * 100) : 0;
        return (
          <li key={category}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <Icon size={15} className="text-subtle" />
                {category}
              </span>
              <span className="tabular-nums">
                {formatTL(amount)} <span className="text-muted">· %{share}</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-hover">
              <div className="h-full rounded-full bg-accent" style={{ width: `${max > 0 ? (amount / max) * 100 : 0}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
