import { useState, useRef, useEffect } from "preact/hooks";
import { Fragment } from "preact";
import { Modal } from "../ui/modal";
import { BtnLoader } from "../ui/loader";
import axios from "axios";
import { logger } from "@/utils/logger";
import { API_CONFIG } from "@/api/config";

interface EtrasactAPIStampProps {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  tx_ref: string;
  completePayment: (ref: string, success: boolean) => void;
  label?: string;
  attachmentFile?: File | string | null;
  attachmentDate?: string | null;
  requestType?: "public" | "private";
}

const EtrasactAPIStamp = ({
  amount,
  email,
  name,
  phone,
  tx_ref,
  completePayment,
  label = "Pay with eTranzact",
  attachmentFile,
  attachmentDate,
  requestType,
}: EtrasactAPIStampProps) => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txRef, setTxRef] = useState<string>("");

  const postedOnce = useRef(false);
  const popupRef = useRef<Window | null>(null);
  function openPaymentPopup(url: string) {
    const w = 520,
      h = 720;
    let x = window.screen.width / 2 - w / 2;
    let y = window.screen.height / 2 - h / 2;

    // Check if window.top exists and is the same as window
    if (window.top && window.top === window) {
      y = window.outerHeight / 2 + window.screenY - h / 2;
      x = window.outerWidth / 2 + window.screenX - w / 2;
    }
    // This logic is safer in case of iframes or if top is null

    popupRef.current = window.open(
      url,
      "etranzactPay",
      `width=${w},height=${h},left=${x},top=${y},resizable=yes,scrollbars=yes`
    );
    if (!popupRef.current) {
      // fallback: hard navigation (you’ll lose attachment in this case)
      window.location.href = url;
    }
  }

  // helpers to mirror flutterwave-api behavior
  function isDataUrl(v: unknown): v is string {
    return typeof v === "string" && /^data:[^;]+;base64,/.test(v);
  }
  async function toDataUrl(fileOrString?: File | string | null) {
    if (!fileOrString) return null;
    if (isDataUrl(fileOrString)) return fileOrString;
    if (fileOrString instanceof File) {
      const r = new FileReader();
      const p = new Promise<string>((res, rej) => {
        r.onload = () => res(String(r.result));
        r.onerror = rej;
      });
      r.readAsDataURL(fileOrString);
      return p;
    }
    return null;
  }

  // Reset “post once” guard when a brand-new reference is used
  useEffect(() => {
    postedOnce.current = false;
  }, [tx_ref]);
  const verifyWithExtras = async () => {
    if (postedOnce.current) return;
    postedOnce.current = true;
    setIsLoading(true);

    try {
      // prefer the reference returned by Credo/eTranzact, else fall back to init tx_ref
      const ref = txRef || tx_ref;

      const payload: any = {
        gateway: "ETRANZACT",
        status: "successful", // let your backend re-verify; this is a hint
        tx_ref: ref, // keep same field as Flutterwave
        paymentReference: ref, // also send common eTranzact key for your normalizer
        amount: Number(amount || 0),
      };

      if (requestType) payload.request_type = requestType; // "public" | "private"

      const dataUrl = await toDataUrl(attachmentFile);
      if (dataUrl) {
        payload.attachment_data_url = dataUrl;
        payload.attachment_date = attachmentDate || new Date().toISOString();
      }

      await axios.post(
        `${API_CONFIG.MAIN_API}/api/result-update/verify/etranzact`,
        payload,
        { headers: { "Content-Type": "application/json" }, timeout: 20000 }
      );

      // close + notify parent
      setIsOpen(false);
      completePayment(ref, true);
    } catch (err) {
      console.error("etranzact verify failed", err);
      setIsOpen(false);
      completePayment(txRef || tx_ref, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentInit = async () => {
    setIsLoading(true);

    const [firstName, lastName] = name.split(" ");

    // Get API key from environment (secure)
    const etrasactAuthKey = import.meta.env.VITE_ETRASACT_AUTH_KEY;
    if (!etrasactAuthKey) {
      logger.error("eTranzact auth key not configured");
      alert("Payment service not properly configured");
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl =
        import.meta.env.VITE_ETRASACT_API_URL || "https://api.credodemo.com";
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
            `${API_CONFIG.MAIN_API}/api/result-update/verify/etranzact`,
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
        openPaymentPopup(data.data.authorizationUrl);
        // setIframeUrl(data.data.authorizationUrl);
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
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      const d = e.data || {};
      if (d.type === "ETRANZACT_COMPLETE" && d.ref === (txRef || tx_ref)) {
        verifyWithExtras(); // this POSTs attachment_data_url, request_type, etc.
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [txRef, tx_ref]);

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

export default EtrasactAPIStamp;
