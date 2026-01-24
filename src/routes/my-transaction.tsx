import {
  IMyTransaction,
  IMyTransactionResponse,
} from "@/api/interfaces/transaction";
import { verifyPaymentByReference } from "@/api/payment";
import { getTransaction } from "@/api/transaction";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/react-query";
import { logger } from "@/utils/logger";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { useRequest } from "@/components/hooks/use-request";
import StampAndSealUpload from "@/components/ui/stamp-and-seal-upload";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Input from "@/components/ui/input";
import { BtnLoader } from "@/components/ui/loader";
import PageLoader from "@/components/ui/page-loader";
import { Pagination } from "@/components/ui/pagination";
import SearchHistory from "@/components/ui/search-history";
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
import PhotoContext from "@/context/photo-context";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import { formatCreatedAtDate } from "@/utils/functions/string-functions";
import PageTitle from "@/components/ui/page-title";

const MyTransaction = () => {
  const { setPhotoInfo } = PhotoContext.useContainer();
  const navigate = useNavigate();

  // const [isViewStatus, setIsViewStatus] = useState<boolean>(false);
  // const [userId, setUserId] = useState<number>(0);
  const [searchValue, setSearchValue] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_rows: 10,
    count: 10,
  });
  const [paginationState, setPaginationState] = useState<any>();

  const [filter, setFilter] = useState({
    page: 1,
    page_size: 50,
    status: "",
    payment_type: "",
    from_date: "",
    to_date: "",
    search: "",
  });

  const {
    data: transactionData,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.transactions.list({
      page: pagination.page,
      page_size: pagination.page_size,
      search: filter.search,
    }),
    queryFn: async () => {
      try {
        logger.debug("Fetching my transactions", {
          page: pagination.page,
          search: filter.search,
        });
        const [response, err] = await getTransaction({
          page: pagination.page,
          page_size: pagination.page_size,
          search: filter.search,
        });
        if (err) {
          logger.error("Failed to fetch my transactions", err);
          throw err;
        }
        return response as IMyTransactionResponse;
      } catch (err) {
        logger.error("My transactions query error", err);
        throw err;
      }
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });

  const queryClient = useQueryClient();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyTransaction = async (val: string) => {
    try {
      // Set loading state
      setIsVerifying(true);

      // Show loading notification
      NotifySuccess("Verifying payment, please wait...");

      const [response, _err] = await verifyPaymentByReference(val);

      if (!_err && response.success) {
        // Show success with more details
        NotifySuccess(
          response?.message ||
            "Payment verified successfully! Your transaction has been updated.",
        );

        // Refresh transactions after verification
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });

        // Reload page to show updated status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Enhanced error handling with more details
        let errorMessage = "Failed to verify payment. Please try again.";

        if (_err?.data?.message) {
          errorMessage = _err.data.message;
        } else if (_err?.data?.info) {
          errorMessage = _err.data.info;
        } else if (_err?.message) {
          errorMessage = _err.message;
        } else if (_err?.info) {
          errorMessage = _err.info;
        }

        NotifyError(errorMessage);
      }
    } catch (error: any) {
      // Catch any unexpected errors
      NotifyError(
        error?.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      // Clear loading state
      setIsVerifying(false);
    }
  };

  // Normalize transaction data to fix payment_type
  const normalizedTransactionData = useMemo(() => {
    if (!transactionData) return null;

    return {
      ...transactionData,
      items:
        transactionData.items?.map((item: any) => {
          // The API returns payment type in 'type' field, not 'payment_type'
          // 'type' can be: "STAMP_SEAL", "BPF", "BRANCH_DUES", etc.
          let correctPaymentType = item.type || item.payment_type;

          // Format the type for display
          if (correctPaymentType) {
            const typeUpper = correctPaymentType.toUpperCase();

            if (typeUpper.includes("STAMP") || typeUpper.includes("SEAL")) {
              correctPaymentType = "Stamp & Seal";
            } else if (
              typeUpper.includes("BRANCH") ||
              typeUpper.includes("DUES")
            ) {
              correctPaymentType = "Branch Dues";
            } else if (typeUpper.includes("BPF")) {
              correctPaymentType = "BPF";
            } else {
              // Keep the original value if it doesn't match known types
              correctPaymentType = correctPaymentType;
            }
          } else {
            // Fallback: Check item_description or tag if type is not available
            const description = (item.item_description || "").toLowerCase();
            const tag = (item.tag || "").toLowerCase();

            if (
              description.includes("stamp") ||
              description.includes("seal") ||
              tag.includes("stamp")
            ) {
              correctPaymentType = "Stamp & Seal";
            } else if (
              description.includes("branch") ||
              description.includes("dues") ||
              tag.includes("branch")
            ) {
              correctPaymentType = "Branch Dues";
            } else {
              correctPaymentType = "BPF";
            }
          }

          return {
            ...item,
            type: correctPaymentType, // Update type field for display
          };
        }) || [],
    };
  }, [transactionData]);

  useEffect(() => {
    error && NotifyError((error as any)?.message || (error as any)?.name);
    const dataToUse = normalizedTransactionData || transactionData;
    if (dataToUse?.pagination) {
      setPagination({
        page: dataToUse.pagination.page ?? 1,
        page_size:
          dataToUse.pagination.limit ?? dataToUse.pagination.page_size ?? 50,
        total_rows:
          dataToUse.pagination.total ?? dataToUse.pagination.total_rows ?? 0,
        count: dataToUse.items?.length ?? 0,
      });
    }
  }, [normalizedTransactionData, transactionData, (error as any)?.message]);

  useEffect(() => {
    setPaginationState({
      ...pagination,
      status: filter.search,
    });
  }, [pagination]);

  // Prefetch next page for smoother pagination
  useEffect(() => {
    if (!transactionData?.pagination) return;
    const limit =
      transactionData.pagination.limit ??
      transactionData.pagination.page_size ??
      20;
    const total =
      transactionData.pagination.total ??
      transactionData.pagination.total_rows ??
      0;

    const nextPage = (transactionData.pagination.page ?? 1) + 1;
    const totalPages = Math.ceil(total / limit);

    if (nextPage <= totalPages) {
      queryClient
        .prefetchQuery({
          queryKey: queryKeys.transactions.list({
            page: nextPage,
            page_size: limit,
            search: filter.search,
          }),
          queryFn: async () => {
            const [response, err] = await getTransaction({
              page: nextPage,
              page_size: limit,
              search: filter.search,
            });
            if (err) throw err;
            return response as IMyTransactionResponse;
          },
          staleTime: 3 * 60 * 1000,
        })
        .catch(() => {});
    }
  }, [transactionData, filter.search, queryClient]);

  function changePage(p: number, s: string) {
    setPagination((v) => ({ ...v, page: p }));
    setFilter((f) => ({ ...f, status: s }));
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

  // const handleViewStatusModal = () => {
  //   setIsViewStatus(!isViewStatus);
  // };

  return (
    <div className="px-4 mb-5">
      <PageTitle title="All Transactions" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">
        My Transaction
      </h1>
      {/* <StampAndSealUpload
        toggleModal={() => handleViewStatusModal()}
        modalIsOpen={isViewStatus}
        id={userId}
      /> */}
      <div className="grid grid-cols-1 lg:grid-cols-5 w-full lg:mt-14 mb-5">
        <div className="col-span-2 w-full mb-3 lg:mb-0">
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
            placeholder={"Search by reference number or email"}
            className=" w-full"
          />
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
        ) : normalizedTransactionData ? (
          <Table>
            <TableHead textSize="xs">
              {/* <TableHeadItem> ID</TableHeadItem> */}
              <TableHeadItem>REFERENCE</TableHeadItem>
              <TableHeadItem>AMOUNT</TableHeadItem>
              <TableHeadItem>YEAR</TableHeadItem>
              <TableHeadItem>PAYMENT TYPE</TableHeadItem>
              <TableHeadItem>PAYMENT DATE</TableHeadItem>
              <TableHeadItem>DESCRIPTION</TableHeadItem>
              <TableHeadItem>STATUS</TableHeadItem>
              <TableHeadItem>ACTION</TableHeadItem>
            </TableHead>
            <TableBody
              isEmpty={!normalizedTransactionData?.items?.length}
              isLoading={isLoading}
            >
              {normalizedTransactionData?.items?.map(
                (row: IMyTransaction, idx: number) => (
                  <TableRow>
                    {/* <TableCell alignment="left">{row.id}</TableCell> */}
                    <TableCell alignment="left">{row.reference}</TableCell>
                    <TableCell alignment="left">
                      &#8358;{row.amount.toLocaleString()}
                    </TableCell>
                    <TableCell alignment="left">{row.year}</TableCell>
                    <TableCell alignment="left">{row.type}</TableCell>
                    <TableCell alignment="left">{row.created_at}</TableCell>
                    <TableCell alignment="left">
                      {row.item_description}
                    </TableCell>
                    <TableCell alignment="left">
                      <p
                        className={`py-2 px-3 w-fit ${classNames({
                          "bg-yellow-100 text-yellow-500":
                            row.status.toUpperCase() === "PENDING",
                          "bg-green-100 text-primary-500 ":
                            row.status.toUpperCase() === "APPROVED",
                          "bg-red-100 text-red-500 ":
                            row.status.toUpperCase() === "FAILED",
                        })} rounded-3xl`}
                      >
                        {row.status}
                      </p>
                    </TableCell>
                    <TableCell alignment="left">
                      {row.status.toUpperCase() === "PENDING" ? (
                        // PENDING: Check if payment link exists
                        row.payment_link ? (
                          // Has payment link - show Pay Now button
                          <button
                            type="button"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => {
                              if (row.payment_link?.payment_link) {
                                window.open(
                                  row.payment_link.payment_link,
                                  "_blank",
                                  "noopener,noreferrer",
                                );
                              }
                            }}
                          >
                            Pay Now
                          </button>
                        ) : (
                          // No payment link - show View Transaction button
                          <button
                            type="button"
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                            onClick={() =>
                              navigate(`/transaction/details?id=${row.id}`)
                            }
                          >
                            View Transaction
                          </button>
                        )
                      ) : row.status.toUpperCase() === "PROCESSING" ? (
                        // PROCESSING: Show Verify Payment button
                        <button
                          type="button"
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isVerifying}
                          onClick={() => verifyTransaction(row.reference)}
                        >
                          {isVerifying ? (
                            <BtnLoader outline={true} />
                          ) : (
                            "Verify Payment"
                          )}
                        </button>
                      ) : row.status.toLocaleUpperCase() === "APPROVED" ? (
                        // APPROVED: Show View Receipt button
                        <button
                          type="button"
                          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                          onClick={() => {
                            // Navigate to details to ensure we fetch full transaction data (including payer info/gateway)
                            // before showing receipt.
                            navigate(`/transaction/details?id=${row.id}`);
                          }}
                        >
                          View Receipt
                        </button>
                      ) : row.status.toUpperCase() === "FAILED" ? (
                        <></>
                      ) : (
                        // FAILED: Show Verify Payment button
                        // <button
                        //   type="button"
                        //   className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        //   disabled={isVerifying}
                        //   onClick={() => verifyTransaction(row.reference)}
                        // >
                        //   {isVerifying ? (
                        //     <BtnLoader outline={true} />
                        //   ) : (
                        //     "Verify Payment"
                        //   )}
                        // </button>
                        // Other statuses: Show dash
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ),
              )}
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

export default MyTransaction;
