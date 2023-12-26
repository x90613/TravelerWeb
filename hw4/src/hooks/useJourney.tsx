import {
  useEffect,
  useState,
  useContext,
  useCallback,
  createContext,
} from "react";

import { useSession } from "next-auth/react";
import { useParams, useRouter, usePathname } from "next/navigation";

import { pusherClient } from "@/lib/pusher/client";

import usePlans from "./usePlans";

type PusherPayload = {
  senderId: string;
};

type JourneyContextType = {
  journeys: any;
  currentPlan: any;
  sendJourney: any;
  deleteJourney: any;
};

const JourneyContext = createContext<JourneyContextType | null>(null);

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const { plans, fetchPlans } = usePlans();
  const { planId } = useParams();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const pathname = usePathname();

  const [journeys, setJourneys] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    if (!planId) return;
    // find the chatroom
    const plan = plans.find((plan: { id: string | string[]; }) => plan.id === planId);

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

      // // redirect to home page
      // router.push("/chat");
      return;
    }
    const data = await ret.json();
    setJourneys(data.journeys);
  }, [planId]);

  useEffect(() => {
    if (!planId) return;
    fetchJourneys();
  }, [planId, fetchJourneys]);

  // pusher段落
  // useEffect(() => {
  //   const callbackFun = async () => {
  //     if (!userId) return;
  //     const channelName = `private-${userId}`;
  //     try {
  //       const channel = pusherClient.subscribe(channelName);
  //       channel.bind("chatrooms:update", async ({ senderId }: PusherPayload) => {
  //         if (senderId === userId) {
  //           return;
  //         }
  //         await fetchChatrooms();
  //       });
  //       channel.bind("chat:update", async ({ senderId }: PusherPayload) => {
  //         if (senderId === userId) {
  //           return;
  //         }
  //         await fetchMessages();
  //         await fetchChatrooms();
  //       });
  //     } catch (error) {
  //       console.log(error);
  //     }

  //     return () => {
  //       pusherClient.unsubscribe(channelName);
  //     };
  //   };
  //   callbackFun();
  // }, [userId, fetchChatrooms, fetchMessages]);

  // useEffect(()=>{
  //   if (chatId) {
  //     const chatroom = chatrooms.find(
  //       (chatroom) => chatroom.id === chatId,
  //     );
  //     if (!chatroom) {
  //       router.push("/chat");
  //     }
  //   }
  //   else{
  //     // check if is at /chat
  //     if (pathname === "/chat" && chatrooms.length > 0) {
  //       // get first chatroom
  //       const chatroom = chatrooms[0];
  //       // redirect to first chatroom
  //       router.push(`/chat/${chatroom.id}`);
  //     }
  //   }
  // }, [chatrooms, router, pathname, chatId])

  const sendJourney = async (content: string) => {
    const res = await fetch(`/api/journeys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId: planId,
        title: "test",
        start: "test",
        end: "test",
        location: "test",
        note: "test",
      }),
    });
    if (!res.ok) {
      return res;
    }
    const data = await res.json();
    await fetchJourneys(); // 更新Journeys
    fetchPlans(); // 更新plan
    return data;
  };

  const deleteJourney = async (journeyId: string) => {
    const res = await fetch(`/api/journeys/${journeyId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      return res;
    }
    const data = await res.json();
    await fetchJourneys();
    fetchPlans();
    return data;
  };

  return (
    <JourneyContext.Provider
      value={{
        journeys,
        currentPlan,
        sendJourney,
        deleteJourney,
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
