"use client";

// import { useEffect, useRef } from "react";
import { BiLogOutCircle } from "react-icons/bi";
import { FaUserAstronaut } from "react-icons/fa6";
import { MdOutlineTravelExplore } from "react-icons/md";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import usePlans from "@/hooks/usePlans";

import AddPlanButton from "./AddPlanButton";
import PlanItem from "./PlanItem";

export default function PlansBar() {
  const { plans, addPlan } = usePlans();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const searchParams = useSearchParams();
  // const search = searchParams.get("search");
  const router = useRouter();
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

  // let partialChatrooms = useRef([]);

  // useEffect(() => {
  //   if (search !== null) {
  //     partialChatrooms = chatrooms.filter((chatroom) => {
  //       if (userId === chatroom.user_id1) {
  //         return chatroom.username2.includes(search);
  //       } else {
  //         return chatroom.username1.includes(search);
  //       }
  //     });
  //   }
  // }, [search, chatrooms, userId]);

  // const handleAddChatroom = async () => {
  //   try {
  //     if (!search) {
  //       return;
  //     }
  //     const ret = await addChatroom(search);

  //     if (!ret.chatroom && !ret.ok) {
  //       const body = await ret.json();
  //       alert(body.error);
  //       return false;
  //     }

  //     const newChatroom = ret.chatroom;

  //     const chatId = newChatroom.displayId;

  //     // clearn seach param
  //     const tmp = new URLSearchParams(searchParams);
  //     tmp.delete("search");

  //     router.push(`/chat/${chatId}`);
  //   } catch (e) {
  //     console.error(e);
  //     alert(e);
  //   }
  // };

  return (
    <>
      <div className=" flex flex-col">
        <div className="m-1 flex flex-row items-center justify-between">
          <MdOutlineTravelExplore size={100} className="Icon m-1" />
          {/* a big bold font "Traveler" */}
          <span className="Travel-icon text0 text-7xl font-bold text-gray-800">
            Traveler
          </span>
          <motion.div
            className="text-medium m-1 font-semibold"
            variants={signOutVariants}
            whileHover="hover"
          >
            <AddPlanButton />
          </motion.div>
        </div>

        <p className="w-full p-3 px-4 font-mono font-bold">
          The joy of journeying.
        </p>

        {plans.map((p: any) => (
          <PlanItem
            key={p.plan.displayId}
            planId={p.plan.displayId}
            name={p.plan.name}
            description={p.plan.description}
          />
        ))}
      </div>
      <div className="fixed bottom-5 left-3 p-4">
        <div className="flex flex-row">
          <FaUserAstronaut size={20} strokeWidth={3} className="m-1" />
          <span className="text-medium m-1 font-semibold">
            {session?.user?.username}
          </span>
        </div>

        <div className="gap-4 rounded-full transition-colors duration-300 group-hover:bg-gray-200">
          <Link href={`/auth/signout`}>
            <motion.div
              className="text-medium mr-2 flex flex-row font-semibold"
              variants={signOutVariants}
              whileHover="hover"
            >
              <BiLogOutCircle size={20} strokeWidth={3} className="mr-3" />

              <motion.span
                className="text-medium mr-4 font-semibold"
                variants={signOutVariants}
                whileHover="hover"
              >
                Sign Out
              </motion.span>
            </motion.div>
          </Link>
        </div>
      </div>
    </>
  );
}
