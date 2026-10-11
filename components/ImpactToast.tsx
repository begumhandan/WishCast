"use client";

import { useState } from "react";
import { formatDelay } from "@/lib/closing";

export default function ImpactToast({ days, goalName }: { days: number; goalName: string }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div
      role="status"
      className="flex items-start justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"
    >
      <span>
        ⏳ Bu harcama <strong>{goalName}</strong> hedefini <strong>{formatDelay(days)}</strong> geciktirdi.
      </span>
      <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="text-amber-700">
        ✕
      </button>
    </div>
  );
}