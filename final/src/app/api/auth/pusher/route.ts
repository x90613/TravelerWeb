import { type NextRequest, NextResponse } from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher/server";
import { plansToUsersTable } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const socketId = data.get("socket_id") as string;
    const channel = data.get("channel_name") as string;

    // channel name is in the format: private-<docId>
    const pId = channel.slice(8);
    if (!pId) {
      return NextResponse.json(
        { error: "Invalid channel name" },
        { status: 400 },
      );
    }

    // Get the document from the database
    const [pOwnership] = await db
      .select()
      .from(plansToUsersTable)
      .where(
        and(
          eq(plansToUsersTable.userId, session.user.id),
          eq(plansToUsersTable.planId, pId),
        ),
      );
    if (!pOwnership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = {
      user_id: session.user.email,
    };

    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channel,
      userData,
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
      },
    );
  }
}
