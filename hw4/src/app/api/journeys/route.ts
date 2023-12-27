import { NextResponse, type NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { plansTable, journeysTable } from "@/db/schema";
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
// export async function PUT(req: NextRequest) {
//   try {
//     const session = await auth();
//     if (!session || !session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const userId = session.user.id;

//     const { messageId, method } = await req.json();

//     // check if the message exists
//     const [message] = await db
//       .select({
//         id: journeysTable.displayId,
//         senderId: journeysTable.senderId,
//         content: journeysTable.content,
//         chatId: journeysTable.chatId,
//         isVisible: journeysTable.isVisible,
//         timestamp: journeysTable.timestamp,
//       })
//       .from(journeysTable)
//       .where(and(eq(journeysTable.displayId, messageId)))
//       .execute();

//     if (!message) {
//       return NextResponse.json({ error: "Message not found" }, { status: 404 });
//     }

//     // check if method is "pin", "unpin", "invisible"
//     if (method !== "pin" && method !== "unpin" && method !== "invisible") {
//       return NextResponse.json(
//         { error: "Method not allowed" },
//         { status: 404 },
//       );
//     }

//     // check if the user is the sender of the message
//     if (method === "invisible" && message.senderId !== userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // get other use id
//     const [chatroom] = await db
//       .select({
//         userId1: plansTable.userId1,
//         userId2: plansTable.userId2,
//       })
//       .from(plansTable)
//       .where(and(eq(plansTable.displayId, message.chatId)))
//       .execute();

//     let otherUserId;
//     if (chatroom.userId1 === userId) {
//       otherUserId = chatroom.userId2;
//     } else {
//       otherUserId = chatroom.userId1;
//     }

//     let ret_message;

//     // pin the message
//     if (method === "pin") {
//       ret_message = await db
//         .update(plansTable)
//         .set({
//           pinnedMessageId: messageId,
//         })
//         .where(and(eq(plansTable.displayId, message.chatId)))
//         .execute();
//       // pusher
//       const pusher = new Pusher({
//         appId: privateEnv.PUSHER_ID,
//         key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
//         secret: privateEnv.PUSHER_SECRET,
//         cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
//         useTLS: true,
//       });

//       await pusher.trigger(`private-${otherUserId}`, "chatrooms:update", {
//         senderId: userId,
//       });
//     }
//     if (method === "unpin") {
//       // check if the message is pinned
//       const [chatroom] = await db
//         .select({
//           pinnedMessageId: plansTable.pinnedMessageId,
//         })
//         .from(plansTable)
//         .where(and(eq(plansTable.displayId, message.chatId)))
//         .execute();

//       if (chatroom.pinnedMessageId !== messageId) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//       }

//       ret_message = await db
//         .update(plansTable)
//         .set({
//           pinnedMessageId: null,
//         })
//         .where(and(eq(plansTable.displayId, message.chatId)))
//         .execute();

//       // pusher
//       const pusher = new Pusher({
//         appId: privateEnv.PUSHER_ID,
//         key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
//         secret: privateEnv.PUSHER_SECRET,
//         cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
//         useTLS: true,
//       });

//       await pusher.trigger(`private-${otherUserId}`, "chatrooms:update", {
//         senderId: userId,
//       });
//     }
//     if (method === "invisible") {
//       const [chatroom] = await db
//         .select({
//           pinnedMessageId: plansTable.pinnedMessageId,
//         })
//         .from(plansTable)
//         .where(and(eq(plansTable.displayId, message.chatId)))
//         .execute();

//       // pinned message cannot be invisible
//       if (chatroom.pinnedMessageId === messageId) {
//         return NextResponse.json(
//           { error: "Pinned message cannot be invisible" },
//           { status: 400 },
//         );
//       }

//       ret_message = await db
//         .update(journeysTable)
//         .set({
//           isVisible: false,
//         })
//         .where(and(eq(journeysTable.displayId, messageId)))
//         .execute();

//       // pusher
//       const pusher = new Pusher({
//         appId: privateEnv.PUSHER_ID,
//         key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
//         secret: privateEnv.PUSHER_SECRET,
//         cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
//         useTLS: true,
//       });

//       await pusher.trigger(`private-${otherUserId}`, "chat:update", {
//         senderId: userId,
//       });
//     }

//     // return
//     return NextResponse.json(
//       {
//         message: ret_message,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json({ error: "Error" }, { status: 500 });
//   }
// }
