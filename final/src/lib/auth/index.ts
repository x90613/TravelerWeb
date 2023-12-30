import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import CredentialsProvider from "./CredentialsProvider";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.calendars.readonly https://www.googleapis.com/auth/calendar.events.owned",
          // Add other scopes as needed
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHub,
    CredentialsProvider,
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (!account) return token;
      const { name, email } = token;
      const provider = account.provider;
      if (!name || !email || !provider) return token;
      token.access_token = account.access_token;
      const [existedUser] = await db
        .select({
          id: usersTable.displayId,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email.toLowerCase()))
        .execute();
      if (existedUser) {
        // Update user's token
        await db
          .update(usersTable)
          .set({ token: account.access_token })
          .where(eq(usersTable.email, email.toLowerCase()))
          .execute();
        return token;
      }
      if (provider !== "google") return token;

      // Sign up new user

      if (account) {
        token = Object.assign({}, token, {
          access_token: account.access_token,
        });
      }
      await db.insert(usersTable).values({
        username: name,
        email: email.toLowerCase(),
        provider,
        token: account.access_token,
      });

      return token;
    },

    async session({ session, token }) {
      const email = token.email || session?.user?.email;
      if (!email) return session;
      const [user] = await db
        .select({
          id: usersTable.displayId,
          username: usersTable.username,
          provider: usersTable.provider,
          email: usersTable.email,
          access_token: usersTable.token,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email.toLowerCase()))
        .execute();

      return {
        ...session,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          provider: user.provider,
          token: user.access_token,
        },
      };
    },
  },
  pages: {
    signIn: "/",
  },
});
