"use client";

import PlansBar from "@/components/PlansBar";
import { JourneyProvider } from "@/hooks/useJourney";

type Props = {
  children: React.ReactNode;
};

function DocsLayout({ children }: Props) {
  return (
    // overflow-hidden for parent to hide scrollbar
    <main className="flex-rows fixed top-0 flex h-screen w-full overflow-hidden">
      <JourneyProvider>
        <nav className="plan-bar flex w-2/5 flex-col overflow-y-scroll border-r bg-slate-100 pb-10">
          <PlansBar />
        </nav>
        <div className="w-full overflow-y-scroll">{children}</div>
      </JourneyProvider>
    </main>
  );
}

export default DocsLayout;
