import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { CalendarDays, PiggyBank, TrendingUp, TriangleAlert } from "lucide-react";
import { formatTL } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { card, cardHeader, cardTitle } from "@/lib/ui";
import type { Dashboard } from "@/lib/dashboard";

type Props = {
  goal: { name: string; price: number; saved: number; monthlyInflation: number };
  dashboard: Dashboard;
};

export default function GoalCard({ goal, dashboard }: Props) {
  const { progress, estimatedDate, plannedDate, overspent, monthlySaving, monthsLeft, feasible } = dashboard;
  // Bu dönemki fazla harcama tarihi ne kadar öteledi?
  const delayDays =
    estimatedDate && plannedDate ? differenceInCalendarDays(estimatedDate, plannedDate) : estimatedDate ? 0 : null;
  const percent = Math.round(progress * 100);
  const reached = progress >= 1;

  return (
    <section className={card}>
      <div className={cardHeader}>
        <h2 className={cardTitle}>Hedef</h2>
        <Link href="/goal" className="text-xs font-medium text-muted hover:text-ink">Düzenle</Link>
      </div>

      <div className="p-5">
        <p className="truncate text-lg font-semibold tracking-tight">{goal.name}</p>
        <div className="mt-3 flex items-baseline justify-between text-sm">
          <span className="tabular-nums">
            <strong className="font-semibold">{formatTL(goal.saved)}</strong>
            <span className="text-muted"> / {formatTL(goal.price)}</span>
          </span>
          <span className="font-medium tabular-nums text-accent">%{percent}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-hover">
          <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${percent}%` }} />
        </div>

        <dl className="mt-5 grid gap-3 text-sm">
          <div className="flex items-start gap-3">
            <CalendarDays size={16} className="mt-0.5 shrink-0 text-subtle" />
            <div>
              <dt className="text-muted">Tahmini kavuşma tarihi</dt>
              <dd className="font-semibold">
                {reached ? (
                  <span className="text-positive">Hedefe ulaştın 🎉</span>
                ) : estimatedDate ? (
                  formatDate(estimatedDate)
                ) : (
                  <span className="text-negative">10 yıl içinde ulaşılamıyor</span>
                )}
              </dd>
            </div>
          </div>
          {!reached && (
            <div className="flex items-start gap-3">
              <PiggyBank size={16} className="mt-0.5 shrink-0 text-subtle" />
              <div>
                <dt className="text-muted">Aylık birikim</dt>
                <dd className="font-semibold tabular-nums">
                  {feasible ? `${formatTL(monthlySaving)} · ${monthsLeft} ay` : "Gelir yetmiyor"}
                </dd>
              </div>
            </div>
          )}
        </dl>

        {!reached && delayDays !== 0 && (
          <p
            className={`mt-4 flex gap-2 rounded-lg px-3 py-2 text-xs ${
              delayDays !== null && delayDays < 0 ? "bg-positive-soft text-positive" : "bg-negative-soft text-negative"
            }`}
          >
            {delayDays !== null && delayDays < 0 ? (
              <TrendingUp size={14} className="mt-px shrink-0" />
            ) : (
              <TriangleAlert size={14} className="mt-px shrink-0" />
            )}
            <span>
              {delayDays === null
                ? "Bu dönemki harcamalarla hedefe 10 yıl içinde ulaşılamıyor."
                : delayDays < 0
                  ? `Plandan ${-delayDays} gün öndesin. Böyle devam!`
                  : `Bu dönemki harcamaların tarihi plana göre ${delayDays} gün öteledi${
                      overspent > 0 ? ` (bütçeyi ${formatTL(overspent)} aştın)` : ""
                    }.`}
            </span>
          </p>
        )}

        {goal.monthlyInflation > 0 && !reached && (
          <p className="mt-4 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
            Fiyatın ayda %{(goal.monthlyInflation * 100).toLocaleString("tr-TR")} artacağı varsayılıyor.
          </p>
        )}
      </div>
    </section>
  );
}
