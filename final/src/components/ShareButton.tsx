"use client";

import { useRef, useState } from "react";
import { RiUserShared2Line } from "react-icons/ri";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJourney } from "@/hooks/useJourney";
import usePlans from "@/hooks/usePlans";

export default function ShareButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const { sharePlan } = usePlans();
  const { currentPlan } = useJourney();

  const shareEmailRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const shareEmail = shareEmailRef.current?.value;
    if (!shareEmail) {
      alert("Please enter an shareEmail!");
      return false;
    }

    try {
      const ret = await sharePlan(currentPlan.planId, shareEmail);
      console.log("ret:", ret);

      if (!ret.ok) {
        const body = await ret.json();
        alert(body.error);
        return false;
      }

      if (ret.status !== "") {
        alert(ret.status);
        return false;
      }

      // if (ret.status === 'User already associated with the plan') {
      //   alert("User already associated with the plan");
      //   return false;
      // }

      setModalOpen(false);

      router.push(`/plan/${currentPlan.planId}`);
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  const dialog = (
    <Dialog
      open={modalOpen}
      onOpenChange={() => {
        setModalOpen(false);
      }}
    >
      <DialogContent className=" sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share this plan</DialogTitle>
          <DialogDescription>share it with your friends!</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              email
            </Label>
            <Input ref={shareEmailRef} placeholder="" className="w-fit" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <div className="m-1 flex self-end">
        <button className="group">
          <div
            className="flex w-fit items-center gap-4 rounded-full p-2 align-bottom transition-colors duration-300 group-hover:bg-gray-200 lg:pr-4"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            <div className="grid h-[20px] w-[20px] place-items-center">
              <RiUserShared2Line className="h-6 w-6" />
            </div>
          </div>
        </button>
      </div>
      {dialog}
    </>
  );
}
