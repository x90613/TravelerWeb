import { eq } from "drizzle-orm";

import { db } from "@/db";
import { plansTable, plansToUsersTable } from "@/db/schema";

export const createPlan = async (userId: string) => {
  "use server";
  console.log("[createPlan]");

  const newPlanId = await db.transaction(async (tx) => {
    const [newPlan] = await tx
      .insert(plansTable)
      .values({
        name: "New Plan",
        description: "write some description",
      })
      .returning();
    await tx.insert(plansToUsersTable).values({
      userId: userId,
      planId: newPlan.displayId,
    });
    return newPlan.displayId;
  });
  return newPlanId;
};

export const getPlans = async (userId: string) => {
  "use server";

  // 用with就可以拿到對應的table下的columns
  const plans = await db.query.plansToUsersTable.findMany({
    where: eq(plansToUsersTable.userId, userId),
    with: { 
      plan: { 
        columns: {
          displayId: true,
          name: true,
        },
      },
    },
  });
  return plans;
};

export const deletePlan = async (planId: string) => {
  "use server";
  console.log("[deletePlan]");
  await db
    .delete(plansTable)
    .where(eq(plansTable.displayId, planId));
  return;
};
