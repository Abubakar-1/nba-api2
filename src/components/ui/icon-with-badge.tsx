import { BellIcon } from "@heroicons/react/24/solid";

interface IProps {
  badge?: number;
  onClick?: any;
}
const IconWithBadge = ({ badge, onClick }: IProps) => {
  return (
    <div className="relative mr-7 mt-2" role="button" onClick={() => onClick()}>
      <BellIcon className="h-8 w-8 text-gray-400" />
      {badge && (
        <span className="-top-2 right-[0.2rem] w-fit h-fit px-[0.3rem] rounded-full bg-red-500 text-white text-xs absolute flex justify-center items-center">
          {badge}
        </span>
      )}
    </div>
  );
};

export default IconWithBadge;
