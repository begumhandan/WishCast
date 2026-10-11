import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarDays, Hourglass, TrendingUp, Wallet } from "lucide-react";
import Logo from "@/components/Logo";
import { signIn } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { buttonPrimary } from "@/lib/ui";

const FEATURES = [
  { icon: Wallet, title: "Günlük limit", text: "Hedefinden şaşmadan bugün ne kadar harcayabileceğini bil." },
  { icon: Hourglass, title: "Harcamanın bedeli", text: "Her harcamanın hedefini kaç gün geciktirdiğini anında gör." },
  { icon: TrendingUp, title: "Enflasyona hazır", text: "Fiyatlar artarken bile gerçekçi bir kavuşma tarihi." },
];

const BARS = [32, 54, 18, 72, 40, 0, 26, 64, 48, 12, 58, 36, 22, 44];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <Suspense>
          <SignInButton variant="nav" />
        </Suspense>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="mx-auto flex max-w-2xl flex-col items-center pb-16 pt-16 text-center sm:pt-24">
          <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
            Kişisel bütçe · Hedef tahmini
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            İstediğin şeye kavuşacağın günü bil.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted text-balance">
            Gelirini ve hedefini gir. WishCast her gün ne kadar harcayabileceğini ve hedefine ne zaman ulaşacağını hesaplasın.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="h-10 w-48 animate-pulse rounded-lg bg-surface-hover" />}>
              <SignInButton variant="hero" />
            </Suspense>
          </div>
        </section>

        {/* Ürün önizlemesi (statik) */}
        <section aria-label="Uygulama önizlemesi" className="mx-auto max-w-4xl rounded-2xl border border-line bg-panel p-2 shadow-2xl shadow-black/5">
          <div className="grid gap-2 rounded-xl border border-line bg-bg p-4 sm:grid-cols-3">
            <div className="rounded-lg border border-line p-4 sm:col-span-2">
              <p className="text-xs font-medium text-muted">Günlük harcama</p>
              <div className="mt-4 flex h-32 items-end gap-1.5" aria-hidden="true">
                {BARS.map((h, i) => (
                  <span key={i} className="flex-1 rounded-t bg-accent" style={{ height: `${Math.max(h, 3)}%`, opacity: h === 0 ? 0.25 : 1 }} />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="rounded-lg border border-line p-4">
                <p className="text-xs font-medium text-muted">Bugün harcayabileceğin</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-accent">₺1.240,00</p>
              </div>
              <div className="flex-1 rounded-lg border border-line p-4">
                <p className="text-xs font-medium text-muted">Yeni bilgisayar · %62</p>
                <div className="mt-2 h-1.5 rounded-full bg-surface-hover">
                  <div className="h-full w-[62%] rounded-full bg-accent" />
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium">
                  <CalendarDays size={14} className="text-subtle" /> 14 Şubat 2027
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-4xl gap-8 py-20 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-accent">
                <Icon size={18} />
              </span>
              <h2 className="mt-4 text-sm font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        WishCast · Next.js, Prisma ve Auth.js ile yapıldı
      </footer>
    </div>
  );
}

async function SignInButton({ variant }: { variant: "nav" | "hero" }) {
  const session = await getSession();
  if (session?.user && variant === "hero") {
    redirect("/dashboard");
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/dashboard" });
      }}
    >
      {variant === "nav" ? (
        <button type="submit" className="text-sm font-medium text-muted hover:text-ink">
          Giriş yap
        </button>
      ) : (
        <button type="submit" className={`${buttonPrimary} h-11 px-5`}>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub ile başla
          <ArrowRight size={16} />
        </button>
      )}
    </form>
  );
}
