import { FunctionalComponent } from "preact";
import { useState, useCallback, useMemo, useEffect } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import { getLawyers, getBranchLawyers } from "@/api/lawyers";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { usePrefetchLawyers } from "@/components/hooks/use-lawyers-query";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import Input from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeadItem,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { TableItemMenu } from "@/components/ui/table-item-menu";
import { MagnifyingGlassIcon, UsersIcon } from "@heroicons/react/24/solid";
import AuthContext from "@/context/auth-context";
import { formatCreatedAtDate } from "@/utils/functions/string-functions";
import { setInitialColor } from "@/utils/functions/string-functions";

// Helper to get initials from name
const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const BranchAdminDashboard: FunctionalComponent = () => {
  const navigate = useNavigate();
  const { user } = AuthContext.useContainer();

  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_rows: 0,
    count: 0,
  });
  const [paginationState, setPaginationState] = useState<any>();

  // Memoize fetch params to prevent infinite render loop
  const fetchParams = useMemo(
    () => ({
      page: pagination.page,
      limit: pagination.page_size,
      branch: user?.branch || "",
    }),
    [pagination.page, pagination.page_size, user?.branch],
  );

  const lawyersRequest = useFetcher<any, any>(getBranchLawyers, fetchParams);
  const prefetchLawyers = usePrefetchLawyers();

  // Handle response updates
  // Handle response updates
  useEffect(() => {
    if (lawyersRequest.response) {
      const response = lawyersRequest.response;
      setPagination({
        page: response?.meta?.page ?? response?.pagination?.page ?? 1,
        page_size:
          response?.meta?.limit ??
          response?.pagination?.limit ??
          response?.pagination?.page_size ??
          20,
        total_rows:
          response?.meta?.total ??
          response?.pagination?.total ??
          response?.pagination?.total_rows ??
          0,
        count: response?.data?.length ?? response?.items?.length ?? 0,
      });
    }
  }, [lawyersRequest.response]);

  useEffect(() => {
    setPaginationState({
      ...pagination,
      status: searchValue,
    });
  }, [pagination]);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const changePage = useCallback((p: number, s: string) => {
    setPagination((v) => ({ ...v, page: p }));
    setSearchValue(s);
  }, []);

  const changeSize = useCallback((s: number) => {
    setPagination((v) => ({ ...v, page_size: s, page: 1 }));
  }, []);

  const handleViewMember = useCallback(
    (member: any) => {
      navigate(`/branch/admin/member/${member.id}`, { state: { member } });
    },
    [navigate],
  );

  const handleEditMember = useCallback((id: number) => {
    console.log("Edit member:", id);
  }, []);

  const members = useMemo(() => {
    return Array.isArray(lawyersRequest.response?.data)
      ? lawyersRequest.response.data
      : Array.isArray(lawyersRequest.response?.items)
        ? lawyersRequest.response.items
        : [];
  }, [lawyersRequest.response]);

  return (
    <div className="px-4 mb-5">
      <PageTitle title="Branch Members" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">Members</h1>

      <div className="grid grid-cols-1 w-full lg:mt-14 mb-5">
        <div className="w-full mb-3 lg:mb-0">
          <Input
            id="search"
            dimension="lg"
            variant="primary"
            onChange={(e) => handleSearch(e.currentTarget.value)}
            rightSlot={() => (
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            )}
            type="text"
            placeholder={"Search by name or enrollment number"}
            className="w-full"
          />
        </div>
      </div>

      <div>
        {!lawyersRequest.isLoading && !lawyersRequest.response && (
          <div className="w-full h-[400px] flex justify-center items-center">
            <p className="text-gray-500">No data available</p>
          </div>
        )}

        {!lawyersRequest.isLoading && lawyersRequest.response && (
          <Table>
            <TableHead textSize="xs">
              <TableHeadItem>FULL NAME</TableHeadItem>
              <TableHeadItem>EMAIL ADDRESS</TableHeadItem>
              <TableHeadItem>MOBILE</TableHeadItem>
              <TableHeadItem>YEAR OF CALL</TableHeadItem>
              <TableHeadItem>BRANCH</TableHeadItem>
              <TableHeadItem>DATE</TableHeadItem>
              <TableHeadItem>STATUS</TableHeadItem>
              <TableHeadItem>ACTION</TableHeadItem>
            </TableHead>
            <TableBody>
              {members.map((member: any, index: number) => (
                <TableRow key={member.id || index}>
                  <TableCell alignment="left">
                    <div
                      title={`${member.first_name} ${member.last_name}`}
                      className="font-medium inline-flex items-center"
                    >
                      <p
                        className={`w-12 h-12 text-xl ${setInitialColor(
                          index % 10,
                        )} text-white font-semibold rounded-full inline-flex justify-center items-center`}
                      >
                        {getInitials(
                          `${member.first_name} ${member.last_name}`,
                        )}
                      </p>
                      <p className="ml-2 max-w-[12rem] truncate inline-flex flex-col font-semibold">
                        {member.first_name} {member.last_name}
                        <span className="text-gray-600 font-normal">
                          {member.scn || "N/A"}
                        </span>
                      </p>
                    </div>
                  </TableCell>
                  <TableCell alignment="left">
                    <p
                      title={member.email || ""}
                      className="max-w-[12rem] truncate font-medium"
                    >
                      {member.email || "N/A"}
                    </p>
                  </TableCell>
                  <TableCell alignment="left">
                    {member.phone_number || member.phone || "N/A"}
                  </TableCell>
                  <TableCell alignment="left">
                    {member.year_of_call || "N/A"}
                  </TableCell>
                  <TableCell alignment="left">
                    {member.branch_name || member.branch || "N/A"}
                  </TableCell>
                  <TableCell alignment="left">
                    {member.created_at
                      ? formatCreatedAtDate(member.created_at)
                      : "N/A"}
                  </TableCell>
                  <TableCell alignment="left">
                    <p
                      className={`py-2 px-3 w-fit rounded-3xl ${
                        member.is_active || member.enabled
                          ? "bg-green-100 text-primary-500"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {member.is_active || member.enabled
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </TableCell>
                  <TableCell alignment="left">
                    <TableItemMenu>
                      <div className="px-1 py-1">
                        <div className="flex flex-col gap-1 items-start font-medium">
                          <button
                            type="button"
                            className="hover:bg-gray-100 text-black w-full text-left p-3"
                            onClick={() => handleViewMember(member)}
                          >
                            View Profile
                          </button>
                          <button
                            type="button"
                            className="hover:bg-gray-100 text-black w-full text-left p-3"
                            onClick={() => handleEditMember(member.id)}
                          >
                            Edit Member
                          </button>
                        </div>
                      </div>
                    </TableItemMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter key="footer">
              <Pagination
                state={paginationState}
                onChange={changePage}
                onChangeSize={changeSize}
              />
            </TableFooter>
          </Table>
        )}
      </div>
    </div>
  );
};

export default BranchAdminDashboard;
