import classNames from "classnames";
import { FunctionalComponent, h } from "preact";

type IInputProps = h.JSX.IntrinsicElements["input"] & {
  className?: string;
  dimension?: "xs" | "sm" | "md";
  variant?: "primary" | "danger";
  label?: string;
  labelDescription?: string;
};

const RadioButton: FunctionalComponent<IInputProps> = ({
  variant = "primary",
  dimension = "sm",
  labelDescription,
  onClick,
  label,
  disabled,
  ...props
}) => {
  const classes = classNames("!rounded-[50px]", {
    "text-primary-600 focus:ring-primary-500": variant === "primary",
    "text-red-600 focus:ring-red-500": variant === "danger",
    "h-3 w-3 ": dimension === "xs",
    "h-4 w-4 ": dimension === "sm",
    "h-5 w-5 ": dimension === "md",
  });

  return (
    <div className={props.className}>
      <div className="relative flex items-start">
        <div className="flex h-5 items-center">
          <input
            {...props}
            defaultValue={
              props.defaultValue as h.JSX.SignalLike<string> & string
            }
            type="radio"
            className={classes}
            disabled={disabled}
          />
        </div>
        <div className="ml-5 text-sm">
          {label ? (
            <label
              htmlFor={props.id}
              className={classNames("font-medium text-gray-700", {
                "text-red-700": variant === "danger",
              })}
            >
              {label}
            </label>
          ) : null}
          {labelDescription ? (
            <p
              id={props.id ? `${props.id}-description` : undefined}
              className={classNames({
                "text-gray-500": variant === "primary",
                "text-red-500": variant === "danger",
              })}
            >
              {labelDescription}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default RadioButton;
