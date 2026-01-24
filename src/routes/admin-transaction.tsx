import {
  IFilter,
  ITransactionProps,
  ITransactionResponse,
  ITransactions,
} from "@/api/interfaces/transaction";
// API imports are used via React Query hooks; avoid direct fetcher usage here
import { useQueryClient } from "@tanstack/react-query";
import {
  useTransactionsQuery,
  useAdminTransactionsQuery,
  useVerifyPaymentMutation,
  usePrefetchTransactions,
} from "@/components/hooks/use-transactions-query";
import { queryKeys } from "@/api/react-query";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { BtnLoader } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import { Pagination } from "@/components/ui/pagination";
import SearchHistory from "@/components/ui/search-history";
import { Select } from "@/components/ui/select";
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
import { TransactionSchema } from "@/schema/transaction";
import { formatCreatedAtDate } from "@/utils/functions/string-functions";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import classNames from "classnames";
import { useFormik } from "formik";
import { debounce } from "lodash";
import { FunctionalComponent } from "preact";
import { useEffect, useState, useCallback, useMemo } from "preact/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { lazy, Suspense, memo } from "preact/compat";

// Lazy load payment modals for better code splitting
const Backlog = lazy(() => import("./payment/backlog"));
const BPFPayment = lazy(() => import("./payment/bpf-payment"));
const ViewStatus = lazy(() => import("./payment/view-status"));

const AdminTransaction: FunctionalComponent = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isFilterModal, setIsFilterModal] = useState(false);
  const [isBPF, setIsBPF] = useState<boolean>(false);
  const [isViewStatus, setIsViewStatus] = useState<boolean>(false);
  const [isUploadDocument, setIsUploadDocument] = useState<boolean>(false);
  const [userId, setUserId] = useState<number>(0);

  const [isBacklog, setIsBacklog] = useState<boolean>(false);
  // const [isStampAndSeal, setIsStampAndSeal] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [paymentSelection, setPaymentSelection] = useState<string>("");
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<ITransactions>();

  const [paginationState, setPaginationState] = useState<any>();
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_rows: 10,
    count: 10,
  });

  const filterParams = useFormik({
    initialValues: {
      status: "",
      state_code: "",
      search: "",
      payment_type: "",
      from_date: "",
      to_date: "",
    },
    onSubmit(values, formikHelpers) {},
  });

  const queryClient = useQueryClient();

  const filters: ITransactionProps = {
    page: pagination.page,
    page_size: pagination.page_size,
    search: filterParams.values.search,
    status: filterParams.values.status,
    payment_type: filterParams.values.payment_type,
    from_date: filterParams.values.from_date,
    to_date: filterParams.values.to_date,
  };

  const {
    data: response,
    isLoading,
    error,
    isFetching,
  } = useAdminTransactionsQuery(filters);
  const verifyMutation = useVerifyPaymentMutation();
  const prefetchTransactions = usePrefetchTransactions();
  const isVerifying = (verifyMutation as any).isLoading as boolean;

  // Memoize verify transaction callback to prevent recreation
  const verifyTransaction = useCallback(
    async ({ ref, type }: { ref: string; type?: string }) => {
      try {
        const res = await verifyMutation.mutateAsync({ ref, type });
        if (res.success) {
          NotifySuccess("Payment verified successfully");
        } else {
          NotifyError(res.message);
          return;
        }
        // mutation onSuccess already invalidates transaction queries
      } catch (err: any) {
        // prefer structured error message if available
        if (err?.data?.message) NotifyError(err.data.message);
        else if (err?.message) NotifyError(err.message);
        else if (!err.success) NotifyError(err.message);
        else NotifyError("Failed to verify payment");
      }
    },
    [verifyMutation],
  );

  useEffect(() => {
    if (error) {
      NotifyError(
        (error as any)?.name ||
          (error as any)?.message ||
          "Failed to fetch transactions",
      );
    }
  }, [error]);

  useEffect(() => {
    console.log("Admin Transactions Response:", response);
    if (response?.meta) {
      if (
        response.meta.total !== pagination.total_rows ||
        response?.meta.page !== pagination.page
      ) {
        setPagination((prev) => {
          if (
            prev.total_rows === response?.meta?.total &&
            prev.page === response?.meta?.page
          )
            return prev;

          return {
            page: response?.meta?.page ?? 1,
            page_size: response?.meta?.limit ?? 50,
            total_rows: response?.meta?.total ?? 0,
            count:
              (response?.data as any)?.length ??
              (response?.data as any)?.items?.length ??
              response?.items?.length ??
              0,
          };
        });
      }
    } else if (response?.pagination) {
      const total =
        response.pagination.total ?? response.pagination.total_rows ?? 0;
      const pageSize =
        response.pagination.limit ?? response.pagination.page_size ?? 50;

      if (
        total !== pagination.total_rows ||
        response.pagination.page !== pagination.page
      ) {
        setPagination((prev) => {
          if (
            prev.total_rows === total &&
            prev.page === response.pagination?.page
          )
            return prev;

          return {
            page: response.pagination?.page ?? 1,
            page_size: pageSize,
            total_rows: total,
            count: response.items?.length ?? 0,
          };
        });
      }
    }
  }, [response]);

  const formik = useFormik({
    initialValues: { payment_type: "", from_date: "", to_date: "" },
    onSubmit(values: IFilter) {
      // filterTransaction(values);
      formik.resetForm();
    },
    validationSchema: TransactionSchema,
  });

  // Memoize pagination callbacks
  const changePage = useCallback(
    (p: number, s: string) => {
      setPagination((v) => ({ ...v, page: p }));
      filterParams.setFieldValue("search", s);
    },
    [filterParams],
  );

  const changeSize = useCallback((s: number) => {
    setPagination((v) => ({ ...v, page_size: s, page: 1 }));
  }, []);

  // Memoize filter transaction callback
  const filterTransaction = useCallback(() => {
    filterParams.setFieldValue(
      "payment_type",
      formik.values.payment_type.toString(),
    );
    filterParams.setFieldValue("from_date", formik.values.from_date);
    filterParams.setFieldValue("to_date", formik.values.to_date);

    setIsFilterModal(!isFilterModal);
    formik.resetForm();
  }, [filterParams, formik, isFilterModal]);

  useEffect(() => {
    setPaginationState({
      ...pagination,
      status: filterParams.values.search,
    });
  }, [pagination, filterParams.values.search]);

  useEffect(() => {
    setIsBPF(false);
    setIsBacklog(false);

    if (location.pathname === "/payment/bpf") {
      navigate("/payment/bpf/pay");
      setIsBPF(true);
      // } else if (location.pathname === "/payment/sealandstamp") {
      //   navigate("/payment/sealandstamp/pay");
      //   setIsStampAndSeal(true);
    } else if (location.pathname === "/payment/backlog") {
      navigate("/payment/backlog/pay");
      setIsBacklog(true);
    }
  }, [location.pathname]);

  // Memoize modal toggle callbacks
  const handleBPFModal = useCallback(() => {
    setIsBPF(!isBPF);
  }, [isBPF]);

  const handleViewStatusModal = useCallback(
    (paymentType?: string, transaction?: ITransactions) => {
      if (paymentType) setSelectedPaymentType(paymentType);
      if (transaction) setSelectedTransaction(transaction);
      setIsViewStatus(!isViewStatus);
    },
    [isViewStatus],
  );

  const handleUploadDocumentModal = useCallback(() => {
    setIsUploadDocument(!isUploadDocument);
  }, [isUploadDocument]);

  const handleBacklogModal = useCallback(() => {
    setIsBacklog(!isBacklog);
  }, [isBacklog]);

  // const handleStampAndSealModal = () => {
  //   setIsStampAndSeal(!isStampAndSeal);
  // };

  const handlePaymentBtn = (val: string) => {
    setPaymentSelection(val);
    if (val === "BPF") {
      navigate("/payment/bpf");
      // } else if (selectedOption === "Stamp") {
      //   navigate("/payment/sealandstamp");
    } else if (val === "backlog") {
      navigate("/payment/backlog");
    } else if (val === "branch") {
      navigate("/payment/branchdues");
    }
    // Reset selection after navigation
    setTimeout(() => setPaymentSelection(""), 500);
  };

  function searchTransaction(searchValue: string) {
    filterParams.setFieldValue("state_code", "");
    filterParams.setFieldValue("status", "");
    filterParams.setFieldValue("search", searchValue);
  }

  const handleKeypress = debounce((value: string) => {
    setSearchValue(value);
    searchTransaction(value);
  }, 1000);
  return (
    <div className="px-4 mb-5">
      <PageTitle title="Admin Transaction" />
      <Modal
        isOpen={isFilterModal}
        showCloseIcon={isFilterModal}
        onClose={() => setIsFilterModal(false)}
      >
        <div>
          <h1 className="pl-1 font-bold">Apply filter</h1>
          <p className="pl-1 mt-7 text-sm">By Date</p>
          <div className="mt-3 w-full">
            <Select
              label="Payment type"
              id="payment_type"
              dimension="lg"
              variant="primary"
              {...formik.getFieldProps("payment_type")}
              type="text"
              autoComplete="payment_type"
              required
              error={
                formik.touched.payment_type
                  ? formik.errors.payment_type
                  : undefined
              }
            >
              <option value={""}>All</option>
              <option value="BPF" className="text-black">
                BPF
              </option>
              <option value="Branch Dues" className="text-black">
                Branch Dues
              </option>
              <option value="STAMP_SEAL" className="text-black">
                Stamp & Seal
              </option>
            </Select>
          </div>
          <div className="flex justify-between lg:justify-center items-center gap-2 lg:gap-4 w-full mt-5">
            <Input
              label="From"
              id="from_date"
              dimension="lg"
              variant="primary"
              type="date"
              min="1800-01-01"
              max={new Date().toISOString().split("T")[0]}
              placeholder="from"
              {...formik.getFieldProps("from_date")}
              name="from_date"
              className="md:w-full w-28 sm:w-36"
              required
            />
            <div className="hidden lg:block w-14 h-[2px] bg-gray-600 mt-5"></div>
            <Input
              label="To"
              id="to_date"
              dimension="lg"
              variant="primary"
              type="date"
              min="1800-01-01"
              max={new Date().toISOString().split("T")[0]}
              placeholder="to"
              {...formik.getFieldProps("to_date")}
              className="md:w-full w-28 sm:w-36"
              required
            />
          </div>
          <div className="w-full mt-10 font-medium">
            <button
              type="button"
              className=" px-2 w-full h-11 border border-primary-500 rounded-3xl text-white bg-primary-500 disabled:cursor-not-allowed"
              disabled={!formik.isValid}
              onClick={() => filterTransaction()}
            >
              Apply filter
            </button>
          </div>
          <div className="w-full mt-2 font-medium">
            <Button
              type="button"
              dimension="md"
              variant="primary"
              onClick={() => setIsFilterModal(false)}
              className=" px-2 w-full h-11 text-black"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">Transactions</h1>
      <ViewStatus
        toggleModal={() => handleViewStatusModal()}
        modalIsOpen={isViewStatus}
        id={userId}
        paymentType={selectedPaymentType}
        transaction={selectedTransaction}
      />

      <BPFPayment
        modalIsOpen={isBPF}
        funcModalIsOpen={() => handleBPFModal()}
        refresh={() =>
          queryClient.invalidateQueries({
            queryKey: queryKeys.transactions.all,
          })
        }
      />
      <Backlog
        modalIsOpen={isBacklog}
        funcModalIsOpen={() => handleBacklogModal()}
        refresh={() =>
          queryClient.invalidateQueries({
            queryKey: queryKeys.transactions.all,
          })
        }
      />
      {/* <StampAndSealPayment
        modalIsOpen={isStampAndSeal}
        funcModalIsOpen={() => handleStampAndSealModal()}
        refresh={makeRequest}
      /> */}
      <div className="grid grid-cols-1 lg:grid-cols-5 w-full lg:mt-14 mb-5">
        <div className="col-span-2 w-full mb-3 lg:mb-0">
          <Input
            id="password"
            dimension="lg"
            variant="primary"
            rightSlot={() => (
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            )}
            value={searchValue}
            type="text"
            onChange={(e) => {
              handleKeypress(e.currentTarget.value);
            }}
            placeholder={"Search by reference number"}
            className=" w-full"
          />
        </div>
        {/* filter component starts from here */}
        <div className="col-span-2 w-full mb-3 lg:mb-0">
          <div className="flex justify-center items-center w-full h-full">
            <div className="flex justify-end lg:justify-between items-center text-gray-500 w-full lg:w-2/3 h-12 ">
              {/* <h1 className="text-sm  w-1/2 text-center lg:min-w-[9rem] lg:border-r-1 lg:border-r-gray-300 lg:mr-4">
                  No filter applied
                </h1> */}
              <div
                role="button"
                onClick={() => setIsFilterModal(true)}
                className="flex hover:cursor-pointer justify-center items-center gap-4 lg:ml-4 rounded-3xl py-3 bg-gray-100 w-full lg:w-1/3 lg:min-w-[8rem] lg:max-w-[9rem]"
              >
                <PlusIcon className="w-5 h-5 -ml-2 text-primary-500" />
                <p className="text-sm text-primary-500">Add Filter</p>
              </div>
            </div>
            <div className="hidden lg:block bg-yelow-300 w-1/3 h-10"></div>
          </div>
        </div>

        <div className="inline-flex justify-end w-full lg:mt-1 relative text-sm">
          <select
            id="payment"
            value={paymentSelection}
            className="w-full lg:max-w-[10rem] text-center lg:text-left px-4 sm:text-sm font-semibold focus:outline-none appearance-none text-white py-3 -mt-1 rounded-3xl border hover:cursor-pointer bg-primary-500"
            onChange={(event) => handlePaymentBtn(event.currentTarget.value)}
          >
            <option selected disabled value="">
              Make payment
            </option>
            <option value="BPF" className="text-white">
              BPF
            </option>
            {/* <option value="Stamp" className="text-white">
              Stamp & Seal
            </option> */}
            <option value="backlog" className="text-white">
              Backlog
            </option>
            <option value="branch" className="text-white">
              Branch Dues
            </option>
          </select>
          <ChevronDownIcon className="absolute pointer-events-none text-white top-3 right-20 lg:right-4 w-4 h-4" />
        </div>
      </div>
      <div className="mb-2">
        <SearchHistory
          search={searchValue}
          payment_type={filterParams.values.payment_type}
          from_date={filterParams.values.from_date}
          to_date={filterParams.values.to_date}
          clearPaymentType={() =>
            filterParams.setFieldValue("payment_type", "")
          }
          clearDate={() => {
            filterParams.setFieldValue("from_date", "");
            filterParams.setFieldValue("to_date", "");
          }}
          clearSearch={() => {
            filterParams.setFieldValue("search", "");
            setSearchValue("");
          }}
        />
      </div>
      <div>
        {isLoading || isFetching ? (
          <div className="w-full h-full flex justify-center items-center">
            <PageLoader isOutlined={isLoading || isFetching} />
          </div>
        ) : response ? (
          <Table>
            <TableHead textSize="xs">
              <TableHeadItem>PAYER</TableHeadItem>
              <TableHeadItem>PAYMENT TYPE</TableHeadItem>
              <TableHeadItem>REFERENCE</TableHeadItem>
              <TableHeadItem>DATE</TableHeadItem>
              <TableHeadItem>AMOUNT</TableHeadItem>
              <TableHeadItem>STATUS</TableHeadItem>
              <TableHeadItem>ACTION</TableHeadItem>
            </TableHead>
            <TableBody>
              {(response?.data as any)?.map(
                (row: ITransactions, idx: number) => (
                  <TableRow>
                    <TableCell alignment="left">{row.payer_name}</TableCell>
                    <TableCell alignment="left">
                      {row.payment_type || row.type}
                    </TableCell>
                    <TableCell alignment="left">{row.reference}</TableCell>
                    <TableCell alignment="left">
                      {formatCreatedAtDate(row.created_at)}
                    </TableCell>
                    <TableCell alignment="left">
                      <p className="font-bold text-black">
                        &#8358;{row.amount.toLocaleString()}
                      </p>
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
                      <TableItemMenu>
                        <div className="px-1 py-1 ">
                          <div className="flex flex-col gap-1 items-start font-medium">
                            {/* {row.payment_type
                            .toLocaleUpperCase()
                            .includes("STAMP_SEAL") && (
                            <button
                              type="button"
                              className="hover:bg-gray-100 text-black w-full text-left p-3"
                              onClick={() => {
                                handleUploadDocumentModal();
                                setUserId(row.id);
                              }}
                            >
                              Upload document
                            </button>
                          )} */}

                            {row.status.toLocaleLowerCase() === "approved" && (
                              <button
                                type="button"
                                className="hover:bg-gray-100 text-black w-full text-left p-3"
                                onClick={() =>
                                  navigate(`/transaction/details?id=${row.id}`)
                                }
                              >
                                View detail
                              </button>
                            )}
                            <button
                              type="button"
                              className="hover:bg-gray-100 text-black w-full text-left p-3"
                              onClick={() => {
                                setUserId(row.id);
                                handleViewStatusModal(row.payment_type, row);
                              }}
                            >
                              View status
                            </button>
                            {row.status.toUpperCase() !== "APPROVED" && (
                              <button
                                type="button"
                                className="hover:bg-gray-100 text-black w-full text-left p-3"
                                onClick={() =>
                                  verifyTransaction({
                                    ref: row.reference,
                                    type: row.payment_type,
                                  })
                                }
                              >
                                {isVerifying ? (
                                  <BtnLoader outline={isVerifying} />
                                ) : (
                                  "Verify"
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </TableItemMenu>
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
});

AdminTransaction.displayName = "AdminTransaction";

export default AdminTransaction;
