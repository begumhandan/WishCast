import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { card } from "@/lib/ui";

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: ReactNode;
  tone?: "default" | "accent" | "negative";
};

export default function StatCard({ label, value, icon: Icon, hint, tone = "default" }: Props) {
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center justify-between text-muted">
        <span className="text-xs font-medium">{label}</span>
        <Icon size={15} className={tone === "accent" ? "text-accent" : "text-subtle"} />
      </div>
      <p
        className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${
          tone === "accent" ? "text-accent" : tone === "negative" ? "text-negative" : ""
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
