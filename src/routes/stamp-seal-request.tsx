import {
  IStampMetrics,
  IStampSealRequest,
  IStampSealRequestResponse,
} from "@/api/interfaces/stamp-seal-request";
import {
  getAllStampSealRequest,
  getStampMetrics,
} from "@/api/stamp-seal-request";
import DashboardHammerIcon from "@/assets/icons/dashboard-hammer-icon";
import { NotifyError } from "@/components/toast/toast";
import {
  useStampRequestsQuery,
  useAdminStampSealOrdersQuery,
  usePrefetchStampRequests,
} from "@/components/hooks/use-stamp-requests-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/react-query";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import { Pagination } from "@/components/ui/pagination";
import SearchHistory from "@/components/ui/search-history";
import { Select } from "@/components/ui/select";
import StampRequestExport from "@/components/ui/stamp-request-export";
import StampSealApproval from "@/components/ui/stamp-seal-approval";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeadItem,
  TableRow,
} from "@/components/ui/table";
import { TableItemMenu } from "@/components/ui/table-item-menu";
import { setInitialColor } from "@/utils/functions/string-functions";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import classNames from "classnames";
import { debounce } from "lodash";
import { Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";

const StampSealRequest = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_rows: 10,
    count: 10,
  });
  const [paginationState, setPaginationState] = useState<any>();
  const [approvalData, setApprovalData] = useState<IStampSealRequest | null>(
    null,
  );
  const [isFilterModal, setIsFilterModal] = useState(false);

  const [approvalModalIsOpen, setApprovalModalIsOpen] =
    useState<boolean>(false);

  const navigate = useNavigate();

  const [filter, setFilter] = useState<{
    isActive: boolean;
    search: string;
    remark_status: string;
    status?: string;
  }>({
    isActive: false,
    search: "",
    remark_status: "",
  });

  // React Query based fetching for stamp requests and metrics
  const {
    data: stampData,
    isLoading,
    error,
  } = useAdminStampSealOrdersQuery({
    page: pagination.page,
    page_size: pagination.page_size,
    ...(filter.search && { search: filter.search }),
    ...(filter.remark_status && { remark_status: filter.remark_status }),
  });

  console.log("stamp data", stampData);

  const prefetchStampRequests = usePrefetchStampRequests();

  const queryClient = useQueryClient();

  const { data: stampMetricsData } = useQuery({
    queryKey: queryKeys.stampSeal.metrics(),
    queryFn: async () => {
      const [response, err] = await getStampMetrics();
      if (err) throw err;
      return response as IStampMetrics;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    error && NotifyError((error as any)?.message || (error as any)?.name);
    if (stampData) {
      setPagination((prev) => ({
        ...prev,
        // Only update total rows and count, keep current page/size unless explicitly changed
        // Check for 'limit' as well since API might return that instead of page_size
        // Default to current page_size (prev.page_size) if missing, to avoid reset to 1
        page_size:
          stampData?.pagination.page_size ??
          stampData?.pagination.limit ??
          prev.page_size,
        total_rows: stampData?.pagination.total_rows ?? 0,
        count: stampData?.items?.length ?? 0,
      }));
    }
  }, [stampData, (error as any)?.message]);

  useEffect(() => {
    setPaginationState({
      ...pagination,
      remark_status: filter.remark_status,
    });
  }, [pagination, filter]);

  // Prefetch next page for smoother pagination
  useEffect(() => {
    if (!stampData) return;
    const nextPage = (stampData.pagination.page ?? 1) + 1;
    // Use totalPages from API if available, otherwise calculate
    const totalPages =
      stampData.pagination.totalPages ??
      Math.ceil(
        (stampData.pagination.total_rows ?? 0) /
          (stampData.pagination.page_size ?? 1),
      );
    if (nextPage <= totalPages) {
      prefetchStampRequests({
        page: nextPage,
        page_size: stampData.pagination.page_size,
        ...(filter.search && { search: filter.search }),
        ...(filter.remark_status && { remark_status: filter.remark_status }),
      }).catch(() => {});
    }
  }, [stampData, filter, prefetchStampRequests]);

  function changePage(p: number, s: string) {
    setPagination((v) => ({ ...v, page: p }));
    setFilter((f) => ({ ...f, status: s }));
  }
  function toggleModal() {
    setApprovalModalIsOpen(!approvalModalIsOpen);
  }

  function toggleExportModal() {
    setIsFilterModal(!isFilterModal);
  }

  function changeSize(s: number) {
    setPagination((v) => ({ ...v, page_size: s, page: 1 }));
  }

  function searchTransaction(searchValue: string) {
    setFilter((f) => ({ ...f, search: searchValue }));
  }
  const handleKeypress = debounce((searchValue: string) => {
    searchTransaction(searchValue);
    setSearchValue(searchValue);
  }, 1000);

  return (
    <div className="px-4 mb-5">
      <StampSealApproval
        data={approvalData}
        state={approvalModalIsOpen}
        toggleModal={toggleModal}
        refresh={() => {
          // Invalidate stampSeal queries so lists and metrics refresh after approval
          queryClient.invalidateQueries({ queryKey: queryKeys.stampSeal.all });
        }}
      />

      <StampRequestExport
        state={isFilterModal}
        toggleModal={toggleExportModal}
        currentStampData={stampData?.items || []}
        filters={filter}
      />
      <PageTitle title="Stamp and Seal Request" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">
        Stamp and seal document
      </h1>

      <div className="flex flex-col lg:flex-row justify-center gap-4 ">
        <div className="flex flex-col  justify-between w-full h-full border border-b-[3px] border-b-[#01BEBD] rounded">
          <div className="flex justify-start items-center">
            <div className="m-7 p-2 w-12 h-12 bg-[#01BEBD] flex justify-center items-center rounded-sm text-white">
              <DashboardHammerIcon />
            </div>
            <div className="flex flex-col">
              <p className="text-gray-500">Total request</p>
              <h1 className="font-bold text-xl">
                {stampMetricsData?.data?.totalRequest?.toLocaleString() || "O"}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col  justify-between w-full h-full border border-b-[3px] border-b-[#009009] rounded">
          <div className="flex justify-start items-center">
            <div className="m-7 p-2 w-12 h-12 bg-[#009009] flex justify-center items-center rounded-sm text-white">
              <DashboardHammerIcon />
            </div>
            <div className="flex flex-col">
              <p className="text-gray-500">Approved</p>
              <h1 className="font-bold text-xl">
                {stampMetricsData?.data?.totalApproved?.toLocaleString() || "O"}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col  justify-between w-full h-full border border-b-[3px] border-b-[#FBEA04] rounded">
          <div className="flex justify-start items-center">
            <div className="m-7 p-2 w-12 h-12 bg-[#FBEA04] flex justify-center items-center rounded-sm text-white">
              <DashboardHammerIcon />
            </div>
            <div className="flex flex-col">
              <p className="text-gray-500">Pending</p>
              <h1 className="font-bold text-xl">
                {stampMetricsData?.data?.totalPending?.toLocaleString() || "O"}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between w-full h-full border border-b-[3px] border-b-[#FF4C68] rounded">
          <div className="flex justify-start items-center">
            <div className="m-7 p-2 w-12 h-12 bg-[#FF4C68] flex justify-center items-center rounded-sm text-white">
              <DashboardHammerIcon />
            </div>
            <div className="flex flex-col">
              <p className="text-gray-500">Rejected</p>
              <h1 className="font-bold text-xl">
                {stampMetricsData?.data?.totalRejected?.toLocaleString() || "O"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 w-full lg:mt-10 mt-5 mb-5">
        <div className="col-span-2 lg:col-span-2 w-full mb-5 lg:mb-0">
          <Input
            id="search"
            dimension="lg"
            variant="primary"
            value={searchValue}
            onChange={(e) => {
              handleKeypress(e.currentTarget.value);
            }}
            rightSlot={() => (
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            )}
            type="text"
            placeholder={"Search by enrollment number or full name"}
            className=" w-full"
          />
        </div>
        <div className="col-span-1 w-full lg:w-1/2 mb-6 lg:ml-4">
          <Select
            dimension="lg"
            onChange={(e) => {
              const val = e.currentTarget.value;
              setFilter((f) => ({
                ...f,
                remark_status: val,
              }));
            }}
            defaultValue={filter.remark_status}
          >
            <>
              <option value="">ALL</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
            </>
          </Select>
        </div>
        <div className="col-span-2 lg:col-span-2 w-full ">
          <div className="w-full flex items-center justify-end">
            <Button
              dimension="lg"
              variant="primary"
              className="w-full lg:w-fit inline-flex items-center justify-center gap-2 text-white text-sm rounded-3xl hover:cursor-pointer bg-primary-500 px-4 py-3"
              onClick={toggleExportModal}
            >
              Export records <ArrowDownTrayIcon className="w-5" />
            </Button>
          </div>
        </div>
        {/* filter component starts from here */}
        <div className="col-span-2 w-full mb-3 lg:mb-0">
          <div className="flex justify-center items-center w-full h-full">
            <div className=" justify-between items-center text-gray-500 w-full lg:w-2/3 h-12 hidden lg:flex"></div>
            <div className="hidden lg:block bg-yelow-300 w-1/3 h-10"></div>
          </div>
        </div>
      </div>
      <div className="mb-2">
        <SearchHistory
          search={filter.search}
          payment_type=""
          from_date=""
          to_date=""
          clearPaymentType={() => {}}
          clearDate={() => {}}
          clearSearch={() => {
            setFilter((f) => ({ ...f, search: "" }));
            setSearchValue("");
          }}
        />
      </div>
      <div>
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <PageLoader isOutlined={isLoading} />
          </div>
        ) : stampData ? (
          <Table>
            <TableHead textSize="xs">
              <TableHeadItem>PAYER NAME</TableHeadItem>
              {/* <TableHeadItem>EMAIL</TableHeadItem> */}
              <TableHeadItem>AMOUNT</TableHeadItem>
              <TableHeadItem>BRANCH</TableHeadItem>
              <TableHeadItem>ITEM TYPE</TableHeadItem>
              <TableHeadItem>REMARK</TableHeadItem>
              <TableHeadItem>TYPE</TableHeadItem>
              <TableHeadItem>STATUS</TableHeadItem>
              <TableHeadItem>ACTION</TableHeadItem>
            </TableHead>
            <TableBody>
              {stampData?.items.map((row: IStampSealRequest, idx: number) => (
                <TableRow>
                  <TableCell alignment="left">
                    {/* <p title={row.recipient} className="max-w-[17rem] truncate">
                      {row.recipient}
                    </p> */}

                    <div
                      title={row.payer_name || "N/A"}
                      className="font-medium inline-flex items-center"
                    >
                      <p
                        className={`w-12 h-12 text-xl ${setInitialColor(
                          idx % 10,
                        )} text-white font-semibod rounded-full inline-flex justify-center items-center`}
                      >
                        {row.payer_name && row.payer_name.split(" ").length >= 2
                          ? row.payer_name.split(" ")[0][0] +
                            " " +
                            row.payer_name.split(" ")[1][0]
                          : row.payer_name
                            ? row.payer_name.substring(0, 2).toUpperCase()
                            : "NA"}
                      </p>
                      <p className="ml-2 max-w-[12rem] truncate inline-flex flex-col font-semibold">
                        {row.payer_name || "N/A"}
                        <span className="text-gray-600 font-normal">
                          {row.recipient_scn || ""}
                        </span>
                      </p>
                    </div>
                  </TableCell>
                  {/* <TableCell alignment="left">
                    {row.user_email || "N/A"}
                  </TableCell> */}
                  <TableCell alignment="left">
                    <p className="font-bold">
                      &#8358;{row.amount.toLocaleString()}
                    </p>
                  </TableCell>
                  <TableCell alignment="left">{row?.branch}</TableCell>
                  <TableCell alignment="left">{row.seal_type}</TableCell>
                  <TableCell alignment="left">{row.remark}</TableCell>
                  <TableCell alignment="left">
                    <p className="capitalize">{row.request_type}</p>
                  </TableCell>
                  <TableCell alignment="left">
                    <p
                      className={`py-2 px-3 w-fit ${classNames({
                        "bg-yellow-100 text-yellow-500":
                          !row.remark_status ||
                          row.remark_status.toUpperCase() === "PENDING",
                        "bg-green-100 text-primary-500":
                          row.remark_status?.toUpperCase() === "APPROVED",
                        "bg-red-100 text-red-500":
                          row.remark_status?.toUpperCase() === "REJECTED",
                      })} rounded-3xl uppercase`}
                    >
                      {!row.remark_status ? "PENDING" : row.remark_status}
                    </p>
                  </TableCell>
                  <TableCell alignment="left">
                    <TableItemMenu>
                      <div className="px-1 py-1 ">
                        <div className="flex flex-col gap-1 items-start font-medium">
                          <button
                            type="button"
                            className="hover:bg-gray-100 text-black w-full text-left p-3"
                            onClick={() => {
                              setApprovalData(row);
                              setApprovalModalIsOpen(true);
                            }}
                          >
                            Approve/Reject
                          </button>
                          <button
                            type="button"
                            className="hover:bg-gray-100 text-black w-full text-left p-3"
                            onClick={() => {
                              navigate(`/stampseal/doc/${row.id}`, {
                                state: row,
                              });
                            }}
                          >
                            View Details
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
        ) : null}
      </div>
    </div>
  );
};

export default StampSealRequest;
