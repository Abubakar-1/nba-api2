import classNames from "classnames";
import { FunctionalComponent, h } from "preact";
import { memo } from "preact/compat";

// Use the intrinsic input element props from Preact so all native attributes
// (value, onChange, autoComplete, readOnly, etc.) are accepted by TS.
type InputProps = h.JSX.IntrinsicElements["input"] & {
  className?: string;
  dimension: "xs" | "sm" | "md" | "lg" | "xl";
  variant: "primary" | "outline" | "danger";
  error?: string;
  label?: string;
  rightSlot?: () => h.JSX.Element;
  leftSlot?: () => h.JSX.Element;
};

const Input: FunctionalComponent<InputProps> = memo((props) => {
  const {
    variant,
    dimension,
    type,
    error,
    rightSlot,
    leftSlot,
    onClick,
    label,
    disabled,
    ...otherProps
  } = props;
  const classes = classNames(
    "block w-full rounded border shadow-sm sm:text-sm focus:outline-none focus:ring-0",
    {
      "bg-gray-100 border-gray-300 ": variant === "outline",
      "focus:border-primary-500 border-gray-300 ": variant === "primary",
      "focus:border-red-500 border-red-300 bg-danger-100": variant === "danger",
      "px-2.5 py-1.5 text-xs rounded": dimension === "xs",
      "px-3 py-2 text-sm leading-4 rounded": dimension === "sm",
      "px-4 py-2 text-sm rounded": dimension === "md",
      "px-2.5 py-2.5 text-base rounded": dimension === "lg",
      "px-6 py-3 text-base rounded": dimension === "xl",
      "pl-9": leftSlot !== undefined,
      "pr-9": rightSlot !== undefined,
      "bg-gray-100 text-gray-500 cursor-not-allowed": disabled,
    }
  );

  return (
    <div className={props.className}>
      {label ? (
        <label
          htmlFor={props.id}
          className="block text-sm text-left font-normal text-gray-700"
        >
          {label.endsWith("*") ? (
            <>
              {label.slice(0, -1)}
              <span className="text-red-500">*</span>
            </>
          ) : (
            label
          )}
        </label>
      ) : null}
      <div className="mt-1 relative">
        <input
          type={type}
          {...otherProps}
          id={props.id}
          disabled={disabled}
          defaultValue={
            otherProps.defaultValue as h.JSX.SignalLike<string> & string
          }
          className={classes}
        />
        {rightSlot ? (
          <div className="absolute inset-y-0 right-0 inline-flex justify-center items-center pr-2">
            {rightSlot()}
          </div>
        ) : null}
        {leftSlot ? (
          <div className="absolute inset-y-0 left-0 inline-flex justify-center items-center pl-2">
            {leftSlot()}
          </div>
        ) : null}
      </div>
      {error ? (
        <p
          className="mt-2 w-full text-left text-sm text-red-500"
          id={props.id ? `${props.id}-error-description` : undefined}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
