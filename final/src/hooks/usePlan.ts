import { useEffect, useMemo,useState } from "react";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

import { useDebounce } from "use-debounce";

import { pusherClient } from "@/lib/pusher/client";
import type { PlanData, User } from "@/lib/types/db";

type PusherPayload = {
  senderId: User["id"];
  plan: PlanData;
};

export const usePlan = () => {
  const { pId } = useParams();
  const planId = Array.isArray(pId) ? pId[0] : pId;

  const [plan, setPlan] = useState<PlanData | null>(null);
  const [dbPlan, setDbPlan] = useState<PlanData | null>(null);
  // [NOTE] 2023.11.18 - Extracting the debounceMilliseconds to a constant helps ensure the two useDebounce hooks are using the same value.
  const debounceMilliseconds = 300; //超過300毫秒沒動作再存
  const [debouncedPlan] = useDebounce(plan, debounceMilliseconds);
  const [debouncedDbPlan] = useDebounce(dbPlan, debounceMilliseconds);
  const router = useRouter();

  const { data: session } = useSession();
  const userId = session?.user?.id;

  // [FIX] 2023.11.18 - This memo should compare the debounced values to avoid premature updates to the DB.
  const isSynced = useMemo(() => {
    if (debouncedPlan === null || debouncedDbPlan === null) return true;
    return (
        debouncedPlan.name === debouncedDbPlan.name &&
        debouncedPlan.description === debouncedDbPlan.description
    );
  }, [debouncedPlan, debouncedDbPlan]);

  // When the debounced document changes, update the document
  // [FIX] 2023.11.18 - Listen to debouncedDbDocument instead of dbDocument.
  // Explanation: This useEffect should trigger on the change of the debouncedDocument and debouncedDbDocument.
  //              Originally, it was triggered by debouncedDocument but dbDocument.
  //              Therefore, when the received pusher event updates the document and the dbDocument.
  //              This useEffect will trigger twice: one when dbDocument is updated and another when debouncedDocument is updated.
  //              However, the two updates PUTs sends conflicting pusher events to the other clients, causing the document to twitch indefinitely.
  useEffect(() => {
    // [NOTE] 2023.11.18 - If either of the debounced value is null, then `isSynced` must be true. 
    //                     Therefore, we don't need to explicitly check for their null values.
    if (isSynced) return;

    const updatePlan = async () => {
      if (!debouncedPlan) return;
      // [NOTE] 2023.11.18 - This PUT request will trigger a pusher event that will update the document to the other clients.
      const res = await fetch(`/api/plans/${planId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: debouncedPlan.name,
          description: debouncedPlan.description,
        }),
      });
      if (!res.ok) {
        console.log("usePlan error1")
        return;
      }
      const data: PlanData = await res.json();
      // Update the navbar if the title changed
      if (debouncedDbPlan?.name !== data.name) {
        router.refresh();
      }
      setDbPlan(data);
    };
    updatePlan();
  }, [debouncedPlan, planId, router, debouncedDbPlan, isSynced]);

  // Subscribe to pusher events
  useEffect(() => {
    if (!planId) return;
    // Private channels are in the format: private-...
    const channelName = `private-${planId}`;

    try {
      const channel = pusherClient.subscribe(channelName);
      channel.bind("p:update", ({ senderId, plan: received_document }: PusherPayload) => {
        if (senderId === userId) {
          return;
        }
        // [NOTE] 2023.11.18 - This is the pusher event that updates the dbDocument.
        setPlan(received_document);
        setDbPlan(received_document);
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      router.push("/plans");
    }

    // Unsubscribe from pusher events when the component unmounts
    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [planId, router, userId]);

  useEffect(() => {
    if (!planId) return;
    console.log("planID",planId) //此處有印出來，代表fetchPlan res有錯
    const fetchPlan = async () => {
      const res = await fetch(`/api/plans/${planId}`);
      if (!res.ok) {
        console.log("usePlan error2", res)
        setPlan(null);
        router.push("/plans");
        return;
      }
      const data = await res.json();
      setPlan(data);
      setDbPlan(data);
    };
    fetchPlan();
  }, [planId, router]);

  const name = plan?.name || "";
  const setName = (newName: string) => {
    console.log("有啟動setName")
    if (plan === null) return;
    setPlan({
      ...plan,
      name: newName,
    });
  };

  const description = plan?.description || "";
  const setDescription = (newDescription: string) => {
    if (plan === null) return;
    setPlan({
      ...plan,
      description: newDescription,
    });
  };

  return {
    planId,
    plan,
    name,
    setName,
    description,
    setDescription,
  };
};
