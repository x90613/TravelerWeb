import { MdOutlineTravelExplore } from "react-icons/md";

import AuthForm from "@/components/AuthForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-yellow-50 p-24">
      <MdOutlineTravelExplore size={100} className="Icon m-1" />
      <span className="Travel-icon  mb-5 text-7xl font-bold text-gray-800 ">
        Traveler
        <p className=" mb-5 text-base font-medium">The Meaning of Travel</p>
      </span>

      <AuthForm />
    </main>
  );
}
