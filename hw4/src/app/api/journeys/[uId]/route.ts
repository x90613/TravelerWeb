import { NextResponse, type NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { plansTable, journeysTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      uId: string;
    };
  },
) {
  try {
    const planId = params.uId;
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // check if the chatroom exists
    // const [chatroom] = await db
    //   .select({
    //     id: plansTable.id,
    //     userId1: plansTable.userId1,
    //     userId2: plansTable.userId2,
    //   })
    //   .from(plansTable)
    //   .where(and(eq(plansTable.displayId, planId)));

    // if (!chatroom) {
    //   return NextResponse.json({ error: "Chatroom not found" }, { status: 404 });
    // }

    const journeys = await db
      .select({
        journeyId: journeysTable.displayId,
        title: journeysTable.title,
        start: journeysTable.start,
        end: journeysTable.end,
        location: journeysTable.location,
        note: journeysTable.note,
      })
      .from(journeysTable)
      .where(and(eq(journeysTable.plansId, planId)))
      .orderBy(journeysTable.start)
      .execute();

    return NextResponse.json(
      {
        journeys: journeys,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      uId: string;
    };
  },
) {
  try {
    const journeyId = params.uId;
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // delete the journey
    await db
      .delete(journeysTable)
      .where(eq(journeysTable.displayId, journeyId));

    // pusher socket
    // TODO
    // const pusher = new Pusher({
    //   appId: privateEnv.PUSHER_ID,
    //   key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
    //   secret: privateEnv.PUSHER_SECRET,
    //   cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
    //   useTLS: true,
    // });

    // await pusher.trigger(`private-${otherUserId}`, "chat:update", {
    //   senderId: userId,
    // });

    return NextResponse.json({ journey: "journey deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
