import { Suspense } from "react";
import { auth, signIn, signOut } from "@/lib/auth";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      {/* Sabit kısım: önceden hazırlanır, anında görünür */}
      <h1 className="text-5xl font-bold">🔮 WishCast</h1>
      <p className="text-lg text-gray-500">Forecast the day you get what you want.</p>

      {/* Oturuma bağlı kısım: her istekte hesaplanır */}
      <Suspense fallback={<p className="text-gray-400">Yükleniyor…</p>}>
        <AuthSection />
      </Suspense>
    </main>
  );
}

async function AuthSection() {
  const session = await auth();

  if (!session?.user) {
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

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-2xl font-semibold">Merhaba, {session.user.name} 👋</p>
      <p className="text-gray-500">Pano yakında burada olacak.</p>
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