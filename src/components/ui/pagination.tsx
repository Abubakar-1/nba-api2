import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { FunctionalComponent } from "preact";
import { Select } from "./select";

interface Props {
  state?: {
    status: string;
    page: number;
    page_size: number;
    total_rows: number;
    exam_year: string;
    from_date?: string;
    to_date?: string;
  };
  onChange(page: number, status: string): void;
  onChangeSize(size: number): void;
}
export const Pagination: FunctionalComponent<Props> = ({
  state,
  onChange,
  onChangeSize,
}) => {
  // Return nothing while loading
  if (!state) {
    return null;
  }

  const safePageSize = state.page_size > 0 ? state.page_size : 20;

  const pages = Math.ceil(state.total_rows / safePageSize);
  const isCurrentPageFirst = state.page === 1;
  const isCurrentPageLast = state.page === pages;
  let isPageNumberOutOfRange = false;

  const changePage = (p: number) => {
    if (state.page === p) return;
    onChange(p, state.status);
    // scrollToTop();
  };

  const onPreviousPageClick = () => {
    changePage(state.page - 1);
  };

  const onNextPageClick = () => {
    changePage(state.page + 1);
  };

  const pageNumbers = [...new Array(pages)].map((_, index) => {
    const pageNumber = index + 1;
    const isPageNumberFirst = pageNumber === 1;
    const isPageNumberLast = pageNumber === pages;
    const isCurrentPageWithinTwoPageNumbers =
      Math.abs(pageNumber - state.page) <= 2;

    if (
      isPageNumberFirst ||
      isPageNumberLast ||
      isCurrentPageWithinTwoPageNumbers
    ) {
      isPageNumberOutOfRange = false;
      return (
        <button
          aria-current="page"
          className={classNames(
            "relative z-10 inline-flex items-center  px-3 py-1.5 w-6 h-6 justify-center rounded-full text-sm font-medium focus:z-20",
            {
              " text-black font-semibold": pageNumber === state.page,
              "text-gray-500 hover:bg-gray-50   bg-white":
                pageNumber !== state.page,
            }
          )}
          onClick={() => onChange(pageNumber, state.status)}
        >
          {pageNumber}
        </button>
      );
    }

    if (!isPageNumberOutOfRange) {
      isPageNumberOutOfRange = true;
      return (
        <span className="relative inline-flex items-center bg-white px-3 py-1.5 w-6 h-6 justify-center  text-sm font-medium text-gray-700">
          ...
        </span>
      );
    }

    return null;
  });
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={onPreviousPageClick}
          disabled={isCurrentPageFirst}
          title={
            isCurrentPageFirst
              ? "You are on page 1"
              : `Go to page ${state.page - 1}`
          }
          className="relative inline-flex items-center border border-gray-300 bg-white px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={onNextPageClick}
          disabled={isCurrentPageLast}
          title={
            isCurrentPageFirst
              ? "You are on last page"
              : `Go to page ${state.page + 1}`
          }
          className="relative ml-3 inline-flex items-center border border-gray-300 bg-white px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <Select
            className="w-28"
            onChange={(e) => onChangeSize(Number(e.currentTarget.value))}
            defaultValue={String(state.page_size)}
          >
            <option value={20}>20 Rows</option>
            <option value={50}>50 Rows</option>
            <option value={100}>100 Rows</option>
          </Select>
        </div>
        <div>
          <nav
            className="inline-flex items-center space-x-2"
            aria-label="Pagination"
          >
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{state.page}</span> of{" "}
              <span className="font-medium">
                {Math.ceil(state.total_rows / state.page_size)}
              </span>
            </p>
            <button
              onClick={onPreviousPageClick}
              disabled={isCurrentPageFirst}
              title={
                isCurrentPageFirst
                  ? "You are on page 1"
                  : `Go to page ${state.page - 1}`
              }
              className="relative inline-flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 bg-white p-0.5 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            {pageNumbers}
            <button
              onClick={onNextPageClick}
              disabled={isCurrentPageLast}
              title={
                isCurrentPageFirst
                  ? "You are on last page"
                  : `Go to page ${state.page + 1}`
              }
              className="relative inline-flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 bg-white p-0.5 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
