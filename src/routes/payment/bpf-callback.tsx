
import { FunctionalComponent } from "preact";
import { useEffect } from "preact/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRequest } from "@/components/hooks/use-request";
import { verifyBPFImmediately } from "@/api/payment";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import PageLoader from "@/components/ui/page-loader";

const BPFCallback: FunctionalComponent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifyPaymentRequest = useRequest(verifyBPFImmediately);

  const status = searchParams.get("status");
  const tx_ref = searchParams.get("tx_ref");
  const transaction_id = searchParams.get("transaction_id");

  useEffect(() => {
    console.log("💳 [BPF CALLBACK] Params:", { status, tx_ref, transaction_id });
    
    if ((status === "completed" || status === "successful") && tx_ref && transaction_id) {
      verifyPayment();
    } else if (status === "cancelled") {
      NotifyError("Payment was cancelled");
      navigate("/payment/bpf");
    } else {
        // Just log, don't auto-redirect yet to allow debugging if something is wrong
        console.warn("⚠️ [BPF CALLBACK] Missing or invalid parameters");
    }
  }, [status, tx_ref, transaction_id]);

  async function verifyPayment() {
    const payload = {
      reference: tx_ref as string,
      transaction_id: transaction_id as string
    };
    
    console.log("💳 [BPF CALLBACK] Verifying with payload:", payload);

    const [response, err] = await verifyPaymentRequest.makeRequest(payload);
    console.log("💳 [BPF CALLBACK] Response:", response, "Error:", err);

    if (!err) {
      NotifySuccess("Payment Successful! BPF has been verified.");
      navigate("/payment/bpf");
    } else {
      NotifyError(err?.info || err?.data?.message || "Payment verification failed");
      navigate("/payment/bpf");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <PageLoader isOutlined={true} />
      <p className="mt-4 text-gray-600 font-medium">Verifying your BPF payment...</p>
    </div>
  );
};

export default BPFCallback;
