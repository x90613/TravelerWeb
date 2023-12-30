import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

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
import { Button } from "./ui/button";

type Props = {
  journeys: any;
};

export default function JourneyViewer({ journeys }: Props) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [journeys]); //每次新增時慢慢滾動到最下方

  return (
    <div className="grow overflow-y-scroll">
      <div className="px-2 pl-20 pt-4">
        {journeys.map((journey: { journeyId: any }) => (
          <JourneyItem
            journey={journey}
            userId={userId}
            key={journey.journeyId}
          />
        ))}
      </div>
      <div ref={scrollRef}></div>
    </div>
  );
}

function JourneyItem({
  journey,
}: {
  journey: any;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const { deleteJourney, updateJourney } = useJourney();

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
  const handleDelete = async () => {
    try {
      const ret = await deleteJourney(journey.journeyId);
      if (!ret.journey && !ret.ok) {
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

  const handleUpdate = async () => {
    const title = titleRef.current?.value;
    const start = startRef.current?.value;
    const end = endRef.current?.value;
    const location = locationRef.current?.value;
    const note = noteRef.current?.value;
    const journeyId = journey.journeyId;

    try {
      const ret = await updateJourney(
        journeyId,
        title,
        start,
        end,
        location,
        note,
      );
      if (!ret.journey && !ret.ok) {
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
          <DialogTitle>Journey editer</DialogTitle>
          <DialogDescription>Edit or Delete your journey.</DialogDescription>
        </DialogHeader>
        <div>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                title
              </Label>
              <Input
                ref={titleRef}
                defaultValue={journey.title}
                placeholder=""
                className="w-fit"
              />
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
                defaultValue={journey.start}
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
                defaultValue={journey.end}
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
                location={journey.location}
              />
              {/* <Input
                ref={locationRef}
                defaultValue={journey.location}
                placeholder=""
                className="w-fit"
              /> */}
            </div>
          </div>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                note
              </Label>
              <Input
                ref={noteRef}
                defaultValue={journey.note}
                placeholder=""
                className="w-fit"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              await handleDelete();
              setModalOpen(false);
            }}
          >
            Delete
          </Button>
          <Button
            onClick={async () => {
              await handleUpdate();
              setModalOpen(false);
            }}
          >
            done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 1.05 }}
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
      >
        <button
          onClick={() => {
            setModalOpen(true);
          }}
          className="flex w-1/2 pt-1"
        >
          <div key={"dm1"} className="w-full pt-1">
            <div className={`flex flex-row items-end gap-2`}>
              <button className="relative m-7 w-full rounded-lg border-2 border-black  p-4  shadow-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex">
                    <div className="m-1 p-1 font-bold">Title</div>
                    <div className="m-1 rounded-lg border border-black p-1">
                      {journey.title}
                    </div>
                  </div>
                  {/* <button
                  onClick={handleDelete}
                  className="text-white bg-red-500 hover:bg-red-700 rounded-full w-6 h-6 flex items-center justify-center"
                >
                  X
                </button> */}
                </div>
                <div className="justify-even flex w-full">
                  <div className="flex">
                    <div className="m-1 p-1 font-bold">Start</div>
                    <div className="m-1 rounded-lg border border-black p-1">
                      {journey.start}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="m-1 p-1 font-bold">⁀➴ End</div>
                    <div className="m-1 rounded-lg border border-black p-1">
                      {journey.end}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <div className="m-1 p-1 font-bold">Location</div>
                  <div className="m-1 rounded-lg border border-black p-1">
                    {journey.location}
                  </div>
                </div>
                <div className="flex">
                  <div className="m-1 p-1 font-bold">Note</div>
                  <div className="m-1 break-words rounded-lg border border-black p-1">
                    {journey.note}
                  </div>
                </div>
              </button>
            </div>
            {modalOpen && dialog}
          </div>
        </button>
      </motion.div>
    </>
  );
}
