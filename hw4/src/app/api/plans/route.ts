import { NextResponse, type NextRequest } from "next/server";

import { and, eq, or, sql } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { usersTable, journeysTable, usersToPlansTable, plansTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

// GET /api/plans
// To get All plans
export async function GET(req: NextRequest) {
  try {
    // const dummyFun = (x) => {
    //   return x;
    // }

    // dummyFun(req);

    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // const tmp = await db.execute(sql`SELECT C.display_id as id, C.user_id1, C.user_id2, C.pinned_message_id, C.latest_message_id, U.username as username1, V.username as username2, null as latest_message_content, null as pinned_message_content, null as latest_message_timestamp, null as latest_message_sender_id, null as pinned_message_sender_id FROM chats as C JOIN users U ON C.user_id1 = U.display_id JOIN users V ON C.user_id2 = V.display_id WHERE (C.user_id1 = ${userId} OR C.user_id2 = ${userId}) AND ()`,)

    // const res = await db.execute(
    //   sql`SELECT C.display_id as id, C.user_id1, C.user_id2, C.pinned_message_id, C.latest_message_id, 
    //   U.username as username1, V.username as username2, M.content as latest_message_content, 
    //   N.content as pinned_message_content, M.timestamp as latest_message_timestamp, M.sender_id as latest_message_sender_id, N.sender_id as pinned_message_sender_id, M.is_visibled as latest_message_isvisible FROM chats as C JOIN users U ON C.user_id1 = U.display_id JOIN users V ON C.user_id2 = V.display_id LEFT JOIN messages M ON C.latest_message_id = M.display_id LEFT JOIN messages N ON C.pinned_message_id = N.display_id WHERE C.user_id1 = ${userId} OR C.user_id2 = ${userId} ORDER BY latest_message_timestamp DESC`,
    // );
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

    // return
    return NextResponse.json(
      {
        plans: plans,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// POST /api/plans
// To add a new plan
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // const targetUsername = body.username; //要共邊的目標

    // get target user id
    // const [targetUser] = await db
    //   .select({
    //     id: usersTable.displayId,
    //   })
    //   .from(usersTable)
    //   .where(eq(usersTable.username, targetUsername))
    //   .execute();

    // if (!targetUser) {
    //   return NextResponse.json(
    //     { error: "Target user does not exist" },
    //     { status: 404 },
    //   );
    // }
    // const targetUserId = targetUser.id; 原本是只跟一個人單向連結

    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;


    // create plan
    console.log("[createPlan]");

    const newPlan = await db.transaction(async (tx) => {
      const [newPlan] = await tx
        .insert(plansTable)
        .values({
          name: "New Plan",
          description: "write some description",
        })
        .returning();
      await tx.insert(usersToPlansTable).values({
        userId: userId,
        planId: newPlan.displayId,
      });
      return newPlan;
    });
    // return newPlanId;

    // pusher socket
    // const pusher = new Pusher({
    //   appId: privateEnv.PUSHER_ID,
    //   key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
    //   secret: privateEnv.PUSHER_SECRET,
    //   cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
    //   useTLS: true,
    // });

    // 改成監聽plans(?)
    // await pusher.trigger(`private-${targetUserId}`, "chatrooms:update", {
    //   senderId: userId,
    // });

    // return
    return NextResponse.json(
      {
        plan: newPlan,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
