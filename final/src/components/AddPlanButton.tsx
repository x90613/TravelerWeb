"use client";

import { useRef, useState } from "react";
import { LuPlus } from "react-icons/lu";

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
import usePlans from "@/hooks/usePlans";

export default function AddPlanButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const { addPlan } = usePlans();

  const planNameRef = useRef<HTMLInputElement>(null);
  const planDescriptionRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const planName = planNameRef.current?.value;
    if (!planName) {
      alert("Please enter an planName!");
      return false;
    }

    const planDescription = planDescriptionRef.current?.value;
    if (!planDescription) {
      alert("Please enter an planDescription!");
      return false;
    }

    try {
      const ret = await addPlan(planName, planDescription);

      if (!ret.plan && !ret.ok) {
        const body = await ret.json();
        alert(body.error);
        return false;
      }

      const newPlan = ret.plan;
      const planId = newPlan.displayId;

      setModalOpen(false);

      router.push(`/plan/${planId}`);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a new plan</DialogTitle>
          <DialogDescription>
            Create a new plan! Please enter the plan name & the description.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              name
            </Label>
            <Input ref={planNameRef} placeholder="" className="w-fit" />
          </div>
        </div>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              description
            </Label>
            <Input ref={planDescriptionRef} placeholder="" className="w-fit" />
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
              <LuPlus size={26} strokeWidth={2} />
            </div>
          </div>
        </button>
      </div>
      {dialog}
    </>
  );
}
