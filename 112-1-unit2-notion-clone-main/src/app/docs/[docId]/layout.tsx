import ShareDialog from "./_components/ShareDialog";

type Props = {
  children: React.ReactNode;
  params: { docId: string };
};

function DocEditorLayout({ children, params }: Props) {
  return (
    <div className="w-full">
      <div className="fixed right-2 top-1 z-50">
        <ShareDialog docId={params.docId} />
      </div>
      {children}
    </div>
  );
}

export default DocEditorLayout;
