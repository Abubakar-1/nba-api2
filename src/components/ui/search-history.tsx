import { XMarkIcon } from "@heroicons/react/24/solid";
import { FunctionalComponent } from "preact";

interface ISearchProps {
  search: string;
  payment_type: string;
  from_date: string;
  to_date: string;
  clearPaymentType(): void;
  clearDate(): void;
  clearSearch(): void;
}

const SearchHistory: FunctionalComponent<ISearchProps> = ({
  payment_type,
  search,
  from_date,
  to_date,
  clearPaymentType,
  clearDate,
  clearSearch,
}) => {
  return (
    <div className="w-fit flex gap-3">
      {search && (
        <div className="flex items-center text-xs font-semibold text-black gap-1 bg-primary-100 px-2 w-fit">
          Search: {search}
          <XMarkIcon
            className="w-4 h-4 font-semibold text-red-500 cursor-pointer"
            onClick={() => clearSearch()}
          />
        </div>
      )}

      {payment_type && (
        <div className="flex items-center text-xs font-semibold text-black gap-1 bg-primary-100 px-2 w-fit">
          Payment-type: {payment_type}
          <XMarkIcon
            className="w-4 h-4 font-semibold text-red-500 cursor-pointer"
            onClick={() => clearPaymentType()}
          />
        </div>
      )}

      {from_date && (
        <div className="flex items-center text-xs font-semibold text-black gap-1 bg-primary-100 px-2 w-fit">
          Date-filter: {from_date + " - " + to_date}
          <XMarkIcon
            className="w-4 h-4 font-semibold text-red-500 cursor-pointer"
            onClick={() => clearDate()}
          />
        </div>
      )}
    </div>
  );
};

export default SearchHistory;
