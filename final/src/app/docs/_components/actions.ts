import { eq } from "drizzle-orm";

import { db } from "@/db";
import { documentsTable, usersToDocumentsTable } from "@/db/schema";

export const createDocument = async (userId: string) => {
  "use server";
  console.log("[createDocument]");

  const newDocId = await db.transaction(async (tx) => {
    const [newDoc] = await tx
      .insert(documentsTable)
      .values({
        title: "New Document",
        content: "This is a new document",
      })
      .returning();
    await tx.insert(usersToDocumentsTable).values({
      userId: userId,
      documentId: newDoc.displayId,
    });
    return newDoc.displayId;
  });
  return newDocId;
};

export const getDocuments = async (userId: string) => {
  "use server";

  const documents = await db.query.usersToDocumentsTable.findMany({
    where: eq(usersToDocumentsTable.userId, userId),
    with: {
      document: {
        columns: {
          displayId: true,
          title: true,
        },
      },
    },
  });
  return documents;
};

export const deleteDocument = async (documentId: string) => {
  "use server";
  console.log("[deleteDocument]");
  await db
    .delete(documentsTable)
    .where(eq(documentsTable.displayId, documentId));
  return;
};
