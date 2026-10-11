import { formatTL } from "@/lib/money";
import { formatShortDate } from "@/lib/dates";
import type { Dashboard } from "@/lib/dashboard";

export default function AllowanceCard({ dashboard }: { dashboard: Dashboard }) {
  const { allowanceToday, remaining, period, feasible } = dashboard;

  return (
    <section className="rounded-2xl bg-black p-6 text-left text-white">
      <p className="text-sm text-gray-300">Bugün en fazla harcayabileceğin</p>
      <p className="mt-1 text-4xl font-bold">{formatTL(allowanceToday)}</p>

      <p className="mt-4 text-sm text-gray-300">
        Bu dönem kalan: <strong className="text-white">{formatTL(Math.max(0, remaining))}</strong>
        <span className="text-gray-400">
          {" "}
          ({formatShortDate(period.start)} – {formatShortDate(period.end)})
        </span>
      </p>

      {remaining < 0 && (
        <p className="mt-2 text-sm text-red-300">
          Bu dönemin bütçesini {formatTL(-remaining)} aştın.
        </p>
      )}
      {!feasible && (
        <p className="mt-2 text-sm text-amber-300">
          Gelirin bu hedef için yetmiyor; aşağıdaki tarih en erken mümkün tarih.
        </p>
      )}
    </section>
  );
}