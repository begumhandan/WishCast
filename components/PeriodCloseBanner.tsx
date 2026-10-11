import { Gift } from "lucide-react";
import { closePeriod } from "@/app/actions";
import { formatShortDate } from "@/lib/dates";
import { formatTL } from "@/lib/money";
import type { Period } from "@/lib/plan";
import { buttonPrimary } from "@/lib/ui";

export default function PeriodCloseBanner({ period, leftover }: { period: Period; leftover: number }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4 sm:flex-row sm:items-center">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent">
        <Gift size={18} />
      </span>
      <div className="flex-1 text-sm">
        <p className="font-semibold">
          {formatShortDate(period.start)} – {formatShortDate(period.end)} dönemi kapandı
        </p>
        <p className="text-muted">
          {leftover > 0 ? (
            <>
              Bu dönemde <strong className="text-ink">{formatTL(leftover)}</strong> arttı. Hedefine aktarabilirsin.
            </>
          ) : (
            "Bu dönemde artan para olmadı."
          )}
        </p>
      </div>
      <form action={closePeriod}>
        <button type="submit" className={`${buttonPrimary} w-full sm:w-auto`}>
          {leftover > 0 ? "Hedefe aktar" : "Dönemi kapat"}
        </button>
      </form>
    </section>
  );
}
