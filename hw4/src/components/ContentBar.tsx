"use client";

import { LuPinOff, LuMegaphone } from "react-icons/lu";

import { useSession } from "next-auth/react";


// import MessagesViewer from "@/components/MessagesViewr";
import AddJourneyButton from "@/components/AddJourneyButton";
import { useJourney } from "@/hooks/useJourney";
import JourneysViewer from "./JourneysViewer";

export default function ContentBar() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { journeys, currentPlan } = useJourney();

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
  userId,
}: {
  currentPlan: any;
  userId: string | undefined;
}) {
  // if (!currentPlan) return null;
  // const replaceUrl = (text: string) => {
  //   const urlRegex = /(https?:\/\/[^\s]+)/g;
  //   return text.replace(urlRegex, (url) => {
  //     return ` <a href="${url}" target="_blank" class="no-underline hover:underline text-blue-500"><p> ${url} </p></a> `;
  //   });
  // };

  const currentPlanName = currentPlan?.plan.name // 沒有時，留白

  return (
    <>
      <nav className="w-full p-3 text-lg font-semibold shadow-md">
        <div className="flex flex-col">
          <span>
            {currentPlanName}
          </span>
          {/* 此處新增 ... 來編輯Plan的name以及description */}
        </div>
      </nav>
    </>
  );
}
