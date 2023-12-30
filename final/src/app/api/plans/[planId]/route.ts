import { NextResponse, type NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { plansTable, usersTable, usersToPlansTable } from "@/db/schema";
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


  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;


    const userIds = await db.query.usersToPlansTable.findMany({
      where: eq(usersToPlansTable.planId, params.planId),
      with: {
        user: {
          columns: {
            displayId: true,
          },
        },
      },
    });
    await db
      .delete(plansTable)
      .where(eq(plansTable.displayId, params.planId))
      .execute();

    // make sure the plan is deleted
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
        OK: true,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}


// PUT /api/plans:planId
// To share the plan
export async function PUT(
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
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { email } = await req.json();

    const [user] = await db
      .select({
        displayId: usersTable.displayId,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));
    
    let status = "";
    if(!user){
      status = 'User does not exist.';;
    }else{
      const existingAssociation = await db
        .select()
        .from(usersToPlansTable)
        .where(and(eq(usersToPlansTable.planId, params.planId) 
                ,eq(usersToPlansTable.userId, user.displayId)))


      if (existingAssociation.length === 0) {
        await db.insert(usersToPlansTable).values({
          planId: params.planId,
          userId: user.displayId,
        });
      } else {
        status = 'User already associated with the plan.';
      }
    }

    // pusher
    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    const [targetUserId] = await db
      .select({
        displayId: usersTable.displayId,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));


    await pusher.trigger(`private-${targetUserId.displayId}`, "plans:update", {
      senderId: userId,
    });

    return NextResponse.json(
      {
        ok: true,
        status: status,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}