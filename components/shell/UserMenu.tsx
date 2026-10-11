import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { getSession } from "@/lib/session";

export default async function UserMenu({ compact = false }: { compact?: boolean }) {
  const session = await getSession();
  const user = session?.user;
  if (!user) return null;

  const initial = (user.name?.[0] ?? user.email?.[0] ?? "?").toLocaleUpperCase("tr-TR");

  return (
    <div className="flex items-center gap-2.5">
      {!compact && (
        <>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            {user.email && <p className="truncate text-xs text-muted">{user.email}</p>}
          </div>
        </>
      )}
      <form action={signOutAction}>
        <button type="submit" title="Çıkış yap" aria-label="Çıkış yap" className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-ink">
          <LogOut size={16} />
        </button>
      </form>
    </div>
  );
}
