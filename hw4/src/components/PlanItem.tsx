import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import usePlans from "@/hooks/usePlans";

import { Button } from "./ui/button";

type PlanItemProps = {
  planId: string;
  name: string;
  description: string;
};


export default function PlanItem({
  planId,
  name,
  description,
}: PlanItemProps) {
  const { deletePlan } = usePlans();
  const currentPlanId = useParams().planId;

  const [modalOpen, setModalOpen] = useState(false);

  const dialog = (
    <Dialog
      open={modalOpen}
      onOpenChange={() => {
        setModalOpen(false);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete a plan</DialogTitle>
          <DialogDescription>
            Note that this action is irreversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={async () => {
              await deletePlan(planId);
              setModalOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <div className="flex items-center">
        <Link
          className={`m-1 w-10/12 rounded-full ${
            currentPlanId === planId ? "bg-sky-200" : "bg-gray-200"
          } p-4 px-4 transition-colors ${currentPlanId === planId? "" : "hover:bg-sky-100"}`}
          href={{
            pathname: `/plan/${planId}`,
          }}
        >
          <div className="flex flex-col">
            <span className="text-lg font-medium">📍{name}</span>
          </div>
        </Link>

        <button className="group">
          <div
            // prefix a class with hover: to make it only apply when the element is hovered
            className="flex w-fit items-center gap-4 rounded-full p-2 align-bottom transition-colors duration-300 group-hover:bg-gray-200 lg:pr-4"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            <div className="grid h-[20px] w-[20px] place-items-center">
              <LuTrash2 size={26} strokeWidth={2} />
            </div>
          </div>
        </button>
      </div>
      {dialog}
    </>
  );
}
