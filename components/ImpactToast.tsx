"use client";

import { useEffect, useState } from "react";
import { Hourglass, X } from "lucide-react";
import { formatDelay } from "@/lib/closing";

export default function ImpactToast({ days, goalName }: { days: number; goalName: string }) {
  const [open, setOpen] = useState(true);

  // 6 saniye sonra kendiliğinden kapan
  useEffect(() => {
    const timer = setTimeout(() => setOpen(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (!open) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-20 z-50 mx-auto flex max-w-sm items-start gap-3 rounded-xl border border-line bg-surface p-4 shadow-lg md:inset-x-auto md:right-6 md:bottom-6"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
        <Hourglass size={16} />
      </span>
      <div className="flex-1 text-sm">
        <p className="font-medium">Harcama eklendi</p>
        <p className="text-muted">
          <span className="text-ink">{goalName}</span> hedefin <strong className="text-ink">{formatDelay(days)}</strong> gecikti.
        </p>
      </div>
      <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="text-subtle hover:text-ink">
        <X size={16} />
      </button>
    </div>
  );
}
