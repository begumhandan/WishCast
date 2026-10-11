"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Hourglass, X } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });

type Props = { goalName: string; days: number | null; newDate: string | null };

export default function ImpactToast({ goalName, days, newDate }: Props) {
  const [open, setOpen] = useState(true);

  // 6 saniye sonra kendiliğinden kapan
  useEffect(() => {
    const timer = setTimeout(() => setOpen(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (!open) return null;

  const delayed = days !== null && days > 0;
  const message =
    days === null
      ? `Bu hızla ${goalName} hedefine 10 yıl içinde ulaşılamıyor.`
      : delayed
        ? `${goalName} hedefin ${days} gün gecikti.`
        : `${goalName} için tahmini tarihin değişmedi.`;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-20 z-50 mx-auto flex max-w-sm items-start gap-3 rounded-xl border border-line bg-surface p-4 shadow-lg md:inset-x-auto md:right-6 md:bottom-6"
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          delayed || days === null ? "bg-warning-soft text-warning" : "bg-positive-soft text-positive"
        }`}
      >
        {delayed || days === null ? <Hourglass size={16} /> : <CircleCheck size={16} />}
      </span>
      <div className="flex-1 text-sm">
        <p className="font-medium">Harcama eklendi</p>
        <p className="text-muted">{message}</p>
        {newDate && <p className="mt-0.5 text-xs text-muted">Yeni tahmini tarih: {dateFormatter.format(new Date(newDate))}</p>}
      </div>
      <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="text-subtle hover:text-ink">
        <X size={16} />
      </button>
    </div>
  );
}
