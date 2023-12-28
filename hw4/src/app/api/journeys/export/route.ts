import { NextResponse, type NextRequest } from "next/server";

import { ConsoleLogWriter, and, desc, eq, } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { plansTable, journeysTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { resourceUsage } from "process";
import { CalendarIcon } from "@radix-ui/react-icons";


// export journey
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { planId } = await req.json();
    const token = session.user.token;
    console.log(token)

    const [journeys] = await db
      .select({
        journeyId: journeysTable.displayId,
        title: journeysTable.title,
        start: journeysTable.start,
        end: journeysTable.end,
        location: journeysTable.location,
        note: journeysTable.note,
      })
      .from(journeysTable)
      .where(and(eq(journeysTable.plansId, planId)))
      // .orderBy(journeysTable.timestamp) //之後要加
      .execute();

    const [plan] = await db
    .select({
      name: plansTable.name,
      description: plansTable.description,
    })
    .from(plansTable)
    .where(and(eq(plansTable.displayId, planId)))
    .execute();
  
     // add calendar
    // See: https://developers.google.com/calendar/api/v3/reference/calendars/insert?hl=zh-tw
  const addCalendar = async (token:string) => {
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: "一起衝鋒",
          description: "This calendar is added by Google Calendar API",
        }),
      }
    );
    
    const data = await response.json();
    return data.id;
  };





    // handler to add an event
    const addEvent = async (token: string|null, eventDetails: object, calendarId: string) => {
  // Ensure token and calendarId are provided
  if (!token ) {
    throw new Error("Token is required");
  }

  // a function to add an event to Google Calendar
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventDetails), // Make sure eventDetails are passed to the function
  });

  // Check for response status
  if (!response.ok) {
    throw new Error(`Error add event: ${response.status}`);
  }

  const data = await response.json();
  return data;
    };
    const eventData = {
      summary: "washi o lan", // summary = title
      start: {
        dateTime: "2023-12-27T15:00:00", // Start time in RFC3339 format
        timeZone: "Asia/Taipei", // Sets the current time zone
      },
      end: {
        dateTime: "2023-12-27T19:00:00",
        timeZone: "Asia/Taipei", // Sets the current time zone
      },
      location: "Taipei",
      description: "I wanna pass Web programming", // note = description
    };


    
    const CalendarId = await addCalendar(token);
    addEvent(token, eventData, CalendarId);

    return NextResponse.json(
      {
        "plan": plan,
        
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

