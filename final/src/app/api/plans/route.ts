import { NextResponse, type NextRequest } from "next/server";
import Pusher from "pusher";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  usersToPlansTable,
  plansTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

// To get All plans
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const plans = await db.query.usersToPlansTable.findMany({
      where: eq(usersToPlansTable.userId, userId),
      with: {
        plan: {
          columns: {
            displayId: true,
            name: true,
            description: true,
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

// To add a new plan
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const planName = body.planName;
    const description = body.description;

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
          name: planName,
          description: description,
        })
        .returning();
      await tx.insert(usersToPlansTable).values({
        userId: userId,
        planId: newPlan.displayId,
      });
      return newPlan;
    });


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

// To update the plan
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { planId, name, description } = await req.json();

    const ret_plan = await db
      .update(plansTable)
      .set({
        name: name,
        description: description,
      })
      .where(and(eq(plansTable.displayId, planId)))
      .execute();

    const userIds = await db.query.usersToPlansTable.findMany({
      where: eq(usersToPlansTable.planId, planId),
      with: {
        user: {
          columns: {
            displayId: true,
          },
        },
      },
    });

    // pusher socket
    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });


    for (const item of userIds) {
      await pusher.trigger(`private-${item.userId}`, "plans:update", {
        senderId: userId,
      });
    }

    // return
    return NextResponse.json(
      {
        plan: ret_plan,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
