import { useEffect, useMemo,useState } from "react";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

import { useDebounce } from "use-debounce";

import { pusherClient } from "@/lib/pusher/client";
import type { JourneyData, PlanData, User } from "@/lib/types/db";


type PusherPayload = {
  senderId: User["id"];
  plan: PlanData;
};

export const useJourney = () => {
    const { pId } = useParams();
    const planId = Array.isArray(pId) ? pId[0] : pId;
    const router = useRouter();

    const [journey, setJourney] = useState<JourneyData | null>(null)
    // const [title, setTitle] = useState<string>()
    // const [start, setStart] = useState<string>()
    // const [end, setEnd] = useState<string>()
    // const [note, setNote] = useState<string>()
    // const [description, setDescription] = useState<string>()


    const createJourney = async () => {
        const res = await fetch(`/api/journeys/${planId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "New Plan",
            start: "write",
            end: "write",
            location: "write",
            note: "write",
            plansId: planId,
          }),
        });
        if (!res.ok) {
          console.log("usePlan error1")
          return;
        }
        const data: PlanData = await res.json();
        // Update the navbar if the title changed
        router.refresh();
    };  

    
  return {
    createJourney,
  };
};
