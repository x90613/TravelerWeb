"use client";

import {
  useEffect,
  useState,
  useContext,
  createContext,
  useCallback,
} from "react";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

type PlansContextType = {
  plans: any;
  fetchPlans: any;
  deletePlan: any;
  addPlan: any;
  updatePlan: any;
  sharePlan: any;
};

const PlansContext = createContext<PlansContextType | null>(null);

export function PlansProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState([]);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const currentPlanId = useParams().planId;
  const router = useRouter();

  const fetchPlans = useCallback(async () => {
    const res = await fetch(`/api/plans`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setPlans(data.plans);
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchPlans();
  }, [userId, fetchPlans]);

  const deletePlan = async (planId: string) => {
    const needToRedirect = currentPlanId === planId; // 你刪了正在使用的Plan

    const res = await fetch(`/api/plans/${planId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    await fetchPlans();

    // if current chatroom is deleted, redirect to home page
    if (needToRedirect) {
      router.push("/plan");
    }
    return data;
  };

  const addPlan = async (planName: string, description: string) => {
    const res = await fetch(`/api/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planName: planName,
        description: description,
      }),
    });
    if (!res.ok) {
      console.log("fail");
      return res;
    }
    const data = await res.json();
    console.log(data);
    await fetchPlans(); // 同時會觸發相依的useEffect()
    return data;
  };

  const updatePlan = async (
    planId: string,
    planName: string,
    planDescription: string,
  ) => {
    const res = await fetch(`/api/plans`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId: planId,
        name: planName,
        description: planDescription,
      }),
    });
    if (!res.ok) {
      console.log("fail");
      return res;
    }
    const data = await res.json();
    await fetchPlans(); // 同時會觸發相依的useEffect()
    return data;
  };

  const sharePlan = async(planId:string, email: string) => {
    const res = await fetch(`/api/plans/${planId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });
    if (!res.ok) {
      console.log("fail");
      return res;
    }
    const data = await res.json();
    await fetchPlans(); // 同時會觸發相依的useEffect()
    return data;
  }

  return (
    <PlansContext.Provider
      value={{
        plans,
        fetchPlans,
        deletePlan,
        addPlan,
        updatePlan,
        sharePlan,
      }}
    >
      {children}
    </PlansContext.Provider>
  );
}

export default function usePlans() {
  const context = useContext(PlansContext);
  if (!context) {
    throw new Error("usePlans must be used within a PlansProvider");
  }
  return context;
}
