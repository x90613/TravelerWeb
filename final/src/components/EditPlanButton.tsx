"use client";

import { useRef, useState } from "react";
import { FcMenu } from "react-icons/fc";
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

export default function EditPlanButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const { updatePlan } = usePlans();
  const { currentPlan } = useJourney();

  const currentPlanName = currentPlan?.plan.name; // 沒有時，留白
  const currentPlanDescription = currentPlan?.plan.description; // 沒有時，留白

  const planNameRef = useRef<HTMLInputElement>(null);
  const planDescriptionRef = useRef<HTMLInputElement>(null);

  const handleUpdate = async () => {
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
      const ret = await updatePlan(
        currentPlan.planId,
        planName,
        planDescription,
      );

      if (!ret.plan && !ret.ok) {
        const body = await ret.json();
        alert(body.error);
        return false;
      }


      setModalOpen(false);
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
          <DialogTitle>Edit the plan</DialogTitle>
          <DialogDescription>
            Edit a new plan! Please enter the plan name & the description.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              name
            </Label>
            <Input
              ref={planNameRef}
              defaultValue={currentPlanName}
              placeholder=""
              className="w-fit"
            />
          </div>
        </div>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              description
            </Label>
            <Input
              ref={planDescriptionRef}
              defaultValue={currentPlanDescription}
              placeholder=""
              className="w-fit"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
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
              <FcMenu size={26} strokeWidth={2} />
            </div>
          </div>
        </button>
      </div>
      {dialog}
    </>
  );
}
