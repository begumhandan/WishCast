import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import NavLinks from "@/components/shell/NavLinks";
import UserMenu from "@/components/shell/UserMenu";

/** Giriş yapılmış sayfaların ortak iskeleti: masaüstünde kenar menü, mobilde üst bar + alt sekmeler. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
      {/* Masaüstü kenar menü */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-panel px-3 py-4 md:flex">
        <Link href="/dashboard" className="px-2.5 pb-5">
          <Logo />
        </Link>
        <nav aria-label="Ana menü">
          <NavLinks variant="sidebar" />
        </nav>
        <div className="mt-auto border-t border-line px-1 pt-3">
          <Suspense fallback={<div className="h-8 animate-pulse rounded-md bg-surface-hover" />}>
            <UserMenu />
          </Suspense>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobil üst bar */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur md:hidden">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <Suspense>
            <UserMenu compact />
          </Suspense>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8">{children}</main>
      </div>

      {/* Mobil alt sekmeler */}
      <nav aria-label="Ana menü" className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <NavLinks variant="bottom" />
      </nav>
    </div>
  );
}
