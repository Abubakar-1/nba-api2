import { resetPasswordInitiate } from "@/api/reset-password";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageTitle from "@/components/ui/page-title";
import AuthContext from "@/context/auth-context";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { Link } from "react-router-dom";
import * as yup from "yup";

interface InitiateProps {
  email: string;
}
interface IInitiateResetPassword {
  onClick: any;
}

const InitiateResetPassword: FunctionalComponent<IInitiateResetPassword> = ({
  onClick,
}) => {
  const initiateRequest = useRequest<{ email: string }>(resetPasswordInitiate);

  const validationSchema = yup.object({
    email: yup.string().email().required(),
  });

  async function intiateResetPasswordFunc(email: string) {
    const [response, error] = await initiateRequest.makeRequest({
      email,
    });
    if (!error) {
      NotifySuccess("Password reset OTP has been sent to your email!");
      onClick(email);
    } else {
      const errorMsg = error?.data?.message || error?.data?.info;
      const msg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg || "Failed to send password reset email";
      NotifyError(msg);
      return;
    }
  }

  const formik = useFormik({
    initialValues: { email: "" },
    onSubmit(values) {
      intiateResetPasswordFunc(values.email);
    },
    validationSchema: validationSchema,
  });
  return (
    <>
      <PageTitle title="Initiate Reset Password" />
      <form
        onSubmit={formik.handleSubmit}
        className="w-full lg:w-3/4  mb-3 flex flex-col items-start"
      >
        <h1 className="font-bold mb-2 text-2xl text-gray-800">
          Reset password
        </h1>
        <p className="text-gray-500 mb-5 font-light text-sm text-left">
          Enter your email address you used in registering your account
        </p>

        <div className="mt-5 mb-5 w-full">
          <Input
            label="Email Address"
            id="email"
            dimension="lg"
            variant="primary"
            placeholder="sample@gmail.com"
            {...formik.getFieldProps("email")}
            type="text"
            autoComplete="email"
            required
            error={formik.touched.email ? formik.errors.email : undefined}
          />
        </div>

        <div className="mt-3 w-full">
          <Button
            type="submit"
            dimension="lg"
            variant="primary"
            isLoading={initiateRequest.isLoading}
            disabled={!(formik.isValid && formik.dirty)}
          >
            Continue
          </Button>
        </div>

        <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
          <Link to="/" className="text-primary-500 cursor-pointer">
            Back to login
          </Link>
        </div>
      </form>
    </>
  );
};

export default InitiateResetPassword;
