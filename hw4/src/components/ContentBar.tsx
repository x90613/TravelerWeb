"use client";

import { LuPinOff, LuMegaphone } from "react-icons/lu";
import { useSession } from "next-auth/react";

import AddJourneyButton from "@/components/AddJourneyButton";
import { useJourney } from "@/hooks/useJourney";
import JourneysViewer from "@/components/JourneysViewer";
import EditPlanButton from "@/components/EditPlanButton";
import usePlans from "@/hooks/usePlans";
import { useEffect } from "react";

export default function ContentBar() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { journeys, currentPlan } = useJourney();
  console.log("currentPlan12312",currentPlan)
  

  return (
    <>
      <div className="h-screen w-full">
        <div className="flex h-full w-full flex-col overflow-hidden shadow-lg">
          <ContentBarHeader currentPlan={currentPlan} userId={userId} />
          <JourneysViewer journeys={journeys} />
          <AddJourneyButton/>
        </div>
      </div>
    </>
  );
}

function ContentBarHeader({
  currentPlan,
}: {
  currentPlan: any;
  userId: string | undefined;
}) {
  let currentPlanName = currentPlan?.plan.name // 沒有時，留白
 

  return (
    <>
      <nav className="w-full p-3 text-lg font-semibold shadow-md">
        <div className="flex flex-row">
          <span className="m-2">
            {currentPlanName}
          </span>
          <EditPlanButton/>
          {/* 此處新增 ... 來編輯Plan的name以及description */}
        </div>
      </nav>
    </>
  );
}
