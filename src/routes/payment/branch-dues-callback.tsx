import { FunctionalComponent } from "preact";
import { useEffect } from "preact/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRequest } from "@/components/hooks/use-request";
import { verifyBranchDuesPayment } from "@/api/payment";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import PageLoader from "@/components/ui/page-loader";

const BranchDuesCallback: FunctionalComponent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifyPaymentRequest = useRequest(verifyBranchDuesPayment);

  const status = searchParams.get("status");
  const tx_ref = searchParams.get("tx_ref");
  const transaction_id = searchParams.get("transaction_id");

  useEffect(() => {
    console.log("status", status);
    console.log("tx_ref", tx_ref);
    console.log("transaction_id", transaction_id);
    if (
      (status === "completed" || status === "successful") &&
      tx_ref &&
      transaction_id
    ) {
      verifyPayment();
      console.log("verifying");
    } else if (status === "cancelled") {
      NotifyError("Payment was cancelled");
      navigate("/payment/branch-dues");
    } else {
      // Handle cases where params might be missing or status is not successful
      // navigate("/payment/branch-dues");
    }
  }, [status, tx_ref, transaction_id]);

  async function verifyPayment() {
    // The API expects { transaction_id, reference }
    // Based on previous context, verifyBranchDuesPayment takes { ref, transaction_id } or similar.
    // Let's check api/payment.ts signature. It usually takes body.
    // In branch-dues.tsx it was called with { ref: val }.
    // But recent request said "takes the transaction_id and reference as parameters".

    // The API definition:
    // function verifyBranchDuesPayment(body: any) { ... .post(`/branch-dues/verify`, body) }

    // So we pass the body object.
    const payload = {
      reference: tx_ref,
      transaction_id: transaction_id,
    };
    console.log("payload", payload);

    const [response, err] = await verifyPaymentRequest.makeRequest(payload);
    console.log("response", response);

    if (!err) {
      NotifySuccess("Payment Successful! Branch dues have been verified.");
      navigate("/payment/branch-dues");
    } else {
      NotifyError(err?.info || "Payment verification failed");
      navigate("/payment/branch-dues");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <PageLoader isOutlined={true} />
      <p className="mt-4 text-gray-600 font-medium">
        Verifying your branch dues payment...
      </p>
    </div>
  );
};

export default BranchDuesCallback;
