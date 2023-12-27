import { useEffect, useRef, useState } from "react";
import { LuPin, LuTrash2 } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSession } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useJourney } from "@/hooks/useJourney";

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
      <div className="px-2 pt-4">
        {journeys.map((journey: { journeyId: any; }) => (
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
  userId,
}: {
  journey: any;
  userId: string | undefined;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const { deleteJourney } = useJourney();

  const titleRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  }, []);

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


  const dialog = (
    <Dialog
      open={modalOpen}
      onOpenChange={() => {
        setModalOpen(false);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit</DialogTitle>
          <DialogDescription>
            You can edit your journey here or delete it.
          </DialogDescription>
        </DialogHeader>
        <div>
        <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                title
              </Label>
              <Input
                ref={titleRef}
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
                <Input
                  ref={locationRef}
                  placeholder=""
                  className="w-fit"
                />
              </div>
          </div>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                note
              </Label>
              <Input
                ref={noteRef}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );


  return (
    <>
      <button onClick={() => {
          setModalOpen(true);
        }} className="flex w-1/2 pt-1">
        <div key={"dm1"} className="w-full pt-1">
          <div
            className={`flex flex-row items-end gap-2`}
          >
            <button className="relative border-2 m-4 p-4 w-full rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex">
                  <div className="font-bold m-1 p-1">Title</div>
                  <div className="border m-1 p-1 rounded-lg">{journey.title}</div>
                </div>
                {/* <button
                  onClick={handleDelete}
                  className="text-white bg-red-500 hover:bg-red-700 rounded-full w-6 h-6 flex items-center justify-center"
                >
                  X
                </button> */}
              </div>
              <div className="flex justify-even w-full">
                <div className="flex">
                  <div className="font-bold m-1 p-1">Start</div>
                  <div className="border m-1 p-1 rounded-lg">{journey.start}</div>
                </div>
                <div className="flex">
                  <div className="font-bold m-1 p-1">End</div>
                  <div className="border m-1 p-1 rounded-lg">{journey.end}</div>
                </div>
              </div>
              <div className="flex">
                <div className="font-bold m-1 p-1">Location</div>
                <div className="border m-1 p-1 rounded-lg">{journey.location}</div>
              </div>
              <div className="flex">
                <div className="font-bold m-1 p-1">Note</div>
                <div className="border m-1 p-1 rounded-lg break-words">{journey.note}</div>
              </div>
            </button>
          </div>
          {modalOpen && dialog}
        </div>
        </button>
    </>
  );
}
