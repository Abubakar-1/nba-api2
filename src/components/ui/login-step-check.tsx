import { CheckBadgeIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

interface ILoginStep {
  state: boolean;
  value: string;
  onClick?: any;
}

const LoginStepCheck = ({ state, value, onClick }: ILoginStep) => {
  return (
    <div
      role="button"
      onClick={() => {
        onClick();
      }}
      className="flex flex-col justify-center items-center lg:gap-3"
    >
      {state ? (
        <CheckCircleIcon className="h-4 lg:h-6 w-4 lg:w-6 text-primary-500" />
      ) : (
        <div className="h-4 lg:h-6 w-4 lg:w-6 rounded-full border-2 border-gray-300 bg-gray-100"></div>
      )}
      <p className="text-tiny md:text-xs text-gray-500 w-full">{value}</p>
    </div>
  );
};

export default LoginStepCheck;
