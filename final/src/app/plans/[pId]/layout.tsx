import AddDialog from "./_components/AddDialog";
import ShareDialog from "./_components/ShareDialog";

type Props = {
  children: React.ReactNode;
  params: { pId: string }; //這可以截取“該層名字”
};

function PlanEditorLayout({ children, params }: Props) {
  return (
    <div className="w-full">
      <div className="fixed right-20 top-1 z-50">
        <AddDialog pId={params.pId} />
      </div>
      <div className="fixed right-1 top-1 z-50">
        <ShareDialog pId={params.pId} />
      </div>
      {children}
    </div>
  );
}

export default PlanEditorLayout;
