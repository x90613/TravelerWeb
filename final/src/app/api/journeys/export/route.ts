import { NextResponse, type NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";
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
    console.log(token);

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

    console.log("jorneys", journeys);

    const processedJourneys = journeys.map((journey) => {
      return {
        journeyId: journey.journeyId,
        title: journey.title,
        start: journey.start,
        end: journey.end,
        location: journey.location,
        note: journey.note,
      };
    });

    console.log("processedJourneys", processedJourneys);

    const [plan] = await db
      .select({
        name: plansTable.name,
        description: plansTable.description,
      })
      .from(plansTable)
      .where(and(eq(plansTable.displayId, planId)))
      .execute();

    console.log("plan", plan);
    // add calendar
    // See: https://developers.google.com/calendar/api/v3/reference/calendars/insert?hl=zh-tw
    const addCalendar = async (
      token: string,
      title: string,
      description: string,
    ) => {
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
        },
      );

      const data = await response.json();
      return data.id;
    };

    // handler to add an event
    const addEvent = async (
      token: string | null,
      title: string,
      start: string,
      end: string,
      location: string,
      note: string,
      calendarId: string,
    ) => {
      // Ensure token and calendarId are provided
      if (!token) {
        throw new Error("Token is required");
      }

      const eventData = {
        summary: title, // summary = title
        start: {
          dateTime: `${start}:00`, // Start time in RFC3339 format
          timeZone: "Asia/Taipei", // Sets the current time zone
        },
        end: {
          dateTime: `${end}:00`,
          timeZone: "Asia/Taipei", // Sets the current time zone
        },
        location: location,
        description: note, // note = description
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData), // Make sure eventDetails are passed to the function
        },
      );
      // Check for response status
      if (!response.ok) {
        throw new Error(`Error add event: ${response.status}`);
      }

      const data = await response.json();
      return data;
    };

    // const addEvents = async (token:string, journeys: any[], calendarId: any) => {
    //   const eventPromises = journeys.map((journey: any) =>
    //     addEvent(token, journey.title, journey.start, journey.end, journey.location, journey.note, calendarId)
    //   );

    //   return Promise.all(eventPromises);
    // };

    const CalendarId = await addCalendar(token, plan.name, plan.description);
    console.log(CalendarId);
    // addEvent(token, journeys[0].title, journeys[0].start, journeys[0].end, journeys[0].location, journeys[0].note, CalendarId);
    // addEvent(token, journeys[1].title, journeys[1].start, journeys[1].end, journeys[1].location, journeys[1].note, CalendarId);
    for (let i = 0; i < journeys.length; i++) {
      addEvent(
        token,
        journeys[i].title,
        journeys[i].start,
        journeys[i].end,
        journeys[i].location,
        journeys[i].note,
        CalendarId,
      );
    }
    // addEvents(token, processedJourneys, CalendarId);

    console.log("export complete");

    return NextResponse.json(
      {
        plan: plan,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
