import { useEffect } from "preact/hooks";
import { Modal } from "@/components/ui/modal";
import { CircleLoader } from "@/components/ui/loader";
import Button from "@/components/ui/button";
import etranzactLogo from "@/assets/images/etranzact.png";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentUrl: string;
}

export const PaymentGatewayModal = ({
  isOpen,
  onClose, // Although we might not use this if we force redirect
  paymentUrl,
}: PaymentGatewayModalProps) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && paymentUrl) {
      timer = setTimeout(() => {
        window.location.href = paymentUrl;
      }, 4600);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, paymentUrl]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing by clicking outside during simulation
      showCloseIcon={false}
      dimensions="md"
      zIndex={9999}
    >
      <div className="flex flex-col items-center justify-center py-6 gap-6">
        <h2 className="text-xl font-bold text-gray-800">Payment Options</h2>

        <div className="flex flex-col gap-4 w-full justify-center items-center">
          {/* Simulated Buttons */}
          <div className="flex gap-4 w-full justify-center">
            <button
              disabled
              className="w-full border rounded-lg p-4 flex items-center justify-center opacity-50 cursor-not-allowed bg-gray-50"
            >
              <span className="font-bold text-lg text-gray-700">
                Flutterwave
              </span>
            </button>

            <button
              disabled
              className="w-full border rounded-lg p-4 flex items-center justify-center opacity-50 cursor-not-allowed bg-gray-50"
            >
              <img
                src={etranzactLogo}
                alt="e-Tranzact"
                className="h-8 object-contain"
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mt-4">
          <CircleLoader isOutlined={true} />
          <p className="text-sm text-gray-500 font-medium animate-pulse">
            Selecting the available payment option...
          </p>
        </div>
      </div>
    </Modal>
  );
};
