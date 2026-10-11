import { Sparkles } from "lucide-react";

export default function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-on-accent shadow-sm">
        <Sparkles size={15} strokeWidth={2.25} />
      </span>
      {withText && <span className="text-[15px] font-semibold tracking-tight">WishCast</span>}
    </span>
  );
}
