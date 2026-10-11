import { closePeriod } from "@/app/actions";
import { formatTL } from "@/lib/money";
import { formatShortDate } from "@/lib/dates";
import type { Period } from "@/lib/plan";

export default function PeriodCloseCard({ period, leftover }: { period: Period; leftover: number }) {
  return (
    <section className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 text-left">
      <p className="font-semibold">
        🗓️ {formatShortDate(period.start)} – {formatShortDate(period.end)} dönemi bitti
      </p>
      <p className="mt-1 text-sm text-gray-600">
        {leftover > 0
          ? <>Bu dönemde <strong>{formatTL(leftover)}</strong> arttı. Hedefine aktaralım mı?</>
          : "Bu dönemde artan para olmadı. Dönemi kapatıp yenisine başlayabilirsin."}
      </p>
      <form action={closePeriod} className="mt-3">
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          {leftover > 0 ? "Hedefe aktar" : "Dönemi kapat"}
        </button>
      </form>
    </section>
  );
}