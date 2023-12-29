import { NextResponse, type NextRequest } from "next/server";

import {and, eq } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { plansTable, journeysTable } from "@/db/schema";
import { auth } from "@/lib/auth";



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



    const journeys = await db
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

    console.log("jorneys",journeys)

    const processedJourneys = journeys.map((journey) => {
      return {
        journeyId: journey.journeyId,
        title: journey.title,
        start: journey.start,
        end: journey.end,
        location: journey.location,
        note: journey.note,
      };
    })

    console.log("processedJourneys",processedJourneys)

    const [plan] = await db
    .select({
      name: plansTable.name,
      description: plansTable.description,
    })
    .from(plansTable)
    .where(and(eq(plansTable.displayId, planId)))
    .execute();


    console.log("plan",plan)
     // add calendar
    // See: https://developers.google.com/calendar/api/v3/reference/calendars/insert?hl=zh-tw
  const addCalendar = async (token:string, title:string, description:string) => {
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: title,
          description: description,
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
  const eventData = {
    summary: "washi o lan", // summary = title
    start: {
      dateTime: "2023-12-29T15:00:00", // Start time in RFC3339 format
      timeZone: "Asia/Taipei", // Sets the current time zone
    },
    end: {
      dateTime: "2023-12-29T19:00:00",
      timeZone: "Asia/Taipei", // Sets the current time zone
    },
    location: "Taipei",
    description: "I wanna pass Web programming", // note = description
  };
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
        dateTime: "2023-12-29T15:00:00", // Start time in RFC3339 format
        timeZone: "Asia/Taipei", // Sets the current time zone
      },
      end: {
        dateTime: "2023-12-29T19:00:00",
        timeZone: "Asia/Taipei", // Sets the current time zone
      },
      location: "Taipei",
      description: "I wanna pass Web programming", // note = description
    };

    
    const CalendarId = await addCalendar(token, plan.name, plan.description);
    addEvent(token, eventData, CalendarId);
    console.log("export complete")

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

