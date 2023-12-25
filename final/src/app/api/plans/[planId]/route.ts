import { NextResponse, type NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { plansTable, plansToUsersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";
import { updatePSchema } from "@/validators/updatePlan";
import { PlanData } from "@/lib/types/db";

// GET /api/plans/:planId
export async function GET(
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
    // Get user from session
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    
    // Get the plan
    const dbPlan = await db.query.plansToUsersTable.findFirst({
      where: and(
        eq(plansToUsersTable.userId, userId),
        eq(plansToUsersTable.planId, params.planId),
      ),
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
    if (!dbPlan?.plan) {
      return NextResponse.json({ error: "Doc Not Found" }, { status: 404 });
    }

    const plan = dbPlan.plan;
    return NextResponse.json(
      {
        id: plan.displayId,
        name: plan.name,
        description: plan.description,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

// PUT /api/plans/:planId
export async function PUT(
  req: NextRequest,
  { params }: { params: { planId: string } },
) {
  try {
    // Get user from session
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Check ownership of plan
    const [p] = await db
      .select({
        planId: plansToUsersTable.planId,
      })
      .from(plansToUsersTable)
      .where(
        and(
          eq(plansToUsersTable.userId, userId),
          eq(plansToUsersTable.planId, params.planId),
        ),
      );
    if (!p) {
      return NextResponse.json({ error: "Doc Not Found" }, { status: 404 });
    }

    // Parse the request body
    const reqBody = await req.json();
    let validatedReqBody: Partial<Omit<PlanData, "id">>;
    try {
      validatedReqBody = updatePSchema.parse(reqBody);
    } catch (error) {
      console.log("fail this shit")
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    // console.log("validatedReqBody: ",validatedReqBody)
    // Update document
    const [updatedP] = await db
      .update(plansTable)
      .set(validatedReqBody)
      .where(eq(plansTable.displayId, params.planId))
      .returning();

    // Trigger pusher event
    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    // Private channels are in the format: private-...
    await pusher.trigger(`private-${updatedP.displayId}`, "p:update", {
      senderId: userId,
      plan: {
        id: updatedP.displayId,
        name: updatedP.name,
        description: updatedP.description,
      },
    });

    return NextResponse.json(
      {
        id: updatedP.displayId,
        name: updatedP.name,
        description: updatedP.description,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
