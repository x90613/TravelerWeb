"use client";

import { usePlan } from "@/hooks/usePlan";
import { useJourney } from "@/hooks/useJourney";
import Task from "./_components/Task";

function PlanPage() {
  const { name, setName, description, setDescription } = usePlan();
  const { createJourney } = useJourney();
  const test = {
    title: 'John Doe',
    start: '19:00',
    end: '20:00',
    location: 'Taiwan',
    note: 'writing some shits'
  };
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
      <button onClick={()=>createJourney()}>點擊我</button>
      {/* <section className="w-full px-4 py-4">
        <textarea
          value={description || ""}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          className="h-[80vh] w-full outline-0 "
        />
      </section> */}
      <Task 
        title={test.title}
        start={test.start}
        end={test.end}
        location={test.location}
        note={test.note}
      />
    </div>
  );
}

export default PlanPage;
