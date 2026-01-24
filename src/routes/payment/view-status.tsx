import { ITransactions } from "@/api/interfaces/transaction";
import { getTransactionStatus, getBranchDuesStatus } from "@/api/payment";
import PendingPaymentIcon from "@/assets/icons/pending-payment-icon";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import PageLoader from "@/components/ui/page-loader";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { useEffect, useState, useCallback } from "preact/hooks";

interface StatusProps {
  toggleModal: any;
  modalIsOpen: boolean;
  id?: number;
  paymentType?: string;
  transaction?: ITransactions;
}
const ViewStatus: FunctionalComponent<StatusProps> = ({
  toggleModal,
  modalIsOpen,
  id = 0,
  paymentType,
  transaction,
}) => {
  const [details, setDetails] = useState<ITransactions>();

  const fetchStatus = useCallback(
    async (data: any) => {
      const isBranchDues =
        paymentType?.toLowerCase()?.includes("branch") ||
        details?.payment_type?.toLowerCase()?.includes("branch");

      if (isBranchDues) {
        const [res, err] = await getBranchDuesStatus(data);
        // If branch-dues/status returns 404 or fails, fallback to general status
        if (!err && res) return [res, null];
        if (err?.status === 404 || err?.data?.status === 404) {
          return getTransactionStatus(data);
        }
        return [res, err];
      }
      return getTransactionStatus(data);
    },
    [paymentType, details?.payment_type],
  );

  const transactionStatusRequest = useRequest<{ id: number }>(fetchStatus);

  const getStatus = async () => {
    const payload = { id: id || transaction?.id || 0 };
    const [response, _err] =
      await transactionStatusRequest.makeRequest(payload);
    if (!_err && response) {
      // Normalize response - some endpoints nest data under .data or .items
      let data = response;
      if (response.data && !response.amount && !response.status) {
        data = response.data;
      } else if (Array.isArray(response) && response.length > 0) {
        data = response[0];
      } else if (
        response.items &&
        Array.isArray(response.items) &&
        response.items.length > 0
      ) {
        data = response.items[0];
      }

      const normalizedDetails: ITransactions = {
        ...data,
        id: data.id || id,
        amount: data.amount || data.total_amount || 0,
        status: data.status || "PENDING",
        reference: data.reference || data.payment_id || data.tx_ref || "N/A",
        payer_name: data.payer_name || data.recipient || data.name || "N/A",
        created_at:
          data.created_at ||
          data.payment_date ||
          data.date ||
          data.createdAt ||
          "N/A",
        payment_type: data.payment_type || data.type || paymentType || "BPF",
        quantity: data.quantity || 1,
      };

      setDetails(normalizedDetails);
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info || "Failed to fetch status");
      return;
    } else if (_err) {
      NotifyError(_err?.info || "Failed to fetch status");
      return;
    }
  };

  useEffect(() => {
    if (modalIsOpen) {
      if (transaction) {
        setDetails(transaction);
      } else {
        getStatus();
      }
    }
  }, [modalIsOpen, transaction]);
  return (
    <Modal
      isOpen={modalIsOpen}
      showCloseIcon={modalIsOpen}
      onClose={() => toggleModal()}
    >
      {transactionStatusRequest.isLoading ? (
        <div className="w-full h-full flex justify-center items-center">
          <PageLoader isOutlined={transactionStatusRequest.isLoading} />
        </div>
      ) : details ? (
        <>
          <div className="w-full h-full flex flex-col justify-center items-center">
            {details?.status?.toLocaleUpperCase() === "APPROVED" && (
              <>
                <div className="p-4 mt-10 w-fit rounded-full bg-primary-500 bg-opacity-[12%]">
                  <CheckCircleIcon className="text-primary-500 w-10 h-10" />
                </div>
                <h1 className="text-3xl pt-3 text-primary-500 font-bold">
                  {paymentType?.toLowerCase()?.includes("branch")
                    ? "Branch Dues Confirmed!"
                    : "Payment Success!"}
                </h1>
              </>
            )}
            {details?.status?.toLocaleUpperCase() === "PENDING" && (
              <>
                <PendingPaymentIcon />
                <h1 className="text-3xl pt-3 text-yellow-500 font-bold">
                  Payment Pending!
                </h1>
              </>
            )}

            <div className="flex flex-col items-center pb-3 gap-1">
              {details?.status?.toLocaleUpperCase() === "APPROVED" && (
                <p className="text-sm">
                  Your payment has been successfully done.
                </p>
              )}
              {details?.status?.toLocaleUpperCase() === "PENDING" && (
                <p className="text-sm">Your payment is awaiting approval.</p>
              )}
            </div>
            <div
              className={`p-4 w-full rounded-xl bg-opacity-[5%] grid grid-cols-2 gap-3 text-black  ${classNames(
                {
                  "bg-primary-500":
                    details?.status?.toLocaleUpperCase() === "APPROVED",
                  "bg-yellow-500":
                    details?.status?.toLocaleUpperCase() === "PENDING",
                  "bg-red-500":
                    details?.status?.toLocaleUpperCase() === "FAILED",
                },
              )}`}
            >
              <p className="text-left text-xs">Amount</p>
              <p className="text-right text-sm font-bold text-black font-mono">
                ₦{details?.amount?.toLocaleString()}
              </p>

              {!paymentType?.toLowerCase()?.includes("branch") && (
                <>
                  <p className="text-left text-xs">Quantity </p>
                  <p className="text-right text-sm font-semibold text-black">
                    {details?.quantity || 1}
                  </p>
                </>
              )}

              <p className="text-left text-xs">Payment type </p>
              <p className="text-right text-sm font-semibold text-black">
                {paymentType?.toLowerCase()?.includes("branch")
                  ? "Branch Dues"
                  : details?.payment_type || "BPF"}
              </p>

              <p className="text-left text-xs">Payment Status</p>
              <p
                className={`text-right text-sm font-bold ${classNames({
                  "text-primary-600":
                    details?.status?.toLocaleUpperCase() === "APPROVED",
                  "text-yellow-600":
                    details?.status?.toLocaleUpperCase() === "PENDING",
                  "text-red-600":
                    details?.status?.toLocaleUpperCase() === "FAILED",
                })}`}
              >
                {details?.status}
              </p>
              <div className="w-full h-[1px] bg-gray-200 col-span-2 my-1"></div>
              <p className="text-left text-xs">Ref Number</p>
              <p className="text-right text-xs font-semibold">
                {details?.reference}
              </p>
              <p className="text-left text-xs">Payer</p>
              <p className="text-right text-xs font-semibold">
                {details?.payer_name}
              </p>
              <p className="text-left text-xs">Payment Method</p>
              <p className="text-right text-xs font-semibold">Card payment</p>
              <p className="text-left text-xs">Payment Time</p>
              <p className="text-right text-xs font-semibold">
                {details?.created_at}
              </p>
            </div>
            <div className="mt-10 w-full">
              {/* {details?.status?.toLocaleUpperCase() === "APPROVED" ? ( */}
              <Button
                type="button"
                variant="primary"
                dimension="lg"
                onClick={() => {
                  toggleModal();
                  setDetails(undefined);
                }}
              >
                Close
              </Button>
              {/* // ) : ( */}
              {/* // <Button */}
              {/* //   type="button"
                //   variant="primary"
                //   dimension="lg"
                //   onClick={() => { */}
              {/* //     getStatus();
                //   }}
                //   isLoading={transactionStatusRequest.isLoading}
                // >
                //   Refresh
                // </Button>
              // )} */}
            </div>
          </div>
        </>
      ) : null}
    </Modal>
  );
};

export default ViewStatus;
