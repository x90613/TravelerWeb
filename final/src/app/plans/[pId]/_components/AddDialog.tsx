"use client"
// import { RxAvatar } from "react-icons/rx";

// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
// import { auth } from "@/lib/auth";
// import { publicEnv } from "@/lib/env/public";

// import { addPlanAuthor, getPlanAuthors } from "./actions";

type Props = {
  pId: string;
};
async function AddDialog({ pId }: Props) {
  // const session = await auth();
  // if (!session?.user?.id) return null;
  // // const userId = session.user.id;
  
  // const authors = await getPlanAuthors(pId);
  // console.log("555", authors)
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>Add a journey</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a journey</DialogTitle>
          <DialogDescription>Let's add a new journey.</DialogDescription>
        </DialogHeader>
        <form
          // action={async (e) => {
          //   // "use server";
          //   const email = e.get("email");
          //   if (!email) return;
          //   if (typeof email !== "string") return;
          //   const result = await addPlanAuthor(pId, email);
          //   if (!result) {
          //     redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/plans/${pId}`);
          //   }
          //   revalidatePath(`${publicEnv.NEXT_PUBLIC_BASE_URL}/plans/${pId}`);
          // }}
          className="flex flex-row gap-4"
        >
          <div className="flex flex-col gap-1">
            <Input placeholder="Title" name="Title" />
            <Input placeholder="Start" name="start" />
            <Input placeholder="End" name="end" />
            <Input placeholder="Location" name="location" />
            <Input placeholder="Note" name="note" />
            <Button className="fixed right-1 bottom-1 z-50" type="submit">Add</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddDialog;
