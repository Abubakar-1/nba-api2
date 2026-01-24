import { FlutterWaveButton } from "flutterwave-react-v3";
import classNames from "classnames";
import { FunctionalComponent } from "preact";
import { useRef, useEffect, useState } from "preact/hooks";
import logo from "../../assets/images/logo.png";
import { BtnLoader, CircleLoader } from "../ui/loader";
import axios from "axios";
import { logger } from "@/utils/logger";
import { API_CONFIG } from "@/api/config";

interface FlutterwaveProps {
  amount: number;
  email: string;
  phone: string;
  pk: string;
  name: string;
  tx_ref: string;
  completePayment: any;
  label?: string;
  attachmentFile?: File | string | null;
  attachmentDate?: string | null;
  requestType?: "public" | "private";
  className?: string;
}

const FlutterwaveAPI: FunctionalComponent<FlutterwaveProps> = ({
  pk,
  amount,
  email,
  phone,
  name,
  completePayment,
  tx_ref,
  label = "Pay with FlutterWave",
  attachmentFile,
  attachmentDate,
  requestType,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const config = {
    public_key: pk,
    tx_ref: tx_ref,
    amount: amount,
    currency: "NGN",
    payment_options: "card",
    customer: {
      email: email,
      phonenumber: phone,
      name: name,
    },
    customizations: {
      title: "NBA Account",
      description: "BPF Payment",
      logo: logo,
    },
  };

  const stopLoader = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 10000);
  };

  function isDataUrl(v: unknown): v is string {
    return typeof v === "string" && /^data:[^;]+;base64,/.test(v);
  }
  const postedOnce = useRef(false);

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

  const fwConfig = {
    ...config,
    text: "",
    callback: async (response: any) => {
      if (postedOnce.current) return; // guard: FLW sometimes fires twice
      postedOnce.current = true;

      try {
        const payload: any = {
          gateway: "FLUTTERWAVE",
          status: response?.status || response?.data?.status,
          tx_ref: response?.tx_ref || response?.data?.tx_ref,
          id: response?.transaction_id || response?.id,
          amount: Number(response?.charged_amount ?? response?.amount),
        };
        if (attachmentFile) {
          logger.debug("Attachment detected", { hasFile: true });
          const dataUrl = await toDataUrl(attachmentFile); // <-- optional
          payload.attachment_data_url = dataUrl;
          payload.attachment_date = attachmentDate || new Date().toISOString();
        }

        if (requestType) {
          payload.request_type = requestType; // "public" | "private"
        }

        setIsLoading(true);
        logger.debug("Flutterwave payload", payload);

        const { data } = await axios.post(
          `${API_CONFIG.MAIN_API}/api/result-update/verify/flutterwave`,
          payload,
          { timeout: 20000, headers: { "Content-Type": "application/json" } }
        );
        logger.debug("Payment verification success", data);
      } catch (e) {
        logger.error("Payment verification failed", e);
        // optional: toast/log
      } finally {
        // hide loader; closing modal handled by the library
        setIsLoading(false);
      }

      // 3) let the parent know so it can refresh UI / show success modal
      const ok =
        response?.status === "successful" || response?.status === "completed";
      completePayment(response?.tx_ref, ok);
    },
    onClose: async () => {
      setIsLoading(false);
      try {
        await axios.post(
          `${API_CONFIG.MAIN_API}/api/result-update/verify/flutterwave`,
          {
            gateway: "FLUTTERWAVE",
            tx_ref,
            // allow backend to pull real status via Flutterwave API
          },
          { timeout: 20000 }
        );
      } catch (e) {
        logger.error("Modal close verification error", e);
      }
    },
  };
  const handleClick = () => {
    setIsLoading(true); // show loader when user clicks the button
    stopLoader();
  };

  useEffect(() => {
    postedOnce.current = false;
  }, [tx_ref]);
  // 6922269
  return (
    <div onClick={handleClick} className="flex justify-center">
      <FlutterWaveButton
        {...fwConfig}
        className={classNames(
          "inline-flex items-center justify-center font-medium px-4 py-2.5 text-base rounded-3xl bg-primary-500 hover:bg-primary-600 text-white transition-all",
          className ? className : "w-full"
        )}
      >
        {isLoading ? <BtnLoader isOutlined={isLoading} /> : label}
      </FlutterWaveButton>
    </div>
  );
};

export default FlutterwaveAPI;
