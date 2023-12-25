import { BiError } from "react-icons/bi";

function PlansPage() {
  return (
    <div className="flex h-[90vh] w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <BiError className="text-yellow-500" size={80} />
        <p className="text-sm font-semibold text-slate-700">
          Start a new Plan to edit
        </p>
      </div>
    </div>
  );
}
export default PlansPage;
