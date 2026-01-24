import { FunctionalComponent } from "preact";
import { useNavigate } from "react-router-dom";

interface PasswordResetBannerProps {
  onDismiss?: () => void;
}

const PasswordResetBanner: FunctionalComponent<PasswordResetBannerProps> = ({
  onDismiss,
}) => {
  const navigate = useNavigate();

  const handleResetPassword = () => {
    navigate("/passwordreset");
  };

  return (
    <div className="w-full bg-red-600 border-2 border-red-700 rounded-lg p-4 mb-6 shadow-lg">
      <div className="flex items-start gap-3">
        {/* Warning Icon */}
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-1">
            Mandatory Password Reset Required
          </h3>
          <p className="text-white text-sm mb-3">
            <strong>Effective January 17, 2026:</strong> For security purposes,
            all users are required to reset their passwords. Please reset your
            password immediately to continue using your account.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleResetPassword}
              className="bg-white text-red-600 font-semibold px-6 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md"
            >
              Reset Password Now
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="bg-red-700 text-white font-semibold px-6 py-2 rounded-md hover:bg-red-800 transition-colors duration-200 border border-white"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {/* Close Icon (Optional) */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            aria-label="Close notification"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default PasswordResetBanner;
