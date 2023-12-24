import Navbar from "./_components/Navbar";

type Props = {
  children: React.ReactNode;
};

function DocsLayout({ children }: Props) {
  return (
    // overflow-hidden for parent to hide scrollbar
    <main className="flex-rows fixed top-0 flex h-screen w-full overflow-hidden">
      {/* overflow-y-scroll for child to show scrollbar */}
      <nav className="flex w-2/5 flex-col overflow-y-scroll border-r bg-slate-100 pb-10">
        <Navbar />
      </nav>
      {/* overflow-y-scroll for child to show scrollbar */}
      <div className="w-full overflow-y-scroll">{children}</div>
    </main>
  );
}

export default DocsLayout;
