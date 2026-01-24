import { ResetPasswordVerifyProps } from "@/api/interfaces/reset-password";
import { resetPasswordVerify } from "@/api/reset-password";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageTitle from "@/components/ui/page-title";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { ChangeEvent } from "preact/compat";
import { useState } from "preact/hooks";
import { Fragment } from "preact"; // Added Fragment import
import * as yup from "yup";

interface VerifyProps {
  otp: string;
}

interface IVerifyResetPassword {
  onClick: any;
  previousPage: any;
  email: string;
}

const VerifyResetPassword: FunctionalComponent<IVerifyResetPassword> = ({
  onClick,
  previousPage,
  email,
}) => {
  const [inputState, setInputState] = useState<string>("");
  const [buttonState, setButtonState] = useState<boolean>(true);

  const verifyResetPasswordRequest =
    useRequest<ResetPasswordVerifyProps>(resetPasswordVerify);

  async function verifyResetPasswordFunc(email: string, otp: string) {
    const [response, error] = await verifyResetPasswordRequest.makeRequest({
      email,
      otp,
    });
    if (!error) {
      NotifySuccess("OTP verified successfully!");
      onClick();
    } else {
      const errorMsg = error?.data?.message || error?.data?.info;
      const msg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg || "Invalid OTP. Please try again.";
      NotifyError(msg);
      return;
    }
  }
  const handleChange = (otp: string) => {
    setInputState(otp.trim());
    if (otp.trim().length >= 6) {
      setButtonState(false);
    } else {
      setButtonState(true);
    }
  };

  const formik = useFormik({
    initialValues: { email: "", otp: "" },
    onSubmit(values) {
      verifyResetPasswordFunc(email, inputState);
    },
    validationSchema: null,
  });
  return (
    <>
      <PageTitle title="Verify Reset Password" />
      <div className="w-full lg:w-3/4  mb-3 flex flex-col items-start">
        <h1 className="font-bold mb-2 text-2xl text-gray-800">
          Verify your account
        </h1>
        <p className="text-gray-500 mb-5 font-light text-sm text-left">
          An OTP has been sent to{" "}
          <span className=" font-semibold ">{email}</span>
        </p>

        <div className="mt-5 mb-5 w-full">
          <Input
            label="Enter OTP"
            id="otp"
            dimension="lg"
            variant="primary"
            value={inputState}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange((e.target as HTMLInputElement).value)
            }
            type="text"
            autoComplete="otp"
            required
          />
        </div>

        <div className="mt-3 w-full">
          <Button
            type="button"
            dimension="lg"
            variant="primary"
            isLoading={verifyResetPasswordRequest.isLoading}
            disabled={buttonState}
            onClick={() => formik.handleSubmit()}
          >
            Next
          </Button>
        </div>

        <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
          <p className="text-gray-400">
            Entered a Wrong Email?{" "}
            <button onClick={() => previousPage()} className="text-primary-500">
              Click here
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default VerifyResetPassword;
