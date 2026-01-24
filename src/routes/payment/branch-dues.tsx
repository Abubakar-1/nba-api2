import { FunctionalComponent, Fragment } from "preact";
import { useEffect, useState, useCallback } from "preact/hooks";
import classNames from "classnames";
import PageTitle from "@/components/ui/page-title";
import { formatCreatedAtDate } from "@/utils/functions/string-functions";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadItem,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import AuthContext from "@/context/auth-context";
import { useRequest } from "@/components/hooks/use-request";
import {
  generateBranchDuesInvoicePreview,
  generateInvoicePreview,
  verifyBranchDuesPayment,
  verifyBranchDuesImmediately,
  verifyPaymentByReference,
} from "@/api/payment";
import { getBranches } from "@/api/branch";
import { Select } from "@/components/ui/select";
import Input from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import FlutterwaveAPI from "@/components/flutterwave/flutterwave-api";
import { BPFPaymentInvoiceProps } from "@/api/interfaces/payment";
import { getProfile } from "@/api/profile";
import { IProfile } from "@/api/interfaces/profile";
import { useBranchDuesPayments, useStampSealOrders } from "@/api/react-query";
import { PaymentGatewayModal } from "@/components/ui/payment-gateway-modal";

const BranchDues: FunctionalComponent = () => {
  const navigate = useNavigate();
  const { user } = AuthContext.useContainer();
  const currentYear = new Date().getFullYear();

  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState<number>(currentYear);
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState<number>(120000); // default/fallback
  const [invoiceRes, setInvoiceRes] = useState<BPFPaymentInvoiceProps>();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<any>();
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<IProfile | null>(null);
  const [verifyingPaymentRef, setVerifyingPaymentRef] = useState<string | null>(
    null,
  );
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const branchesRequest = useRequest(getBranches);
  console.log("branhcesRequest", branchesRequest);
  const invoiceRequest = useRequest(generateBranchDuesInvoicePreview);
  const verifyPaymentRequest = useRequest(verifyBranchDuesPayment);
  const verifyImmediatelyRequest = useRequest(verifyBranchDuesImmediately);
  const profileRequest = useRequest(getProfile);

  const {
    data: branchDuesData,
    isLoading: isBranchDuesLoading,
    error: branchDuesError,
    refetch: refetchBranchDues,
  } = useBranchDuesPayments({});

  console.log("branchDuesData", branchDuesData);

  useEffect(() => {
    // Fetch all branches with a large limit to avoid pagination
    branchesRequest.makeRequest({});
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUserProfile() {
    const [response, error] = await profileRequest.makeRequest({});
    if (!error && response) {
      setUserProfile(response);
    }
  }

  useEffect(() => {
    const branches = Array.isArray(branchesRequest.response)
      ? branchesRequest.response
      : (branchesRequest.response?.data ?? []);

    if (branches && branches.length > 0) {
      // Try to find user's branch first, otherwise default to first branch
      const userBranchName = userProfile?.branch || (user as any)?.branch;

      if (userBranchName) {
        const userBranch = branches.find(
          (b: any) =>
            b.name?.toLowerCase() === userBranchName?.toLowerCase() ||
            b.code?.toLowerCase() === userBranchName?.toLowerCase(),
        );
        if (userBranch) {
          setBranchId(userBranch.id);
        } else {
          setBranchId(branches[0].id);
        }
      } else {
        setBranchId(branches[0].id);
      }
    }
  }, [branchesRequest.response, userProfile?.branch, user]);

  const funcVerifyPayment = useCallback(
    async (reference: string, transaction_id: string) => {
      // Try immediate verification first as it's a GET and might be simpler for branch dues
      const [immRes, immErr] = await verifyImmediatelyRequest.makeRequest({
        reference: reference,
        transaction_id: transaction_id,
      });

      if (!immErr) {
        setPaymentResponse(immRes);
        refetchBranchDues();
        setSuccessModal(true);
        return;
      }

      // Fallback to standard POST verify if immediate fails
      const [response, _err] = await verifyPaymentRequest.makeRequest({
        reference: reference,
      });
      setPaymentResponse(response);
      if (!_err) {
        refetchBranchDues();
        setSuccessModal(true);
      } else if (_err && _err?.data) {
        refetchBranchDues();
        NotifySuccess(
          "Payment Confirmed! Kindly verify payment status on transaction page",
        );
        return;
      } else {
        NotifyError(_err?.info || "Verification failed");
        return;
      }
    },
    [
      verifyPaymentRequest.makeRequest,
      verifyImmediatelyRequest.makeRequest,
      refetchBranchDues,
    ],
  );

  const handlePaymentLinkClick = useCallback(
    async (reference: string, paymentUrl: string) => {
      try {
        setVerifyingPaymentRef(reference);

        const [response, err] = await verifyPaymentByReference(reference);

        console.log("Payment verification result:", { response, err });

        if (err) {
          console.error("Payment verification error:", err);
          NotifyError(err?.message || "Failed to verify payment");
          return;
        }

        if (response?.isPaid === true || response?.success === false) {
          console.log("Payment is already paid, refreshing page...");
          window.location.reload();
        } else {
          window.open(paymentUrl, "_blank", "noopener,noreferrer");
        }
      } catch (error: any) {
        console.error("Payment verification exception:", error);
        NotifyError(error?.message || "Failed to verify payment");
      } finally {
        setVerifyingPaymentRef(null);
      }
    },
    [],
  );

  const completePayment = async (ref: string, status: boolean) => {
    setShowPayment(false);
    setIsOpen(false);
    setTimeout(() => {
      status && funcVerifyPayment(ref, ref); // Using ref as transaction_id fallback
    }, 3000);
  };

  async function handleProceed() {
    const payload = {
      // year,
      payment_gateway: "flutterwave",
      redirect_url: window.location.origin + "/transaction",
      // branch_id: branchId,
    } as any;

    const [res, err] = await invoiceRequest.makeRequest(payload);
    if (err) {
      console.log("err", err);
      NotifyError(err?.data?.message || "Failed to create invoice");
      return;
    }

    setInvoiceRes(res);
    setAmount(res?.total_payment || 120000);
    setShowPayment(true);
  }

  return (
    <div className="px-4 mb-5">
      <PageTitle title="User Conference Dashboard" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">Branch Dues</h1>

      <div className="w-full flex justify-end mb-4 mt-7">
        <Button
          variant="primary"
          dimension="lg"
          onClick={() => setIsOpen(true)}
          className="bg-green-600 p-5 text-white"
        >
          Pay Branch Dues
        </Button>
      </div>

      <div className="">
        <Table>
          <TableHead textSize="xs">
            <TableHeadItem>DATE</TableHeadItem>
            <TableHeadItem>REFERENCE</TableHeadItem>
            <TableHeadItem>AMOUNT</TableHeadItem>
            <TableHeadItem>STATUS</TableHeadItem>
            <TableHeadItem>PAYER</TableHeadItem>
            <TableHeadItem last>ACTION</TableHeadItem>
          </TableHead>
          <TableBody
            isLoading={isBranchDuesLoading}
            isEmpty={!branchDuesData?.data?.length}
          >
            {branchDuesData?.data?.map((payment: any, index: number) => (
              <TableRow key={index} striped>
                <TableCell alignment="left" first>
                  {formatCreatedAtDate(payment.created_at)}
                </TableCell>
                <TableCell alignment="left">{payment.reference}</TableCell>
                <TableCell alignment="left">
                  <p className="font-bold text-black">
                    N{payment.amount?.toLocaleString()}
                  </p>
                </TableCell>
                <TableCell alignment="left">
                  <p
                    className={`py-2 px-3 w-fit ${classNames({
                      "bg-yellow-100 text-yellow-500":
                        payment.status.toUpperCase() === "PENDING",
                      "bg-green-100 text-primary-500 ":
                        payment.status.toUpperCase() === "APPROVED" ||
                        payment.status.toUpperCase() === "SUCCESSFUL" ||
                        payment.status.toUpperCase() === "SUCCESS",
                      "bg-red-100 text-red-500 ":
                        payment.status.toUpperCase() === "FAILED",
                    })} rounded-3xl`}
                  >
                    {payment.status}
                  </p>
                </TableCell>
                <TableCell alignment="left">{payment.payer_name}</TableCell>
                <TableCell alignment="left" last>
                  <div className="flex gap-2">
                    {payment.status.toUpperCase() === "PENDING" && (
                      <>
                        <Button
                          variant="outline"
                          dimension="sm"
                          className="text-xs px-3 py-1 whitespace-nowrap"
                          onClick={() =>
                            funcVerifyPayment(
                              payment.reference,
                              payment.transaction_id || payment.reference,
                            )
                          }
                          isLoading={
                            verifyImmediatelyRequest.isLoading ||
                            verifyPaymentRequest.isLoading
                          }
                        >
                          Verify
                        </Button>
                        <Button
                          variant="primary"
                          dimension="sm"
                          className="bg-green-600 text-white text-xs px-3 py-1 whitespace-nowrap"
                          disabled={verifyingPaymentRef === payment.reference}
                          onClick={() => {
                            if (payment.payment_link?.payment_link) {
                              handlePaymentLinkClick(
                                payment.reference,
                                payment.payment_link.payment_link,
                              );
                            } else {
                              // Fallback: open the payment modal to get a fresh link
                              setYear(payment.year || currentYear);
                              setBranchId(payment.branch_id);
                              setIsOpen(true);
                            }
                          }}
                          isLoading={verifyingPaymentRef === payment.reference}
                        >
                          Complete Payment
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isOpen}
        showCloseIcon={true}
        onClose={() => {
          setIsOpen(false);
        }}
        dimensions="md"
      >
        <div className="w-full max-w-lg px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <h1 className="font-bold text-lg">Branch Dues</h1>
          </div>

          <div className="mb-3">
            <div className="mt-1 rounded bg-green-50 p-2 text-sm flex justify-between items-center">
              <span className="text-gray-700">
                <label className="text-xs text-gray-600">Payer</label>
              </span>
              <span className="text-green-700 font-semibold text-sm">
                {(user?.first_name || "").toUpperCase()}{" "}
                {(user?.last_name || "").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-600">Year</label>
              <Input
                variant="primary"
                value={String(year)}
                onInput={(e: any) =>
                  setYear(Number(e.target.value || currentYear))
                }
                dimension="sm"
                className="rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">NBA Branch</label>
              <div className="mt-1 rounded bg-gray-100 p-2 text-sm flex justify-between items-center">
                <span className="text-gray-700 font-semibold">
                  {userProfile?.branch || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-sm">
              Amount:{" "}
              <span className="font-bold text-green-600">
                N{amount?.toLocaleString()}
              </span>
            </p>
          </div>

          <div className="mb-4 p-3 rounded bg-yellow-50 text-sm text-gray-700 border border-yellow-100">
            <strong className="text-red-500">Note: </strong>
            Your branch is locked to your profile branch. If you need to update
            your branch, please edit your profile before making your payment.{" "}
            <a href="/profile" className="text-blue-600 underline">
              Click here to go to your profile.
            </a>
          </div>
          {!showPayment && !invoiceRes && (
            <>
              <div className="mb-3">
                <Button
                  variant="primary"
                  dimension="lg"
                  type="button"
                  onClick={handleProceed}
                  isLoading={invoiceRequest.isLoading}
                  className="w-full"
                >
                  Proceed
                </Button>
              </div>

              <div className="text-center">
                <button
                  className="text-sm text-gray-700 mt-2"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {showPayment && invoiceRes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-base mb-4">Complete Payment</h3>
              <p className="text-sm text-gray-600 mb-4">
                You will be redirected to the payment gateway to complete your
                transaction.
              </p>
              <Button
                variant="primary"
                dimension="lg"
                onClick={() => {
                  if ((invoiceRes as any)?.payment_link) {
                    setPaymentUrl((invoiceRes as any).payment_link);
                    setGatewayModalOpen(true);
                  } else {
                    NotifyError("Payment link not found. Please try again.");
                  }
                }}
                disabled={false}
              >
                Pay Now with Flutterwave
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {successModal && (
        <Modal
          isOpen={successModal}
          showCloseIcon={true}
          onClose={() => {
            setSuccessModal(false);
          }}
          dimensions="md"
        >
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your branch dues payment has been processed successfully.
            </p>
            <div className="bg-gray-50 rounded p-4 mb-6 text-sm">
              <div className="grid grid-cols-2 gap-2 text-left">
                <p className="text-gray-600">Reference:</p>
                <p className="font-semibold">{paymentResponse?.reference}</p>
                <p className="text-gray-600">Amount:</p>
                <p className="font-semibold">
                  N{paymentResponse?.amount?.toLocaleString()}
                </p>
                <p className="text-gray-600">Status:</p>
                <p className="font-semibold text-green-600">
                  {paymentResponse?.status}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              dimension="lg"
              onClick={() => {
                setSuccessModal(false);
              }}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
      <PaymentGatewayModal
        isOpen={gatewayModalOpen}
        onClose={() => setGatewayModalOpen(false)}
        paymentUrl={paymentUrl}
      />
    </div>
  );
};

export default BranchDues;
