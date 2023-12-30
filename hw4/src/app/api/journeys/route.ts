import { NextResponse, type NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { journeysTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

// 新增Journey
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { planId, title, start, end, location, note } = await req.json();

    // create journey
    const [res] = await db
      .insert(journeysTable)
      .values({
        plansId: planId,
        title: title,
        start: start,
        end: end,
        location: location,
        note: note,
      })
      .returning()
      .execute();

    // pusher
    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger(`private-${planId}`, "journey:update", {
      senderId: userId,
    });

    return NextResponse.json(
      {
        journey: res,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// 更新
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { planId, journeyId, title, start, end, location, note } = await req.json();

    const ret_journey = await db
      .update(journeysTable)
      .set({
        title: title,
        start: start,
        end: end,
        location: location,
        note: note,
      })
      .where(and(eq(journeysTable.displayId, journeyId)))
      .execute();

    // pusher
    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger(`private-${planId}`, "journey:update", {
      senderId: userId,
    });

    return NextResponse.json(
      {
        journey: ret_journey,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
