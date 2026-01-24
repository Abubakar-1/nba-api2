import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import LoginStepBar from "@/components/ui/login-step-bar";
import LoginStepCheck from "@/components/ui/login-step-check";
import { verifyRegistrationOTPApi } from "@/api/auth";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Support from "@/components/ui/support";
import PageTitle from "@/components/ui/page-title";

interface IVerifyEmailProps {
  email: string;
  onNext: () => void;
  onBack: () => void;
  activatePage: (page: string) => void;
}

const VerifyEmail: FunctionalComponent<IVerifyEmailProps> = ({
  email,
  onNext,
  onBack,
  activatePage,
}) => {
  const [otp, setOTP] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signUpStepArray = [
    { name: "Enter SCN", state: true },
    { name: "Register", state: true },
    { name: "Verify Email", state: true },
    { name: "Create Password", state: false },
  ];

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      NotifyError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const [response, error] = await verifyRegistrationOTPApi({
        email,
        otp,
      });

      if (error) {
        NotifyError(
          error?.data?.message || error?.message || "OTP verification failed",
        );
        setIsLoading(false);
        return;
      }

      NotifySuccess("Email verified successfully!");
      onNext();
    } catch (err: any) {
      NotifyError(err?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-w-full min-h-screen p-4 lg:px-[10%] lg:pt-[10%] 2xl:px-[15%] flex flex-col justify-center lg:justify-start items-start">
      <PageTitle title="Sign Up - Verify Email" />

      {/* Progress Steps */}
      <div className="h-fit w-full flex justify-evenly items-center mb-10 lg:-ml-4">
        {signUpStepArray.map((el, id) => (
          <div
            key={id}
            className={`hidden md:flex justify-evenly items-center w-full ${
              el.name === "Create Password" && "!justify-start"
            }`}
          >
            <LoginStepCheck
              state={el.state}
              value={el.name}
              onClick={() => el.state && activatePage(el.name)}
            />
            {el.name !== "Create Password" && <LoginStepBar state={el.state} />}
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-10">
        <Link
          to="/signup"
          className="w-24 text-left text-black font-semibold border-b-[0.19rem] border-primary-500 focus:outline-none py-2"
        >
          &nbsp; Sign Up
        </Link>
        <Link
          to="/login"
          className="pl-2 w-24 text-left text-gray-500 border-gray-300 border-b-[0.1rem] py-2"
        >
          &nbsp; Login
        </Link>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full lg:w-3/4 mb-3 flex flex-col items-start"
      >
        <h1 className="font-bold mb-2 text-2xl text-gray-800">
          Verify your email
        </h1>

        <p className="text-gray-500 mb-5 font-light text-sm text-left">
          We've sent a 6-digit verification code to <strong>{email}</strong>.
          Please enter the code below to verify your email address.
        </p>

        <div className="mt-5 mb-5 w-full">
          <Input
            label="Verification Code"
            id="otp"
            dimension="lg"
            variant="primary"
            value={otp}
            placeholder="Enter 6-digit code"
            type="text"
            maxLength={6}
            autoComplete="one-time-code"
            onChange={(e) => {
              const value = (e.target as HTMLInputElement).value.replace(
                /\D/g,
                "",
              );
              setOTP(value);
            }}
          />
        </div>

        <div className="mt-5 w-full flex gap-4">
          <Button
            type="button"
            dimension="lg"
            variant="outline"
            onClick={onBack}
            className="flex-1 border-1 border-[black] rounded-full"
          >
            Back
          </Button>
          <Button
            type="submit"
            dimension="lg"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || otp.length !== 6}
            className="flex-1  bg-primary-500 p-4 text-white rounded-full"
          >
            Verify
          </Button>
        </div>
      </form>

      <Support />
    </div>
  );
};

export default VerifyEmail;
