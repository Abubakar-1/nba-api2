import classNames from "classnames";
import {
  ComponentChild,
  ComponentChildren,
  FunctionalComponent,
  h,
} from "preact";
import { useMemo } from "preact/hooks";
import PageLoader from "./page-loader";

interface TableProps extends h.JSX.HTMLAttributes<HTMLTableElement> {}

export const Table: FunctionalComponent<TableProps> = ({ children }) => {
  // Optimized: Convert children array once and cache both computations
  const { footer, _children } = useMemo(() => {
    const childrenArray = Array.isArray(children)
      ? children
      : Array.from(children as any);
    return {
      footer: childrenArray.find(
        (c: any) => c?.key === "footer"
      ) as ComponentChild,
      _children: childrenArray.filter(
        (c: any) => c?.key !== "footer"
      ) as ComponentChildren,
    };
  }, [children]);

  return (
    <div className="flex flex-col relative overflow-visible">
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded">
        <table className="min-w-full divide-y divide-gray-300">
          {_children}
        </table>
        {footer}
      </div>
    </div>
  );
};

interface THeadProps {
  variant?: "primary" | "gray";
  textSize?: "sm" | "base" | "lg" | "xs";
}

export const TableHead: FunctionalComponent<THeadProps> = ({
  children,
  variant,
  textSize = "sm",
}) => {
  return (
    <thead
      className={classNames("bg-gray-50", {
        "bg-primary-50": variant === "primary",
        "text-sm": textSize === "sm",
        "text-base": textSize === "base",
        "text-lg": textSize === "lg",
        "text-xs": textSize === "xs",
      })}
    >
      <tr>{children}</tr>
    </thead>
  );
};

export const TableBody: FunctionalComponent<{
  isEmpty?: boolean;
  isLoading?: boolean;
}> = ({ children, isEmpty, isLoading }) => {
  return (
    <tbody className="bg-white overflow-visible">
      {isEmpty && !isLoading ? (
        <tr className=" bg-gray-100">
          <td className="py-12" colSpan={100}>
            <p className="text-center font-light text-gray-400">
              No records found
            </p>
          </td>
        </tr>
      ) : null}
      {isLoading ? (
        <tr className=" bg-gray-100">
          <td className="py-12 " colSpan={100}>
            <div className="w-full flex justify-center items-center">
              <PageLoader isOutlined={true} />
            </div>
          </td>
        </tr>
      ) : null}
      {!isLoading ? children : null}
    </tbody>
  );
};

interface TableHeadItemProps {
  first?: boolean;
  last?: boolean;
  alignment?: "right" | "left" | "center";
}
export const TableHeadItem: FunctionalComponent<TableHeadItemProps> = ({
  children,
  first,
  last,
  alignment,
}) => {
  const classes = classNames({
    "py-3.5 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6": first,
    "px-3 py-3.5 text-left font-semibold text-gray-900": !(first && last),
    "relative py-3.5 pl-3 pr-4 sm:pr-6": last,
    "text-right": alignment === "right",
    "text-center": alignment === "center",
  });

  return (
    <th scope="col" className={classes}>
      {children}
    </th>
  );
};

interface TableRowProps {
  variant?: "primary";
  striped?: boolean;
}
export const TableRow: FunctionalComponent<TableRowProps> = ({
  children,
  variant,
  striped,
}) => {
  return (
    <tr
      className={classNames("bg-white", {
        "odd:bg-gray-50": striped,
        "odd:bg-primary-50": striped && variant === "primary",
      })}
      style={{ position: "relative" }}
    >
      {children}
    </tr>
  );
};

interface TableCell {
  first?: boolean;
  last?: boolean;
  alignment?: "right" | "left" | "center";
  colSpan?: number;
}

export const TableCell: FunctionalComponent<TableCell> = ({
  children,
  first,
  last,
  alignment = "left",
  colSpan,
}) => {
  const classes = classNames({
    "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6":
      first,
    "whitespace-nowrap px-3 py-4 text-sm text-gray-800 border-y border-gray-200 ":
      !(first && last),
    "relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 overflow-visible":
      last,
    "text-right": alignment === "right",
    "text-center": alignment === "center",
  });
  return (
    <td className={classes} colSpan={colSpan}>
      {children}
    </td>
  );
};

interface TableFooter {
  className?: string;
  key?: string;
}

/**
 *
 * @param key WARNING: Key must be set to "footer" for component to work properly
 * @returns
 */
export const TableFooter: FunctionalComponent<TableFooter> = ({
  children,
  className,
  key = "footer",
}) => {
  const classes = classNames(
    "border-t border-gray-200 bg-white w-full px-4 py-3 sm:px-6",
    className
  );
  return (
    <div id="table-footer" className={classes}>
      {children}
    </div>
  );
};
