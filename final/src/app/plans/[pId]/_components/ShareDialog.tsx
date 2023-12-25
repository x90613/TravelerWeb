import { RxAvatar } from "react-icons/rx";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
import { auth } from "@/lib/auth";
import { publicEnv } from "@/lib/env/public";

import { addPlanAuthor, getPlanAuthors } from "./actions";

type Props = {
  pId: string;
};
async function ShareDialog({ pId }: Props) {
  const session = await auth();
  if (!session?.user?.id) return null;
  // const userId = session.user.id;
  
  const authors = await getPlanAuthors(pId);
  // console.log("555", authors)
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>Share</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share the plan</DialogTitle>
          <DialogDescription>Share the plan with other users.</DialogDescription>
        </DialogHeader>
        <form
          action={async (e) => {
            "use server";
            const email = e.get("email");
            if (!email) return;
            if (typeof email !== "string") return;
            const result = await addPlanAuthor(pId, email);
            if (!result) {
              redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/plans/${pId}`);
            }
            revalidatePath(`${publicEnv.NEXT_PUBLIC_BASE_URL}/plans/${pId}`);
          }}
          className="flex flex-row gap-4"
        >
          <Input placeholder="Email" name="email" />
          <Button type="submit">Add</Button>
        </form>
        <div className="flex w-full flex-col gap-1">
          <h1 className="w-full font-semibold text-slate-900">Authors</h1>
          {authors.map((author, index) => (
            <form key={index} className="flex w-full items-center gap-2">
              <RxAvatar size={30} />
              <div className="flex grow flex-col ">
                <h2 className="text-sm font-semibold">{author.username}</h2>
                <p className="text-xs text-gray-600">{author.email}</p>
              </div>
            </form>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;
