import {
  IFilter,
  ITransactionProps,
  ITransactionResponse,
  ITransactions,
} from "@/api/interfaces/transaction";
import { IStampSealRequest } from "@/api/interfaces/stamp-seal-request";
import {
  useStampSealOrders,
  useUploadStampSealAttachment,
} from "@/api/react-query";
import {
  useBPFHistory,
  useBranchDuesHistory,
} from "@/components/hooks/use-bpf-payment";
import {
  verifyPayment,
  verifyStampAndSealPayment,
  verifyPaymentByReference,
} from "@/api/payment";
import { useRequest } from "@/components/hooks/use-request";
import {
  useTransactionsQuery,
  useVerifyPaymentMutation,
  usePrefetchTransactions,
} from "@/components/hooks/use-transactions-query";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import { logger } from "@/utils/logger";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { BtnLoader } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import { Pagination } from "@/components/ui/pagination";
import SearchHistory from "@/components/ui/search-history";
import { Select } from "@/components/ui/select";
import StampAndSealUpload from "@/components/ui/stamp-and-seal-upload";
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
import { FunctionalComponent, Fragment } from "preact";
import { PaymentGatewayModal } from "@/components/ui/payment-gateway-modal";
import { useEffect, useState, useCallback, useMemo } from "preact/hooks";
import { lazy, Suspense, memo } from "preact/compat";
import { useLocation, useNavigate } from "react-router-dom";

// Lazy load heavy payment components for better initial load time
const Backlog = lazy(() => import("./payment/backlog"));
const BPFPayment = lazy(() => import("./payment/bpf-payment"));
const StampAndSealPayment = lazy(() => import("./payment/stamp-seal-payment"));
const ViewStatus = lazy(() => import("./payment/view-status"));

const Transaction: FunctionalComponent = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isFilterModal, setIsFilterModal] = useState(false);
  const [isBPF, setIsBPF] = useState<boolean>(false);
  const [isViewStatus, setIsViewStatus] = useState<boolean>(false);
  const [isUploadDocument, setIsUploadDocument] = useState<boolean>(false);
  const [userId, setUserId] = useState<number>(0);

  const [isBacklog, setIsBacklog] = useState<boolean>(false);
  const [isStampAndSeal, setIsStampAndSeal] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [paymentSelection, setPaymentSelection] = useState<string>("");
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("");
  const [verifyingPaymentRef, setVerifyingPaymentRef] = useState<string | null>(
    null,
  );
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const [paginationState, setPaginationState] = useState<any>();
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_rows: 10,
    count: 10,
  });
  // const [searchParams, setSearchParams] = useSearchParams();

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

  const verifyPaymentRequest = useRequest(verifyPayment);
  const verifyStampAndSealPaymentRequest = useRequest(
    verifyStampAndSealPayment,
  );

  // React Query hooks for transactions
  const transactionFilters: ITransactionProps = {
    page: pagination.page,
    page_size: pagination.page_size,
    search: filterParams.values.search,
    status: filterParams.values.status,
    payment_type: filterParams.values.payment_type,
    from_date: filterParams.values.from_date,
    to_date: filterParams.values.to_date,
  };

  const isStampPage =
    typeof location.pathname === "string" &&
    location.pathname.includes("sealandstamp");
  const isBPFPage =
    typeof location.pathname === "string" && location.pathname.includes("bpf");
  const isBranchPage =
    typeof location.pathname === "string" &&
    location.pathname.includes("branchdues");

  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactionsQuery(transactionFilters, {
    enabled: !isStampPage && !isBPFPage,
  });

  const {
    data: stampOrdersData,
    isLoading: isStampLoading,
    error: stampError,
    refetch: refetchStamp,
  } = useStampSealOrders(
    {
      page: pagination.page,
      limit: pagination.page_size,
      // verified: true,
      // printed: false,
      // delivered: false,
    },
    { enabled: isStampPage },
  );

  const {
    data: bpfHistoryData,
    isLoading: isBPFLoading,
    error: bpfError,
    refetch: refetchBPF,
  } = useBPFHistory(
    {
      page: pagination.page,
      limit: pagination.page_size,
    },
    { enabled: isBPFPage },
  );

  console.log("bpfHistoryData", bpfHistoryData);

  // https://checkout-v2.dev-flutterwave.com/v3/hosted/pay/0429a472e1be6712c36f

  const {
    data: branchHistoryData,
    isLoading: isBranchLoading,
    error: branchError,
    refetch: refetchBranch,
  } = useBranchDuesHistory(
    {
      page: pagination.page,
      limit: pagination.page_size,
    },
    { enabled: isBranchPage },
  );

  // If we are on branch page, we also fetch main transactions as a fallback
  const isBranchFallbackNeeded =
    isBranchPage &&
    (!branchHistoryData || (branchHistoryData as any)?.items?.length === 0);

  const isLoading = isStampPage
    ? isStampLoading
    : isBPFPage
      ? isBPFLoading
      : isBranchPage
        ? isBranchLoading
        : isTransactionsLoading;
  const error = isStampPage
    ? stampError
    : isBPFPage
      ? bpfError
      : isBranchPage
        ? branchError
        : transactionsError;
  const refetch = isStampPage
    ? refetchStamp
    : isBPFPage
      ? refetchBPF
      : isBranchPage
        ? refetchBranch
        : refetchTransactions;

  // Normalize stamp data to transaction interface
  const stampResponse = useMemo(() => {
    if (!stampOrdersData) return null;
    logger.debug("Stamp Orders Data", stampOrdersData); // Log for user
    return {
      pagination: stampOrdersData.pagination,
      items: Array.isArray(stampOrdersData.orders)
        ? stampOrdersData.orders.map((item: any) => ({
            id: item.id,
            payer_name: item.user_id,
            amount: item.amount,
            reference: item.reference || "N/A",
            created_at: item.created_at,
            status: item.remark_status || "PENDING",
            payment_type: "Stamp & Seal",
            payment_link: item.payment_link || item.authorization_url,
          }))
        : [],
    };
  }, [stampOrdersData]);

  // Normalize BPF data
  const bpfResponse = useMemo(() => {
    if (!bpfHistoryData) return null;

    const itemsList = Array.isArray(bpfHistoryData) ? bpfHistoryData : [];

    return {
      pagination: {
        page: 1,
        total: itemsList.length,
        total_rows: itemsList.length,
        limit: 50,
        page_size: 50,
        totalPages: Math.ceil(itemsList.length / 50),
      },
      items: itemsList.map((item: any) => ({
        id: item.id,
        payer_name: item.recipient || item.payer_name || "N/A",
        amount: item.amount,
        reference: item.reference || item.payment_id || "N/A",
        created_at: item.created_at,
        status: item.status || "PENDING",
        payment_type:
          item.payment_type && item.payment_type !== "BPF"
            ? item.payment_type
            : item.item_description?.toLowerCase().includes("branch")
              ? "Branch Dues"
              : "BPF",
        payment_link: item.payment_link,
      })),
    };
  }, [bpfHistoryData]);

  // Normalize Branch Dues data
  const branchResponse = useMemo(() => {
    // Priority 1: Use direct branch history endpoint if available
    if (branchHistoryData && (branchHistoryData as any)?.items?.length > 0) {
      const itemsList = Array.isArray((branchHistoryData as any).items)
        ? (branchHistoryData as any).items
        : [];
      return {
        pagination: (branchHistoryData as any).pagination,
        items: itemsList.map((item: any) => ({
          ...item,
          payment_type: "Branch Dues",
          payment_link: item.payment_link,
        })),
      };
    }

    // Priority 2: Fallback to main transactions but filter for Branch Dues
    if (transactionsData && (transactionsData as any)?.items) {
      const itemsList = (transactionsData as any).items.filter(
        (item: any) =>
          item.type?.toLowerCase().includes("branch") ||
          item.item_description?.toLowerCase().includes("branch"),
      );

      return {
        pagination: (transactionsData as any).pagination,
        items: itemsList,
      };
    }

    return null;
  }, [branchHistoryData, transactionsData]);

  const verifyMutation = useVerifyPaymentMutation();
  const prefetchTransactions = usePrefetchTransactions();
  const uploadStampSealMutation = useUploadStampSealAttachment();

  console.log("bpfResponse", bpfResponse);

  // Normalize general transactions data to fix payment_type
  const normalizedTransactionsData = useMemo(() => {
    if (!transactionsData) return null;

    return {
      ...transactionsData,
      items:
        transactionsData.items?.map((item: any) => {
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
            payment_type: correctPaymentType,
          };
        }) || [],
    };
  }, [transactionsData]);

  // Map response data to match old structure
  const response = isStampPage
    ? stampResponse
    : isBPFPage
      ? bpfResponse
      : isBranchPage
        ? branchResponse
        : normalizedTransactionsData;
  const verifyTransaction = useCallback(
    async ({
      ref,
      type,
      transaction_id,
    }: {
      ref: string;
      type?: string;
      transaction_id: string;
    }) => {
      try {
        logger.debug("Verifying transaction", { ref, type, transaction_id });

        // Show loading notification
        NotifySuccess("Verifying payment, please wait...");

        const response = await verifyMutation.mutateAsync({
          ref,
          type,
          transactionId: transaction_id,
        });

        // Show success with more details
        const paymentType = type || "Payment";
        NotifySuccess(
          response?.message ||
            `${paymentType} verified successfully! Your transaction has been updated.`,
        );

        // Reload page to show updated status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error: any) {
        logger.error("Payment verification failed", error);

        // Enhanced error handling with more details
        let errorMessage = "Failed to verify payment. Please try again.";

        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.data?.info) {
          errorMessage = error.data.info;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.info) {
          errorMessage = error.info;
        }

        NotifyError(errorMessage);
      }
    },
    [verifyMutation],
  );

  // Handler for payment link clicks - verifies payment before opening link
  const handlePaymentLinkClick = useCallback(
    async (reference: string, paymentUrl: string) => {
      try {
        // Set loading state
        setVerifyingPaymentRef(reference);

        logger.debug("Verifying payment before opening link", { reference });

        // Call the PATCH /payments/{reference}/verify endpoint
        // handleRequest returns [data, error] tuple
        const [response, err] = await verifyPaymentByReference(reference);

        // Log the results
        console.log("Payment verification result:", { response, err });
        logger.debug("Payment verification result", { response, err });

        // Check for errors first
        if (err) {
          logger.error("Payment verification failed", err);
          console.error("Payment verification error:", err);
          NotifyError(err?.message || "Failed to verify payment");
          return;
        }

        // Check if payment is already paid
        if (response?.isPaid === true) {
          console.log("Payment is already paid, refreshing page...");
          // Hard refresh the page
          window.location.reload();
        } else {
          // Open the payment link if not paid
          setPaymentUrl(paymentUrl);
          setGatewayModalOpen(true);
        }
      } catch (error: any) {
        logger.error("Payment verification exception", error);
        console.error("Payment verification exception:", error);

        // Show error to user
        NotifyError(error?.message || "Failed to verify payment");
      } finally {
        // Clear loading state
        setVerifyingPaymentRef(null);
      }
    },
    [],
  );

  useEffect(() => {
    if (error) {
      logger.error("Transactions fetch error", error);
      NotifyError(error?.message || "Failed to fetch transactions");
    }

    if (response?.pagination) {
      const total =
        response.pagination.total ?? response.pagination.total_rows ?? 0;
      const pageSize =
        response.pagination.limit ?? response.pagination.page_size ?? 50;

      if (
        total !== pagination.total_rows ||
        response.pagination.page !== pagination?.page
      ) {
        setPagination((prev) => {
          if (
            prev.total_rows === total &&
            prev.page === response.pagination.page
          )
            return prev;

          return {
            page: response.pagination.page ?? 1,
            page_size: pageSize,
            total_rows: total,
            count: response.items?.length ?? 0,
          };
        });
      }
    }
  }, [response, error]);

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
    filterParams.setFieldValue(
      "from_date",
      formik.values.from_date.split("-").reverse().join("-"),
    );
    filterParams.setFieldValue(
      "to_date",
      formik.values.to_date.split("-").reverse().join("-"),
    );

    setIsFilterModal(!isFilterModal);
    formik.resetForm();
  }, [filterParams, formik, isFilterModal]);

  useEffect(() => {
    setPaginationState({
      ...pagination,
      status: filterParams.values.search,
    });
  }, [pagination, filterParams.values.search]);

  // Handle payment gateway redirects (Flutterwave/eTranzact callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    const txRef = urlParams.get("tx_ref") || urlParams.get("transaction_id");
    const transactionId = urlParams.get("transaction_id");
    const paymentId = urlParams.get("payment_id");

    // Check if this is a payment callback
    if (status && (txRef || paymentId)) {
      logger.debug("Payment callback detected", {
        status,
        txRef,
        paymentId,
        transactionId,
      });

      // Show different feedback based on status
      if (status === "successful" || status === "completed") {
        NotifySuccess("Payment was successful! Verifying transaction...");
      } else if (status === "cancelled") {
        NotifyError("Payment was cancelled");
        // Clean up URL and return
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        return;
      } else if (status === "failed") {
        NotifyError("Payment failed. Please try again.");
        // Clean up URL and return
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        return;
      }

      // Verify the payment automatically
      const refToVerify = txRef || paymentId;
      if (refToVerify) {
        // Detect type from URL if possible, or default
        let type = "BPF";
        if (
          window.location.pathname.includes("branch-dues") ||
          window.location.pathname.includes("branchdues")
        ) {
          type = "Branch Dues";
        } else if (window.location.pathname.includes("sealandstamp")) {
          type = "Stamp & Seal";
        }

        verifyTransaction({
          ref: refToVerify,
          type,
          transaction_id: transactionId || "",
        })
          .then(() => {
            // Refresh the appropriate data
            refetch();

            // Clean up URL parameters after verification
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);

            window.location.reload();
          })
          .catch((error) => {
            logger.error("Auto-verification failed", error);
            // Clean up URL even if verification failed
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
          });
      }
    }
  }, [location.search]);

  useEffect(() => {
    // Reset all modal states when path changes to avoid multiple modals being open
    setIsBPF(false);
    setIsStampAndSeal(false);
    setIsBacklog(false);

    if (
      location.pathname === "/payment/bpf" ||
      location.pathname === "/payment/bpf/pay"
    ) {
      if (location.pathname === "/payment/bpf")
        navigate("/payment/bpf/pay", { replace: true });
      setIsBPF(true);
    } else if (
      location.pathname === "/payment/sealandstamp" ||
      location.pathname === "/payment/sealandstamp/pay"
    ) {
      if (location.pathname === "/payment/sealandstamp")
        navigate("/payment/sealandstamp/pay", { replace: true });
      setIsStampAndSeal(true);
    } else if (
      location.pathname === "/payment/backlog" ||
      location.pathname === "/payment/backlog/pay"
    ) {
      if (location.pathname === "/payment/backlog")
        navigate("/payment/backlog/pay", { replace: true });
      setIsBacklog(true);
    }
  }, [location.pathname, navigate]);

  // Memoize modal toggle callbacks
  const handleBPFModal = useCallback(() => {
    setIsBPF(!isBPF);
  }, [isBPF]);

  const handleViewStatusModal = useCallback(
    (paymentType?: string) => {
      if (paymentType) setSelectedPaymentType(paymentType);
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

  const handleStampAndSealModal = useCallback(() => {
    setIsStampAndSeal(!isStampAndSeal);
  }, [isStampAndSeal]);

  const handlePaymentBtn = (val: string) => {
    setPaymentSelection(val);
    if (val === "BPF") {
      navigate("/payment/bpf");
    } else if (val === "Stamp") {
      navigate("/payment/sealandstamp");
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
      <PageTitle title="Personal Transaction" />
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
              <option value="BPF" className="text-white">
                BPF
              </option>
              <option value="Branch Dues" className="text-white">
                Branch Dues
              </option>
              {/* <option value="STAMP_SEAL" className="text-white">
                Stamp & Seal
              </option> */}
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

      <Suspense fallback={<PageLoader />}>
        <ViewStatus
          toggleModal={() => handleViewStatusModal()}
          modalIsOpen={isViewStatus}
          id={userId}
          paymentType={selectedPaymentType}
        />

        <BPFPayment
          modalIsOpen={isBPF}
          funcModalIsOpen={() => handleBPFModal()}
          refresh={refetch}
        />
        <Backlog
          modalIsOpen={isBacklog}
          funcModalIsOpen={() => handleBacklogModal()}
          refresh={refetch}
        />
        <StampAndSealPayment
          modalIsOpen={isStampAndSeal}
          funcModalIsOpen={() => handleStampAndSealModal()}
          refresh={refetch}
        />

        <StampAndSealUpload
          toggleModal={() => handleUploadDocumentModal()}
          modalIsOpen={isUploadDocument}
          id={userId.toString()}
          onSuccess={() => {
            refetch();
          }}
          submissionHandler={
            isStampPage
              ? async (formData) => {
                  // formData is already a FormData object with payment_proof
                  // We need to get the file and create new FormData with correct field names
                  const file = formData.get("payment_proof") as File;
                  if (!file) {
                    throw new Error("No file selected");
                  }

                  const uploadFormData = new FormData();
                  uploadFormData.append("attachment", file);
                  uploadFormData.append("type", "stamp_seal"); // or get from somewhere

                  await uploadStampSealMutation.mutateAsync({
                    id: userId,
                    data: uploadFormData,
                  });
                }
              : undefined
          }
        />
      </Suspense>
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
            placeholder={"Search by reference number or email"}
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
            <option value="Stamp" className="text-white">
              Stamp & Seal
            </option>
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
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <PageLoader isOutlined={isLoading} />
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
              {response?.items.map((row: ITransactions, idx: number) => (
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
                      &#8358;
                      {row?.amount?.toLocaleString() ||
                        row?.amount_paid?.toLocaleString()}
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
                    {row.status.toUpperCase() === "PENDING" ? (
                      // PENDING: Check if payment link exists
                      row.payment_link ? (
                        // Has payment link - show Pay Now button
                        <button
                          type="button"
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={verifyingPaymentRef === row.reference}
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
                          Check Payment
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
                        disabled={verifyMutation.isPending}
                        onClick={() =>
                          verifyTransaction({
                            ref: row.reference,
                            type: row.payment_type,
                            transaction_id: row.transaction_id,
                          })
                        }
                      >
                        {verifyMutation.isPending ? (
                          <BtnLoader outline={true} />
                        ) : (
                          "Verify Payment"
                        )}
                      </button>
                    ) : row.status.toLocaleLowerCase() === "approved" ? (
                      // APPROVED: Show View Receipt button
                      <button
                        type="button"
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                        onClick={() =>
                          navigate(`/transaction/details?id=${row.id}`)
                        }
                      >
                        View Receipt
                      </button>
                    ) : row.status.toUpperCase() === "FAILED" ? (
                      // FAILED: Show Verify Payment button
                      <></>
                    ) : (
                      // <button
                      //   type="button"
                      //   className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      //   disabled={verifyMutation.isPending}
                      //   onClick={() =>
                      //     verifyTransaction({
                      //       ref: row.reference,
                      //       type: row.payment_type,
                      //       transaction_id: row.transaction_id,
                      //     })
                      //   }
                      // >
                      //   {verifyMutation.isPending ? (
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
      <PaymentGatewayModal
        isOpen={gatewayModalOpen}
        onClose={() => setGatewayModalOpen(false)}
        paymentUrl={paymentUrl}
      />
    </div>
  );
});

Transaction.displayName = "Transaction";

export default Transaction;
