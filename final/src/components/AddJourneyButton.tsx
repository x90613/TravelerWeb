"use client";

import { useRef, useState } from "react";
import { LuPlus } from "react-icons/lu";
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

import PlaceAutocomplete from "./PlaceAutocomplete";

export default function AddJourneyButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const { addJourney } = useJourney();

  const titleRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);

  const handlePlaceSelect = (place) => {
    // 更新 locationRef 的值
    if (locationRef.current) {
      locationRef.current.value = place.formatted_address;
    }
    // 这里可以添加更多的处理逻辑，如果需要的话
  };

  const handleSave = async () => {
    const title = titleRef.current?.value;
    if (!title) {
      alert("Please enter an title!");
      return false;
    }

    const start = startRef.current?.value;
    if (!start) {
      alert("Please enter an start!");
      return false;
    }

    const end = endRef.current?.value;
    if (!end) {
      alert("Please enter an end!");
      return false;
    }

    const location = locationRef.current?.value;
    if (!location) {
      alert("Please enter an location!");
      return false;
    }

    const note = noteRef.current?.value;
    if (!note) {
      alert("Please enter an note!");
      return false;
    }

    try {
      const ret = await addJourney(title, start, end, location, note);

      if (!ret.journey && !ret.ok) {
        const body = await ret.json();
        alert(body.error);
        return false;
      }

      // const newPlan = ret.plan;
      // const planId = newPlan.displayId;

      setModalOpen(false);
      // router.refresh();
      // router.push(`/plan/${planId}`)
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
          <DialogTitle>Add a new journey</DialogTitle>
          <DialogDescription>
            Create a new journey! Please enter the following form to create a
            journey.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              title
            </Label>
            <Input ref={titleRef} placeholder="" className="w-fit" />
          </div>
        </div>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              start
            </Label>
            <Input
              type="datetime-local"
              ref={startRef}
              placeholder=""
              className="w-fit"
            />
          </div>
        </div>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              end
            </Label>
            <Input
              type="datetime-local"
              ref={endRef}
              placeholder=""
              className="w-fit"
            />
          </div>
        </div>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              location
            </Label>
            <PlaceAutocomplete
              ref={locationRef}
              onPlaceSelected={handlePlaceSelect}
            />

            {/* <Input ref={locationRef} placeholder="" className="w-fit" /> */}
          </div>
        </div>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              note
            </Label>
            <Input ref={noteRef} placeholder="" className="w-fit" />
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
