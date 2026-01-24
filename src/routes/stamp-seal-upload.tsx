import {
  IMyStampRequest,
  IMyStampSealRequestResponse,
} from "@/api/interfaces/stamp-seal-request";
import { getMyStampSealRequest } from "@/api/stamp-seal-request";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { NotifyError } from "@/components/toast/toast";
import Input from "@/components/ui/input";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import { Pagination } from "@/components/ui/pagination";
import SearchHistory from "@/components/ui/search-history";
import { Select } from "@/components/ui/select";
import StampAndSealUpload from "@/components/ui/stamp-and-seal-upload";
import StampSealDetails from "@/components/ui/stamp-seal-details";
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
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { debounce } from "lodash";
import { Fragment } from "preact";
import { useEffect, useState, useMemo } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import AuthContext from "@/context/auth-context";

const StampSealUpload = () => {
  const { user } = AuthContext.useContainer();
  const [searchValue, setSearchValue] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_rows: 10,
    count: 10,
  });
  const [paginationState, setPaginationState] = useState<any>();
  const [approvalData, setApprovalData] = useState<IMyStampRequest | null>(
    null,
  );

  const [isViewStatus, setIsViewStatus] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [isBranchDuesReupload, setIsBranchDuesReupload] =
    useState<boolean>(false);
  const [approvalModalIsOpen, setApprovalModalIsOpen] =
    useState<boolean>(false);

  const navigate = useNavigate();

  const [filter, setFilter] = useState({
    status: "",
    isActive: false,
    search: "",
  });

  const { isLoading, error, response, makeRequest } = useFetcher<
    {
      page: number;
      page_size: number;
      search: string;
      status: string;
    },
    IMyStampSealRequestResponse
  >(getMyStampSealRequest, {
    page: pagination.page,
    page_size: pagination.page_size,
    search: filter.search,
    status: filter.status,
  });

  useEffect(() => {
    error && NotifyError(error?.name);
    if (response) {
      const items = response?.orders || response?.items || [];
      setPagination({
        page: response?.pagination.page ?? 1,
        page_size: response?.pagination.limit ?? 50,
        total_rows: response?.pagination.total ?? 10,
        count: items?.length ?? 10,
      });
    }
  }, [response, error?.message]);

  const filteredItems = useMemo(() => {
    // API returns 'orders' not 'items'
    const items = response?.orders || response?.items || [];
    if (!items || items.length === 0) return [];

    return items.filter((row: IMyStampRequest) => {
      // Filter out free items
      if (row.free) return false;

      // Search filter (by recipient name or enrollment number)
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesRecipient = row.recipient
          ?.toLowerCase()
          .includes(searchLower);
        const matchesSCN = row.recipient_scn
          ?.toLowerCase()
          .includes(searchLower);
        if (!matchesRecipient && !matchesSCN) return false;
      }

      // Status filter
      if (
        filter.status &&
        row.remark_status.toUpperCase() !== filter.status.toUpperCase()
      ) {
        return false;
      }

      return true;
    });
  }, [response, filter]);

  useEffect(() => {
    console.log("🔎 Filtered Items Count:", filteredItems.length);
    console.log("📦 Filtered Items:", filteredItems);
  }, [filteredItems]);

  useEffect(() => {
    setPaginationState({
      ...pagination,
      status: filter.search,
    });
  }, [pagination]);

  function changePage(p: number, s: string) {
    setPagination((v) => ({ ...v, page: p }));
    setFilter((f) => ({ ...f, status: s }));
  }
  function toggleModal() {
    setApprovalModalIsOpen(!approvalModalIsOpen);
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

  const handleViewStatusModal = () => {
    setIsViewStatus(!isViewStatus);
  };

  const handleUploadSuccess = () => {
    // Refresh the table after successful upload
    handleViewStatusModal(); // Close modal
    makeRequest(); // Refresh uses current state
  };
  return (
    <div className="px-4 mb-5">
      <StampSealDetails
        data={approvalData}
        state={approvalModalIsOpen}
        toggleModal={toggleModal}
      />
      <StampAndSealUpload
        toggleModal={() => handleViewStatusModal()}
        modalIsOpen={isViewStatus}
        id={userId}
        onSuccess={handleUploadSuccess}
      />
      <PageTitle title="Document Upload" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">
        Document Upload
      </h1>
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
        <div className="col-span-1 w-full lg:w-1/2  lg:ml-4">
          <Select
            dimension="lg"
            onChange={(e) => {
              setFilter((f) => ({ ...f, status: e.currentTarget.value }));
            }}
            defaultValue={filter.search}
          >
            <>
              <option value="" selected>
                ALL
              </option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>{" "}
              <option value="REJECTED">Rejected</option>
            </>
          </Select>
        </div>

        {/* filter component starts from here */}
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
        ) : response ? (
          <Table>
            <TableHead textSize="xs">
              <TableHeadItem>PAYER NAME</TableHeadItem>
              <TableHeadItem>AMOUNT</TableHeadItem>
              <TableHeadItem>ITEM TYPE</TableHeadItem>
              <TableHeadItem>REMARK</TableHeadItem>
              <TableHeadItem>TYPE</TableHeadItem>
              <TableHeadItem>DATE</TableHeadItem>
              <TableHeadItem>STATUS</TableHeadItem>
              <TableHeadItem>ACTION</TableHeadItem>
            </TableHead>
            <TableBody isEmpty={!filteredItems.length} isLoading={isLoading}>
              {filteredItems.map((row: IMyStampRequest, idx: number) => (
                <TableRow>
                  <TableCell alignment="left">
                    <p
                      title={`${user?.first_name || ""} ${
                        user?.last_name || ""
                      }`.trim()}
                      className="max-w-[15rem] truncate"
                    >
                      {`${user?.first_name || ""} ${
                        user?.last_name || ""
                      }`.trim() || "N/A"}
                    </p>
                  </TableCell>
                  <TableCell alignment="left">
                    <p className="font-bold">
                      {row.free ? "FREE" : "₦" + row.amount.toLocaleString()}
                    </p>
                  </TableCell>
                  <TableCell alignment="left">
                    {row.seal_type?.replaceAll("_", " ")}
                  </TableCell>
                  <TableCell alignment="left">{row.remark}</TableCell>
                  <TableCell alignment="left">
                    <p className="capitalize">
                      {row.is_government ? "PUBLIC" : "PRIVATE"}
                    </p>
                  </TableCell>
                  <TableCell alignment="left">
                    <p>
                      {new Date(row.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </TableCell>
                  <TableCell alignment="left">
                    <p
                      className={`py-2 px-3 w-fit ${classNames({
                        "bg-yellow-100 text-yellow-500":
                          row.remark_status.toUpperCase() === "",
                        "bg-green-100 text-primary-500 ":
                          row.remark_status.toUpperCase() === "APPROVED",
                        "bg-red-100 text-red-500 ":
                          row.remark_status.toUpperCase() === "REJECTED",
                      })} rounded-3xl uppercase`}
                    >
                      {!row.remark_status ? "PENDING" : row.remark_status}
                    </p>
                  </TableCell>
                  <TableCell alignment="center" last={true}>
                    <TableItemMenu>
                      <div className="px-1 py-1 ">
                        <div className="flex flex-col gap-1 items-start font-medium">
                          {/* Show upload button only for REJECTED or PENDING items */}
                          {(row.remark_status.toUpperCase() === "REJECTED" ||
                            row.remark_status.toUpperCase() === "PENDING" ||
                            !row.remark_status) && (
                            <>
                              {row.remark_status.toUpperCase() === "REJECTED" &&
                              (row.remark?.toLowerCase().includes("branch") ||
                                row.remark?.toLowerCase().includes("dues")) ? (
                                <button
                                  type="button"
                                  className="hover:bg-gray-100 text-black w-full text-left p-3"
                                  onClick={() => {
                                    handleViewStatusModal();
                                    setUserId(row.payment_id);
                                  }}
                                >
                                  Re-upload Branch Dues Receipt
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="hover:bg-gray-100 text-black w-full text-left p-3"
                                  onClick={() => {
                                    handleViewStatusModal();
                                    setUserId(row.payment_id);
                                  }}
                                >
                                  Upload document
                                </button>
                              )}
                            </>
                          )}

                          <button
                            type="button"
                            className="hover:bg-gray-100 text-black w-full text-left p-3"
                            onClick={() => {
                              if (
                                row.remark_status?.toUpperCase() === "APPROVED"
                              ) {
                                navigate(
                                  `/transaction/details?id=${row.payment_id}`,
                                );
                              } else {
                                setApprovalData(row);
                                setApprovalModalIsOpen(true);
                              }
                            }}
                          >
                            View detail
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

export default StampSealUpload;
