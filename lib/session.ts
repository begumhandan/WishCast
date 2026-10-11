import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * Oturumu okur. Önce `connection()` çağırarak Next.js'e bu kısmın her istekte
 * çalışması gerektiğini söyler; Auth.js'in içerdeki rastgele değer üretimi
 * (CSRF token) bu sayede önceden hazırlama (prerender) sırasında çalışmaz.
 */
export async function getSession() {
  await connection();
  return auth();
}

/** Oturumdaki kullanıcının id'sini döndürür. Giriş yapılmamışsa ana sayfaya yönlendirir. */
export async function requireUserId(): Promise<string> {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/");
  }
  return userId;
}