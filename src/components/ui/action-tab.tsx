import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

interface Props {
  children: any;
}
const ActionTab = ({ children }: Props) => {
  return (
    <div className="w-5 h-5 bg-red-500">
      <EllipsisHorizontalIcon className="w-8 h-8 rotate-90" />
      <div className=" w-20 h-32 bg-yellow-400  absolute z-[1000]">
        {" "}
        {children}
      </div>
    </div>
  );
};
export default ActionTab;
