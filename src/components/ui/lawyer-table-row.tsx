import { useMemo } from "preact/hooks";
import { TableCell, TableRow } from "./table";
import classNames from "classnames";
import { Avatar } from "./avatar";
import { setInitialColor } from "@/utils/functions/string-functions";
import { ILawyer } from "@/api/interfaces/lawyers";

interface LawyerRowProps {
  row: ILawyer;
  index: number;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onStatusChange: (data: {
    id: number;
    status: boolean;
    name: string;
    scn: string;
  }) => void;
  canEdit: boolean;
}

const LawyerTableRow = ({
  row,
  index,
  onEdit,
  onView,
  onStatusChange,
  canEdit,
}: LawyerRowProps) => {
  // Memoize expensive string concatenations
  const fullName = useMemo(
    () => `${row.last_name} ${row.first_name} ${row.middle_name}`,
    [row.last_name, row.first_name, row.middle_name]
  );

  const initials = useMemo(
    () => `${row.last_name[0]} ${row.first_name[0]}`,
    [row.last_name, row.first_name]
  );

  const colorClass = useMemo(() => setInitialColor(index % 10), [index]);

  return (
    <TableRow>
      <TableCell alignment="left">
        <div title={fullName} className="font-medium inline-flex items-center">
          <p
            className={`w-12 h-12 text-xl ${colorClass} text-white font-semibold rounded-full inline-flex justify-center items-center`}
          >
            {initials}
          </p>
          <p className="ml-2 max-w-[12rem] truncate inline-flex flex-col font-semibold">
            {fullName}
            <span className="text-gray-600 font-normal">{row.scn}</span>
          </p>
        </div>
      </TableCell>
      <TableCell alignment="left">
        <p
          title={row.email ?? ""}
          className="max-w-[12rem] truncate font-medium"
        >
          {row.email}
        </p>
      </TableCell>
      <TableCell alignment="left">{row.phone}</TableCell>
      <TableCell alignment="left">{row.year_of_call}</TableCell>
      <TableCell alignment="left">
        {row.branch?.toLocaleUpperCase() ?? ""}
      </TableCell>
      <TableCell alignment="left">{row.state_name}</TableCell>
      <TableCell alignment="left">
        <p
          className={`py-2 px-3 w-fit rounded-3xl ${
            row.enabled
              ? "bg-green-100 text-primary-500"
              : "bg-red-50 text-red-500"
          }`}
        >
          {row.enabled ? "Active" : "Inactive"}
        </p>
      </TableCell>
      <TableCell alignment="left">
        <div className="px-1 py-1">
          <div className="flex flex-col gap-1 items-start font-medium">
            <button
              type="button"
              className="hover:bg-gray-100 text-black w-full text-left p-3"
              onClick={() => onView(row.id)}
            >
              View info
            </button>
            <button
              type="button"
              className="hover:bg-gray-100 text-black w-full text-left p-3"
              onClick={() => {
                // if (row.has_onboarded) {
                onEdit(row.id);
                // }
              }}
              // disabled={!row.has_onboarded}
            >
              Edit
            </button>
            {canEdit && (
              <button
                type="button"
                className={`w-full text-left p-3 ${
                  !row.enabled
                    ? "hover:bg-gray-100 text-primary-500"
                    : "hover:bg-gray-100 text-red-500"
                }`}
                onClick={() =>
                  onStatusChange({
                    id: row.id,
                    status: !row.enabled,
                    name: fullName,
                    scn: row.scn,
                  })
                }
              >
                {row.enabled ? "Suspend lawyer" : "Activate lawyer"}
              </button>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Memoize the entire row component for better performance
export default LawyerTableRow;
