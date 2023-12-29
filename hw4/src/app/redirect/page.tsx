// redirect user
// import { useEffect } from "react";
import { redirect } from "next/navigation";
// import { useRouter } from 'next/navigation'
// import { useRouter } from "next/router";
import { NextResponse } from "next/server";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { plansTable, usersToPlansTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function RedirectPage() {
  // get user session
  const session = await auth();
  if (!session || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  // const router = useRouter();

  const fetchAndRedirect = async () => {
    try {
      const plans = await db.query.usersToPlansTable.findMany({
        where: eq(usersToPlansTable.userId, userId),
        with: {
          plan: {
            columns: {
              displayId: true,
              name: true,
            },
          },
        },
      });
      // return plans;

      // const chatrooms = res.rows;
      // const firstChatroomId = chatrooms[0].id;
      // const firstPlan = plans.id;

      redirect(`/plan/${plans}`);
    } catch (e) {
      redirect(`/plan`);
    }
  };

  setTimeout(() => {
    fetchAndRedirect();
  }, 1000);

  return <></>;
}
