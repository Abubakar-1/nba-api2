import { useState } from "preact/hooks";
import { Modal } from "../ui/modal";
import { BtnLoader } from "../ui/loader";
import { Fragment } from "preact";
import { logger } from "@/utils/logger";

interface EtrasactAPIProps {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  tx_ref: string;
  completePayment: (ref: string, success: boolean) => void;
  label?: string;
}

const EtrasactAPI = ({
  amount,
  email,
  name,
  phone,
  tx_ref,
  completePayment,
  label = "Pay with eTranzact",
}: EtrasactAPIProps) => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txRef, setTxRef] = useState<string>("");

  const handlePaymentInit = async () => {
    setIsLoading(true);

    const [firstName, lastName] = name.split(" ");

    try {
      // Get API key from environment (secure)
      const etrasactAuthKey = import.meta.env.VITE_ETRASACT_AUTH_KEY;
      if (!etrasactAuthKey) {
        logger.error("eTranzact auth key not configured");
        alert("Payment service not properly configured");
        setIsLoading(false);
        return;
      }

      const apiUrl =
        import.meta.env.VITE_ETRASACT_API_URL || "https://api.credocentral.com";
      const response = await fetch(`${apiUrl}/transaction/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: etrasactAuthKey, // Now from .env
        },
        body: JSON.stringify({
          amount: amount * 100,
          reference: tx_ref,
          callbackUrl:
            "https://digital-license.nigerianbar.online/api13672/letterofgoodstandingapi/callback.php",

          bearer: 0,
          channels: ["card", "bank"],
          currency: "NGN",
          customerFirstName: firstName,
          customerLastName: lastName,
          customerPhoneNumber: phone,
          email,
        }),
      });

      logger.debug("eTranzact payment amount", amount);
      const data = await response.json();
      logger.debug("eTranzact payment response", data);
      if (data?.data?.authorizationUrl) {
        setIframeUrl(data.data.authorizationUrl);
        setTxRef(data.data.reference); // 👈 store ref for callback
        setIsOpen(true);
      } else {
        alert("Unable to get payment link");
      }
    } catch (error) {
      logger.error("Payment initialization failed", error);
      alert("Failed to initialize payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = () => {
    if (!iframeUrl) return;

    logger.debug("Payment response verification", { txRef });

    setTimeout(() => {
      setIsOpen(false); // mimic closePaymentModal
      setIsLoading(false);
      //    completePayment(response?.tx_ref, true);

      //  completePayment(txRef, true); // pass actual reference
    }, 2000);
  };

  const handleVerify2 = () => {
    if (!iframeUrl) return;
    // You may verify the reference here if the API provides one
    completePayment("credo_tx_ref", true);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handlePaymentInit}
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center font-medium px-4 py-2.5 text-base rounded-3xl bg-primary-500 hover:bg-primary-600 text-white"
      >
        {isLoading ? <BtnLoader isOutlined /> : label}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} dimensions="xl">
        <button
          onClick={() => {
            setIsOpen(false);
            alert("You cancelled the payment.");
          }}
          className="text-red-500 underline mt-4"
        >
          Cancel and go back
        </button>

        <div className="w-full h-[600px] flex flex-col">
          {iframeUrl && (
            <iframe
              src={iframeUrl}
              className="w-full h-full border rounded"
              onLoad={(e) => {
                const iframe = e.currentTarget;
                try {
                  const currentUrl = iframe.contentWindow?.location.href;

                  if (currentUrl?.includes("status=1")) {
                    // User cancelled or failed
                    setIsOpen(false); // Close modal
                    alert("Payment was cancelled or failed.");
                  }
                } catch (err) {
                  // iframe is on cross-origin domain, can't access — fallback to button
                }
              }}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default EtrasactAPI;
