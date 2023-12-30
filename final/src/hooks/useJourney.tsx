import {
  useEffect,
  useState,
  useContext,
  useCallback,
  createContext,
} from "react";

import { useSession } from "next-auth/react";
import { useParams, useRouter} from "next/navigation";
import { pusherClient } from "@/lib/pusher/client";
import usePlans from "./usePlans";


type PusherPayload = {
  senderId: string;
};

type JourneyContextType = {
  journeys: any;
  currentPlan: any;
  addJourney: any;
  deleteJourney: any;
  updateJourney: any;
  exportJourney: any;
};

const JourneyContext = createContext<JourneyContextType | null>(null);

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const { plans, fetchPlans } = usePlans();
  const { planId } = useParams();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  // const pathname = usePathname();
  // const token = session?.user?.token;
  const [journeys, setJourneys] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    if (!planId) return;
    const plan = plans.find((plan) => plan.planId === planId);

    setCurrentPlan(plan);
  }, [planId, plans]);

  const fetchJourneys = useCallback(async () => {
    if (!planId) return;
    const ret = await fetch(`/api/journeys/${planId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!ret.ok) {
      const error_data = await ret.json();
      console.log(error_data.error);

      // redirect to home page
      router.push("/plan");
      return;
    }
    const data = await ret.json();
    setJourneys(data.journeys);
  }, [planId]);

  useEffect(() => {
    if (!planId) return;
    fetchJourneys();
  }, [planId, fetchJourneys]);


  // pusher for listening share events
  useEffect(() => {
    if(!userId) return; 
    console.log()
    
    const channelName = `private-${userId}`
    try {
      const channel = pusherClient.subscribe(channelName);
      channel.bind("plans:update", async({ senderId }: PusherPayload) => {
        if(senderId === userId){// don't update events that are trigged by myself
          return;
        }
        await fetchPlans();
      });
    } catch (error) {
      console.log(error);
    }

    return() => {
      pusherClient.unsubscribe(channelName);
    };
  },[userId, fetchPlans, fetchJourneys])

  
  // pusher for listening update events
  useEffect(() => {
    if(!userId) return; 
    
    const channelName2 = `private-${planId}`

    try {
      const channel = pusherClient.subscribe(channelName2);
      channel.bind("journey:update", async({ senderId }: PusherPayload) => {
        if(senderId === userId){
          return;
        }
        await fetchPlans();
        await fetchJourneys();
      });
    } catch (error) {
      console.log(error);
    }

    return() => {
      pusherClient.unsubscribe(channelName2);
    };
  },[userId, planId, fetchPlans, fetchJourneys])



  const addJourney = async (
    title: string,
    start: string,
    end: string,
    location: string,
    note: string,
  ) => {
    const res = await fetch(`/api/journeys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId: planId,
        title: title,
        start: start,
        end: end,
        location: location,
        note: note,
      }),
    });
    if (!res.ok) {
      return res;
    }
    const data = await res.json();
    await fetchJourneys(); // 更新Journeys
    fetchPlans(); // 更新plan
    // console.log(data)
    return data;
  };

  const deleteJourney = async (journeyId: string) => {
    const res = await fetch(`/api/journeys/${journeyId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId: planId,
      }),
    });
    if (!res.ok) {
      return res;
    }
    const data = await res.json();
    await fetchJourneys();
    fetchPlans();
    return data;
  };

  const updateJourney = async (
    journeyId: string,
    title: string,
    start: string,
    end: string,
    location: string,
    note: string,
  ) => {
    const res = await fetch(`/api/journeys`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId: planId,
        journeyId: journeyId,
        title: title,
        start: start,
        end: end,
        location: location,
        note: note,
      }),
    });
    if (!res.ok) {
      return res;
    }
    const data = await res.json();
    await fetchJourneys();
    fetchPlans();
    return data;
  };

  const exportJourney = async () => {
    const res = await fetch("/api/journeys/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId: planId,
      }),
    });
  };

  return (
    <JourneyContext.Provider
      value={{
        journeys,
        currentPlan,
        addJourney,
        deleteJourney,
        updateJourney,
        exportJourney,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (context === null) {
    throw new Error("useJourney must be used within a JourneyProvider");
  }
  return context;
}
