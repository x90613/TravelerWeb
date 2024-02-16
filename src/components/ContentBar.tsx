"use client";

import { BsCalendar2Plus } from "react-icons/bs";

import { useSession } from "next-auth/react";

import { motion } from "framer-motion";

import AddJourneyButton from "@/components/AddJourneyButton";
import EditPlanButton from "@/components/EditPlanButton";
import JourneysViewer from "@/components/JourneysViewer";
import ShareButton from "@/components/ShareButton";
import { useJourney } from "@/hooks/useJourney";

export default function ContentBar() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { journeys, currentPlan, exportJourney } = useJourney();
  const signOutVariants = {
    hover: {
      scale: 1.1,
      color: "#007bff", // color
      transition: {
        type: "spring",
        stiffness: 300,
      },
    },
  };
  const journeyVariants = {
    hover: {
      scale: 1.03,
      color: "#323232", // color
      transition: {
        type: "spring",
        stiffness: 300,
      },
    },
  };
  return (
    <>
      <div className="content-bar h-screen w-full">
        <div className="flex h-full w-full flex-col overflow-hidden shadow-lg ">
          <ContentBarHeader currentPlan={currentPlan} userId={userId} />

          <motion.div
            className="flex w-full flex-grow scroll-m-7 flex-col overflow-hidden"
            variants={journeyVariants}
            whileHover="hover"
          >
            <JourneysViewer journeys={journeys} />
          </motion.div>

          <AddJourneyButton />

          <ShareButton />

          <motion.div
            className="h-ull flex w-full flex-col  shadow-lg "
            variants={signOutVariants}
            whileHover="hover"
          >
            <button
              className="rounded bg-yellow-200 px-4 py-2 font-bold text-black hover:bg-yellow-300"
              onClick={() => {
                exportJourney();
                alert("Exported!");
              }}
            >
              {" "}
              <BsCalendar2Plus className="mr-2 inline-block" size={20} />
              Export Calendar
            </button>
          </motion.div>
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
  const currentPlanName = currentPlan?.plan.name; // 沒有時，留白
  const signOutVariants = {
    hover: {
      scale: 1.1,
      color: "#007bff", // 选择一个合适的颜色
      transition: {
        type: "spring",
        stiffness: 300,
      },
    },
  };

  return (
    <>
      <nav className="z-0 w-full p-3 text-lg font-semibold ">
        <div className="flex flex-row">
          <span className="w-full p-3 px-4 text-3xl font-bold">
            {currentPlanName}
          </span>
          <motion.div
            className="text-medium  font-semibold"
            variants={signOutVariants}
            whileHover="hover"
          >
            <EditPlanButton />
          </motion.div>

          {/* 此處新增 ... 來編輯Plan的name以及description */}
        </div>
      </nav>
    </>
  );
}
