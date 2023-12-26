import { NextResponse, type NextRequest } from "next/server";

// import { and, eq } from "drizzle-orm";
// import Pusher from "pusher";

import { db } from "@/db";
import { journeysTable } from "@/db/schema";
import { auth } from "@/lib/auth";
// import { privateEnv } from "@/lib/env/private";
// import { publicEnv } from "@/lib/env/public";

// POST /api/journeys/:planId(建在哪個plan下)
// Create a new journey.
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      planId: string;
    };
  },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { title, start, end, location, note } = await req.json();

    // create journey
    console.log("[createJourney]");

    const newJourneyId = await db.transaction(async (tx) => {
        const [newJourney] = await tx
        .insert(journeysTable)
        .values({
            title: "New Plan",
            start: "write",
            end: "write",
            location: "write",
            note: "write",
            plansId: params.planId,
        })
        .returning();
        return newJourney.displayId;
    });
    return newJourneyId;

//     // pusher
//     const pusher = new Pusher({
//       appId: privateEnv.PUSHER_ID,
//       key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
//       secret: privateEnv.PUSHER_SECRET,
//       cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
//       useTLS: true,
//     });

//     await pusher.trigger(`private-${userId}`, "journey:update", {
//       senderId: userId,
//     });

//     return NextResponse.json(
//       {
//         message: res,
//       },
//       { status: 200 },
//     );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}