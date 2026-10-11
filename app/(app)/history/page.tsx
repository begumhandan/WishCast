import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AddExpenseButton from "@/components/AddExpenseButton";
import ExpenseList from "@/components/ExpenseList";
import PageHeader from "@/components/PageHeader";
import { categoryIcon } from "@/lib/categories";
import { formatDate } from "@/lib/dates";
import { getHistoryData } from "@/lib/history-data";
import { formatTL } from "@/lib/money";
import { CATEGORIES } from "@/lib/schemas";
import { requireUserId } from "@/lib/session";
import { card, cardHeader, cardTitle } from "@/lib/ui";

type SearchParams = Promise<{ p?: string; c?: string }>;

export default function HistoryPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Harcamalar" description="Dönem dönem bütün harcamaların" actions={<AddExpenseButton />} />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-surface-hover" />}>
        <History searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function History({ searchParams }: { searchParams: SearchParams }) {
  const userId = await requireUserId();
  const params = await searchParams;
  const offset = Math.min(0, Number.parseInt(params.p ?? "0", 10) || 0);
  const category = CATEGORIES.find((c) => c === params.c);

  const data = await getHistoryData(userId, new Date(), offset, category);
  if (!data) {
    return (
      <p className="text-sm text-muted">
        Önce <Link href="/onboarding" className="font-medium text-accent">bütçeni</Link> gir.
      </p>
    );
  }

  const href = (p: number, c?: string) => {
    const query = new URLSearchParams();
    if (p !== 0) query.set("p", String(p));
    if (c) query.set("c", c);
    const qs = query.toString();
    return qs ? `/history?${qs}` : "/history";
  };

  const filterChip = (active: boolean) =>
    `inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
      active ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:bg-surface-hover hover:text-ink"
    }`;

  return (
    <section className={card}>
      <div className={`${cardHeader} flex-wrap`}>
        <div className="flex items-center gap-1">
          <Link href={href(offset - 1, category)} aria-label="Önceki dönem" className="rounded-md p-1.5 text-muted hover:bg-surface-hover hover:text-ink">
            <ChevronLeft size={16} />
          </Link>
          <h2 className={`${cardTitle} min-w-44 text-center`}>
            {formatDate(data.period.start)} – {formatDate(data.period.end)}
          </h2>
          {offset < 0 ? (
            <Link href={href(offset + 1, category)} aria-label="Sonraki dönem" className="rounded-md p-1.5 text-muted hover:bg-surface-hover hover:text-ink">
              <ChevronRight size={16} />
            </Link>
          ) : (
            <span className="p-1.5 text-line-strong" aria-hidden="true">
              <ChevronRight size={16} />
            </span>
          )}
        </div>
        <p className="text-sm text-muted">
          {data.count} harcama · <strong className="font-semibold text-ink tabular-nums">{formatTL(data.total)}</strong>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-line px-5 py-3">
        <Link href={href(offset)} className={filterChip(!category)}>
          Tümü
        </Link>
        {data.categories.map(({ category: name, amount }) => {
          const Icon = categoryIcon(name);
          return (
            <Link key={name} href={href(offset, name)} className={filterChip(category === name)}>
              <Icon size={13} />
              {name}
              <span className="tabular-nums opacity-70">{formatTL(amount)}</span>
            </Link>
          );
        })}
      </div>

      <ExpenseList expenses={data.expenses} empty="Bu dönemde harcama bulunamadı." />
    </section>
  );
}
