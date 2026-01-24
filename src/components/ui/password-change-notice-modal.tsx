import { FunctionalComponent } from "preact";
import { Modal } from "./modal";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import Button from "./button";
import { useNavigate } from "react-router-dom";

type ComponentProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const PasswordChangeNoticeModal: FunctionalComponent<ComponentProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleResetPassword = () => {
    onClose();
    navigate("/passwordreset");
  };

  const handleMaybeLater = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} dimensions="lg">
      <div className="relative">
        {/* Decorative gradient background */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-600 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-primary-500 to-blue-600 p-4 rounded-full">
                <ShieldCheckIcon className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-4">
            Security Update Required
          </h2>

          {/* Message */}
          <div className="space-y-4 mb-8">
            <p className="text-gray-700 text-center text-base lg:text-lg leading-relaxed">
              Our new system requires all users to{" "}
              <span className="font-semibold text-primary-600">
                reset their passwords
              </span>{" "}
              thanks for your understanding
            </p>

            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4">
              <p className="text-gray-800 text-sm lg:text-base">
                Before logging in, you are required to reset your password to
                access your account.
              </p>
            </div>

            <div className="flex items-start gap-3 text-gray-600 text-sm">
              <ShieldCheckIcon className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <p>
                This is a one-time requirement to ensure your account remains
                secure under our improved security measures.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleMaybeLater}
              variant="secondary"
              dimension="lg"
              className="rounded-full px-6 py-2 text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 min-w-[160px]"
            >
              Got it.
            </Button>
            <Button
              onClick={handleResetPassword}
              variant="primary"
              dimension="lg"
              className="bg-primary-500 rounded-full px-6 py-2 text-white min-w-[160px] shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300"
            >
              Reset Password Now
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
