"use client";

import { usePlan } from "@/hooks/usePlan";

function PlanPage() {
  const { name, setName, description, setDescription } = usePlan();
  return (
    <div className="w-full">
      <nav className="sticky top-0 flex w-full justify-between p-2 shadow-sm">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder="Plan Title"
          className="rounded-lg px-2 py-1 text-slate-700 outline-0 focus:bg-slate-100"
        />
      </nav>

      <section className="w-full px-4 py-4">
        <textarea
          value={description || ""}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          className="h-[80vh] w-full outline-0 "
        />
      </section>
    </div>
  );
}

export default PlanPage;
