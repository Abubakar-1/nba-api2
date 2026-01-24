import { CheckCircleIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { h } from "preact";

interface ILoginStepBar extends h.JSX.HTMLAttributes<HTMLInputElement> {
  state: boolean;
}
const LoginStepBar = ({ state }: ILoginStepBar) => {
  const classes = classNames("h-[0.19rem] w-7 lg:w-16 ", {
    "bg-gradient-to-r from-primary-500": state === false,
    "bg-primary-500": state === true,
  });
  return <div className={classes}></div>;
};

export default LoginStepBar;
