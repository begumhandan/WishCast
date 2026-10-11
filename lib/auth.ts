import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  callbacks: {
    // Auth.js varsayılan olarak oturumda yalnızca isim, e-posta ve resim döndürür.
    // Kullanıcının kendi verilerini sorgulayabilmek için id'yi de ekliyoruz.
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});