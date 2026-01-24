import classNames from "classnames";
import { FunctionalComponent, h } from "preact";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

interface Option {
  code: string;
  name: string;
}

type DatalistProps = h.JSX.IntrinsicElements["input"] & {
  className?: string;
  dimension?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "danger";
  error?: string;
  label?: string;
  options: Option[];
};

const Datalist: FunctionalComponent<DatalistProps> = (props) => {
  const {
    variant = "primary",
    dimension = "md",
    error,
    label,
    disabled,
    options,
    name,
    id,
    ...otherProps
  } = props;

  const datalistId = `${props.id}-datalist`;

  const classes = classNames(
    "block w-full pl-2 pr-6 rounded border shadow-sm sm:text-sm focus:outline-none appearance-none",
    {
      "focus:border-primary-500 focus:ring-primary-500 border-gray-300":
        variant === "primary",
      "focus:border-red-500 focus:ring-red-500 border-red-300":
        variant === "danger",
      "px-2.5 py-1.5 text-xs rounded": dimension === "xs",
      "px-3 py-2 text-sm leading-4 rounded": dimension === "sm",
      "px-4 py-2 text-sm rounded": dimension === "md",
      "px-4.5 py-2.5 text-base rounded": dimension === "lg",
      "px-6 py-3 text-base rounded": dimension === "xl",
    },
    props.className
  );

  return (
    <div className={"w-full"}>
      {label ? (
        <label
          htmlFor={props.id}
          className="hidden lg:block ml-1 text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      ) : null}
      <div className="lg:mt-1 relative text-sm">
        <input
          // {...otherProps}
          name={props.name}
          id={props.id}
          list={datalistId}
          className={classes}
        />
        <datalist id={datalistId}>
          <div className="w-fit p-5 bg-red-500">
            {options.map((option: Option) => (
              <option key={option.code} value={option.name} />
            ))}
          </div>
        </datalist>
        {/* <ChevronDownIcon className="absolute pointer-events-none top-3 right-2 w-4 h-4" /> */}
      </div>
      {error ? (
        <p
          className="mt-2 w-full text-left  text-sm text-red-500"
          id={props.id ? `${props.id}-error-description` : undefined}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};

export { Datalist };
