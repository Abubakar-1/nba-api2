import { FunctionalComponent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import PageTitle from "@/components/ui/page-title";
import logo from "@/assets/svg/logo.svg";
import { verifyLoginOtp, resendLoginOtp } from "@/api/auth";
import AuthContext from "@/context/auth-context";

const TwoFactorAuth: FunctionalComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = AuthContext.useContainer();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email/phone from navigation state (passed from login)
  const { email, phone } = (location.state as any) || {};

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData?.getData("text").slice(0, 6);
    if (pastedData && /^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
      setOtp(newOtp);
      // Focus last filled input
      const lastIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      NotifyError("Please enter the complete 6-digit code");
      return;
    }

    if (!email) {
      NotifyError("Email not found. Please try logging in again.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const [response, error] = await verifyLoginOtp({ otp: otpCode, email });

      if (error) {
        const errorMsg = error?.data?.message;
        const msg = Array.isArray(errorMsg) 
          ? errorMsg.join(", ") 
          : (errorMsg || "Invalid OTP code. Please try again.");
        NotifyError(msg);
        return;
      }

      NotifySuccess("Verification successful!");
      
      // Perform full login with the response from OTP verification
      login(response);
      
      // AuthContext will automatically switch to shaded/authenticated view
      // but explicitly navigating to dashboard just in case
      navigate("/dashboard");
    } catch (error) {
      NotifyError("Invalid OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewCode = async () => {
    if (!email) {
      NotifyError("Email not found. Please try logging in again.");
      return;
    }

    setIsResending(true);
    try {
      const [response, error] = await resendLoginOtp({ email });

      if (error) {
        NotifyError(error?.data?.message || "Failed to resend code. Please try again later.");
        return;
      }

      NotifySuccess("A new code has been sent to your email!");
      // Clear inputs for the new code
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (error) {
      NotifyError("Failed to resend code. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      <PageTitle title="Verify OTP" />

      {/* Left Side - Image (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 lg:bg-gradient-to-br lg:from-primary-50 lg:to-primary-100 lg:items-center lg:justify-center lg:p-12"></div>

      {/* Right Side - OTP Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Logo */}
        <div className="lg:hidden w-full flex justify-center pt-6">
          <img
            src={logo}
            alt="NBA Logo"
            className="h-12 w-auto"
            style={{ imageRendering: "crisp-edges" }}
          />
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex w-full justify-end items-center px-12 pr-[82px] py-10 pt-[70px]">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary-500 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Main Content - Centered OTP Form */}
        <div className="flex-1 flex items-center px-6 lg:px-0 lg:-ml-[350px] pb-12 lg:pb-0 mt-[80px] lg:mt-0">
          <div className="w-full max-w-[400px]">
            {/* Mobile Sign Up Link */}
            <div className="lg:hidden text-right mb-6">
              <p className="text-xs text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary-500 font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Title */}
            <h1 className="text-base font-bold text-gray-700 mb-8">
              Enter OTP code
            </h1>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-3 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(index, e.currentTarget.value)
                  }
                  onKeyDown={(e) => handleKeyDown(index, e as any)}
                  onPaste={index === 0 ? (handlePaste as any) : undefined}
                  className="w-[47px] h-[47px] md:w-[55px] md:h-[55px] text-center text-lg font-semibold border border-primary-500 rounded-[22px] focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all bg-white"
                />
              ))}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-500 text-center mb-6">
              Enter the 6-digits code sent to your email or phone number
            </p>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              ) : (
                "Verify"
              )}
            </button>

            {/* Request New Code Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Didn't receive code?{" "}
                <button
                  onClick={handleRequestNewCode}
                  disabled={isResending}
                  className="font-semibold text-primary-500 hover:text-primary-600 hover:underline disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend code"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
