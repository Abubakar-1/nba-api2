import classNames from "classnames";
import { FunctionalComponent, h } from "preact";
import { memo } from "preact/compat";

interface ButtonProps extends h.JSX.HTMLAttributes<HTMLButtonElement> {
  className?: string;
  href?: string;
  dimension: "xs" | "sm" | "md" | "lg" | "xl";
  variant: "primary" | "outline" | "danger" | "secondary" | "white";
  isLoading?: boolean;
  isBlock?: boolean;
  // Explicit native attrs used in component
  type?: "button" | "submit" | "reset" | string;
  disabled?: boolean;
}

const Button: FunctionalComponent<ButtonProps> = memo((props) => {
  const {
    variant,
    dimension,
    type,
    onClick,
    disabled,
    isLoading,
    ...otherProps
  } = props;
  const isOutlined = variant === "outline";

  const classes = classNames(
    "w-full inline-flex items-center justify-center font-medium border shadow-sm disabled:bg-opacity-80 disabled:cursor-not-allowed focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 disabled:bg-opacity-80",
    {
      "bg-primary-500 hover:bg-primary-600 text-white border-transparent":
        variant === "primary",
      "bg-red-600 hover:bg-red-600 text-white border-transparent":
        variant === "danger",
      "bg-white hover:bg-gray-50 text-gray-700 border-gray-300":
        variant === "outline",
      "bg-[#FFB545] hover:bg-[#FFAF36] text-white border-[#FFB545]":
        variant === "secondary",
      "bg-white hover:bg-gray-100 text-primary-500 border-gray-200":
        variant === "white",
      "px-2.5 py-1.5 text-xs rounded-3xl": dimension === "xs",
      "px-3 py-2 text-sm leading-4 rounded-3xl": dimension === "sm",
      "px-4 py-2 text-sm rounded-3xl": dimension === "md",
      "px-4 py-2.5 text-base rounded-3xl": dimension === "lg",
      "px-6 py-3 text-base rounded-3xl": dimension === "xl",
    }
  );

  return (
    <button
      type={type as any}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={classNames(classes, props.className ?? "")}
      {...otherProps}
    >
      {isLoading ? <ButtonLoader isOutlined={isOutlined} /> : props.children}
    </button>
  );
});

const ButtonLoader = memo(({ isOutlined }: any) => {
  return (
    <div className="flex justify-center items-center w-full ">
      <svg
        class={classNames("animate-spin h-5 w-5", {
          "text-white": !isOutlined,
          "text-primary-500": isOutlined,
        })}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
});

export default Button;
