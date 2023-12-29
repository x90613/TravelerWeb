import { NextResponse, type NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { plansTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

// DELETE /api/plans/:planId
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      planId: string;
    };
  },
) {
  // const dummyFun = (x) => {
  //   return x;
  // }

  // dummyFun(req);

  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // const [plan] = await db
    //   .select({
    //     chatId: chatsTable.displayId,
    //     userId1: chatsTable.userId1,
    //     userId2: chatsTable.userId2,
    //   })
    //   .from(chatsTable)
    //   .where(and(eq(chatsTable.displayId, params.chatId)))
    //   .execute();

    // if (!chatroom) {
    //   return NextResponse.json(
    //     { error: "Chatroom not found" },
    //     { status: 404 },
    //   );
    // }

    // if (chatroom.userId1 !== userId && chatroom.userId2 !== userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    await db
      .delete(plansTable)
      .where(eq(plansTable.displayId, params.planId))
      .execute();

    // make sure the chatroom is deleted
    const [deletedPlan] = await db
      .select({
        planId: plansTable.displayId,
      })
      .from(plansTable)
      .where(and(eq(plansTable.displayId, params.planId)))
      .execute();

    if (deletedPlan) {
      return NextResponse.json({ error: "Plan not deleted" }, { status: 500 });
    }

    // let otherUserId;
    // if (chatroom.userId1 === userId) {
    //   otherUserId = chatroom.userId2;
    // } else {
    //   otherUserId = chatroom.userId1;
    // }

    // // pusher socket
    // const pusher = new Pusher({
    //   appId: privateEnv.PUSHER_ID,
    //   key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
    //   secret: privateEnv.PUSHER_SECRET,
    //   cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
    //   useTLS: true,
    // });

    // await pusher.trigger(`private-${otherUserId}`, "chatrooms:update", {
    //   senderId: userId,
    // });

    // return
    return NextResponse.json(
      {
        OK: true,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
