import { IDashboardResponse } from "@/api/interfaces/dashboard";
import DashboardCardIcon from "@/assets/icons/dashboard-card-icon";
import Button from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadItem,
  TableRow,
} from "@/components/ui/table";
import { TableItemMenu } from "@/components/ui/table-item-menu";
import classNames from "classnames";
import { FunctionalComponent, Fragment } from "preact";
import { memo } from "preact/compat";
import { useNavigate } from "react-router-dom";

import HandMoneyIcon from "@/assets/icons/hand-money-icon";
import { useState, useCallback } from "preact/hooks";
import { XMarkIcon } from "@heroicons/react/24/solid";
import ConferenceWomanIcon from "@/assets/icons/conference-woman-icon";
import AuthContext from "@/context/auth-context";
import { formatCreatedAtDate } from "@/utils/functions/string-functions";
import { useVerifyPaymentMutation } from "@/components/hooks/use-transactions-query";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import { useInvalidateDashboard } from "@/components/hooks/use-dashboard-query";
import { lazy, Suspense } from "preact/compat";

const ViewStatus = lazy(() => import("@/routes/payment/view-status"));

interface UserDashboardProps {
  dashboardDetails: IDashboardResponse;
}
const UserDashboard: FunctionalComponent<UserDashboardProps> = memo(
  ({ dashboardDetails }) => {
    const { conferenceStatus } = AuthContext.useContainer();
    const navigate = useNavigate();
    console.log("dahsboardDetails", dashboardDetails);

    const [isNotice, setIsNotice] = useState<boolean>(true);
    const toggleNotice = useCallback(() => setIsNotice(false), []);

    const verifyMutation = useVerifyPaymentMutation();
    const invalidateDashboard = useInvalidateDashboard();

    const [isViewStatus, setIsViewStatus] = useState(false);
    const [selectedId, setSelectedId] = useState<number>(0);

    const handleVerify = async (
      reference: string,
      transactionId: string,
      type: string
    ) => {
      try {
        await verifyMutation.mutateAsync({
          ref: reference,
          transactionId,
          type,
        });
        NotifySuccess("Payment verified successfully");
        await invalidateDashboard();
      } catch (error: any) {
        NotifyError(error?.data?.info || error?.info || "Verification failed");
      }
    };

    const handleViewStatus = (id: number) => {
      setSelectedId(id);
      setIsViewStatus(true);
    };
    return (
      <>
        <div className="pb-10">
          {isNotice && (
            <div className="mb-6 overflow-hidden lg:h-52 w-full bg-primary-500 rounded-xl flex flex-col lg:flex-row gap-20 justify-between lg:items-end px-10 relative">
              <XMarkIcon
                className="w-5 h-5 lg:w-6 lg:h-6 text-white font-bold cursor-pointer absolute top-6 right-3 lg:top-4 lg:right-5"
                onClick={toggleNotice}
              />
              <div className="text-white h-full flex flex-col justify-center lg:items-start items-center gap-7">
                <div className="">
                  <h1 className=" font-extrabold text-xl lg:text-2xl mb-2 mt-5 lg:mt-0">
                    NBA Conference 2025 Countdown
                  </h1>
                  {/* <p className="text-sm">
                  Be an early bird, be the first to secure a seat in this annual
                  conference you don’t want to miss
                </p> */}
                </div>
                <div className="w-full lg:w-60">
                  <Button
                    type="button"
                    variant="white"
                    dimension="lg"
                    onClick={() =>
                      navigate(
                        conferenceStatus?.entry?.is_paid
                          ? "/conference"
                          : "/reg/conference"
                      )
                    }
                  >
                    <HandMoneyIcon />{" "}
                    <p className="pl-3 font-semibold">
                      {conferenceStatus?.entry?.is_paid
                        ? "Conference Dashboard"
                        : "Register for Conference"}
                    </p>
                  </Button>
                </div>
              </div>
              <ConferenceWomanIcon />
            </div>
          )}

          <div className="flex flex-col lg:flex-row justify-center gap-4">
            <div className="flex flex-col justify-between w-full h-full border rounded">
              <div className="flex justify-start items-center">
                <div className="m-7 p-2 w-12 h-12 bg-[#5A2291] flex justify-center items-center rounded-sm text-white">
                  <div className="flex justify-center items-center lg:items-end">
                    <DashboardCardIcon />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-500">Total Payment</p>
                  <h1 className="font-bold text-xl">
                    {`₦${(
                      dashboardDetails?.amountTotal ||
                      dashboardDetails?.totalPayment?.totalAmount ||
                      (dashboardDetails as any)?.amount_total ||
                      0
                    ).toLocaleString()}`}
                  </h1>
                </div>
              </div>
              <div className="h-12 w-full rounded-br rounded-bl bg-[#EFE9F4] flex justify-start items-center pl-3">
                <p>
                  {(
                    dashboardDetails?.totalPaymentCount ||
                    dashboardDetails?.totalPayment?.paymentCount ||
                    (dashboardDetails as any)?.total_payment_count ||
                    0
                  ).toLocaleString() + " Payment"}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between w-full h-full border rounded">
              <div className="flex justify-start items-center">
                <div className="m-7 p-2 w-12 h-12 bg-[#01BEBD] flex justify-center items-center rounded-sm text-white">
                  <DashboardCardIcon />
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-500">BPF</p>
                  <h1 className="font-bold text-xl">
                    {`₦${(
                      dashboardDetails?.amountBpf ||
                      dashboardDetails?.bpf?.amount ||
                      (dashboardDetails as any)?.amount_bpf ||
                      0
                    ).toLocaleString()}`}
                  </h1>
                </div>
              </div>
              <div className="h-12 w-full rounded-br rounded-bl bg-[#E6F9F9] flex justify-start items-center pl-3">
                <p>
                  {(
                    dashboardDetails?.totalBpfCount ||
                    dashboardDetails?.bpf?.paymentCount ||
                    (dashboardDetails as any)?.total_bpf_count ||
                    0
                  ).toLocaleString() + " Payment"}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between w-full h-full border rounded">
              <div className="flex justify-start items-center">
                <div className="m-7 p-2 w-12 h-12 bg-red-500 flex justify-center items-center rounded-sm text-white">
                  <DashboardCardIcon />
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-500">Stamp & Seal</p>
                  <h1 className="font-bold text-xl">
                    {`₦${(
                      dashboardDetails?.amountSeal ||
                      dashboardDetails?.stampAndSeal?.amount ||
                      (dashboardDetails as any)?.amount_seal ||
                      0
                    ).toLocaleString()}`}
                  </h1>
                </div>
              </div>
              <div className="h-12 w-full rounded-br rounded-bl bg-[#FEEAEA] flex justify-start items-center pl-3">
                <p>
                  {(
                    dashboardDetails?.totalSealCount ||
                    dashboardDetails?.stampAndSeal?.paymentCount ||
                    (dashboardDetails as any)?.total_seal_count ||
                    0
                  ).toLocaleString() + " Payment"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between w-full mt-14 mb-5">
            <h1 className=" font-bold text-2xl">Recent Transaction</h1>
            <Button
              variant="outline"
              dimension="lg"
              className="w-fit px-7 py-2 border rounded-3xl border-primary-500 text-primary-500"
              onClick={() => navigate("/transaction")}
            >
              See all
            </Button>
          </div>
          {dashboardDetails &&
          (dashboardDetails.recentTransactions ||
            (dashboardDetails as any).recent_transactions) &&
          (
            dashboardDetails.recentTransactions ||
            (dashboardDetails as any).recent_transactions
          ).length > 0 ? (
            <>
              <Table>
                <TableHead variant="primary" textSize="xs">
                  <TableHeadItem first>PAYER</TableHeadItem>
                  <TableHeadItem>PAYMENT TYPE</TableHeadItem>
                  <TableHeadItem>REFERENCE</TableHeadItem>
                  <TableHeadItem>DATE</TableHeadItem>
                  <TableHeadItem>AMOUNT</TableHeadItem>
                  <TableHeadItem>STATUS</TableHeadItem>
                  {/* <TableHeadItem last>ACTION</TableHeadItem> */}
                </TableHead>
                <TableBody>
                  {(
                    dashboardDetails?.recentTransactions ||
                    (dashboardDetails as any)?.recent_transactions ||
                    []
                  ).map((transaction: any, idx: number) => (
                    <TableRow
                      key={transaction.transaction_id || transaction.id}
                      striped
                    >
                      <TableCell first alignment="left">
                        {transaction.payerName ||
                          transaction.payer_name ||
                          transaction.payer}
                      </TableCell>
                      <TableCell alignment="left">
                        {transaction.paymentType || transaction.payment_type}
                      </TableCell>
                      <TableCell alignment="left">
                        {transaction.reference || transaction.transaction_id}
                      </TableCell>
                      <TableCell alignment="left">
                        {formatCreatedAtDate(
                          transaction.createdAt ||
                            transaction.created_at ||
                            transaction.date
                        )}
                      </TableCell>
                      <TableCell alignment="left">
                        <p className="font-bold text-black">
                          ₦{transaction.amount.toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell alignment="left">
                        <p
                          className={`py-2 px-3 w-fit ${classNames({
                            "bg-yellow-100 text-yellow-500":
                              transaction.status.toUpperCase() === "PENDING",
                            "bg-green-100 text-primary-500 ":
                              transaction.status.toUpperCase() === "APPROVED",
                            "bg-red-100 text-red-500 ":
                              transaction.status.toUpperCase() === "FAILED",
                          })} rounded-3xl`}
                        >
                          {transaction.status}
                        </p>
                      </TableCell>
                      {/* <TableCell last alignment="left"> */}
                      {/* <div className="flex justify-end gap-2 pr-2">
                          {transaction.status.toUpperCase() === "APPROVED" ? (
                            <>
                              <button
                                type="button"
                                className="px-4 py-1.5 text-xs font-semibold text-sky-500 border border-sky-500 rounded-full hover:bg-sky-50 transition-colors"
                                onClick={() =>
                                  handleViewStatus(
                                    transaction.id || transaction.transaction_id
                                  )
                                }
                              >
                                View status
                              </button>
                            </>
                          ) : (
                            <>
                              {transaction.status.toUpperCase() ===
                              "PENDING" ? (
                                <>
                                  {transaction.payment_payload?.payment_link ||
                                  transaction.authorization_url ||
                                  transaction.payment_link ? (
                                    <button
                                      type="button"
                                      className="px-4 py-1.5 text-xs font-semibold text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                      onClick={() => {
                                        const link =
                                          transaction.payment_payload
                                            ?.payment_link ||
                                          transaction.authorization_url ||
                                          transaction.payment_link;
                                        if (link) window.location.href = link;
                                      }}
                                    >
                                      Complete Payment
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={verifyMutation.isPending}
                                      className="px-4 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      onClick={() =>
                                        handleVerify(
                                          transaction?.reference,
                                          transaction?.transaction_id,
                                          transaction?.payment_type
                                        )
                                      }
                                    >
                                      {verifyMutation.isPending &&
                                      verifyMutation.variables?.ref ===
                                        transaction?.reference
                                        ? "Confirming..."
                                        : "Confirm"}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="px-4 py-1.5 text-xs font-semibold text-red-500 border border-red-500 rounded-full hover:bg-red-50 transition-colors"
                                    onClick={() =>
                                      NotifyError(
                                        "Cancellation is not currently supported"
                                      )
                                    }
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                // Logic for "PROCESSING" or other non-approved states
                                (transaction.status.toUpperCase() ===
                                  "PROCESSING" ||
                                  transaction.status.toUpperCase() !==
                                    "APPROVED") &&
                                // Check if payment link exists first
                                (transaction.payment_payload?.payment_link ||
                                transaction.authorization_url ||
                                transaction.payment_link ? (
                                  <button
                                    type="button"
                                    className="px-4 py-1.5 text-xs font-semibold text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                    onClick={() => {
                                      const link =
                                        transaction.payment_payload
                                          ?.payment_link ||
                                        transaction.authorization_url ||
                                        transaction.payment_link;
                                      if (link) window.location.href = link;
                                    }}
                                  >
                                    Complete Payment
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={verifyMutation.isPending}
                                    className="px-4 py-1.5 text-xs font-semibold text-white bg-primary-500 rounded-full hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() =>
                                      handleVerify(
                                        transaction?.reference,
                                        transaction?.transaction_id,
                                        transaction?.payment_type
                                      )
                                    }
                                  >
                                    {verifyMutation.isPending &&
                                    verifyMutation.variables?.ref ===
                                      transaction?.reference
                                      ? "Verifying..."
                                      : "Verify"}
                                  </button>
                                ))
                              )}
                            </>
                          )}
                        </div> */}
                      {/* </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="bg-gray-50 w-full p-3 border rounded shadow-md text-center text-sm">
              No recent transaction
            </div>
          )}
        </div>
        <Suspense fallback={null}>
          <ViewStatus
            modalIsOpen={isViewStatus}
            toggleModal={() => setIsViewStatus(false)}
            id={selectedId}
          />
        </Suspense>
      </>
    );
  }
);

UserDashboard.displayName = "UserDashboard";

export default UserDashboard;
