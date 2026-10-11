import Link from "next/link";
import { Suspense } from "react";
import { signIn, signOut } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { formatTL } from "@/lib/money";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-5xl font-bold">🔮 WishCast</h1>
      <p className="text-lg text-gray-500">Forecast the day you get what you want.</p>

      <Suspense fallback={<p className="text-gray-400">Yükleniyor…</p>}>
        <AuthSection />
      </Suspense>
    </main>
  );
}

async function AuthSection() {
  const session = await getSession();

  if (!session?.user?.id) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button
          type="submit"
          className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
        >
          GitHub ile giriş yap
        </button>
      </form>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { monthlyIncome: true, goals: { take: 1 } },
  });
  const goal = user?.goals[0];

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-2xl font-semibold">Merhaba, {session.user.name} 👋</p>

      {!user?.monthlyIncome ? (
        <NextStep href="/onboarding" text="Başlamak için gelirini ve giderlerini gir" />
      ) : !goal ? (
        <NextStep href="/goal" text="Şimdi hedefini belirle" />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-600">
            Hedefin: <strong>{goal.name}</strong> ({formatTL(goal.price)})
          </p>
          <p className="text-gray-400">Pano 8. adımda burada olacak.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/onboarding" className="underline">Gelir ve giderler</Link>
            <Link href="/goal" className="underline">Hedefi düzenle</Link>
          </div>
        </div>
      )}

      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit" className="rounded-lg border px-4 py-2 hover:bg-gray-100">
          Çıkış yap
        </button>
      </form>
    </div>
  );
}

function NextStep({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
    >
      {text} →
    </Link>
  );
}