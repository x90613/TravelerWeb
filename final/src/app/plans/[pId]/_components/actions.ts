import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, plansToUsersTable } from "@/db/schema";

export async function getPlanAuthors(pId: string) {
  const dbAuthors = await db.query.plansToUsersTable.findMany({
    where: eq(plansToUsersTable.planId, pId),
    with: {
      user: {
        columns: {
          displayId: true,
          username: true,
          email: true,
        },
      },
    },
    columns: {},
  });

  const authors = dbAuthors.map((dbAuthor) => {
    const author = dbAuthor.user;
    return {
      id: author.displayId,
      username: author.username,
      email: author.email,
    };
  });

  return authors;
}

export const addPlanAuthor = async (pId: string, email: string) => {
  // Find the user by email
  const [user] = await db
    .select({
      displayId: usersTable.displayId,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (!user) {
    return false;
  }
  console.log("123");
  
  await db.insert(plansToUsersTable).values({
    planId: pId,
    userId: user.displayId,
  });
};
