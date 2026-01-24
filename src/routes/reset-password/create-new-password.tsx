import { ResetPasswordCompleteProps } from "@/api/interfaces/reset-password";
import { resetPasswordComplete } from "@/api/reset-password";
import CancelVisibilityIcon from "@/assets/icons/cancel-visibility-icon";
import ConfirmIcon from "@/assets/icons/confirm-icon";
import VisibilityIcon from "@/assets/icons/visibility-icon";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import PageTitle from "@/components/ui/page-title";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";

interface ICreateNewPassword {
  onClick: any;
  email: string;
}

const validationSchema = yup.object({
  password: yup
    .string()
    .required("Enter your new password")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&+=_\\\-"/><()|~\[\]{};:'",.`])[A-Za-z\d@$!#%*?&+=_\\\-"/><()|~\[\]{};:'",.`]{8,}$/,
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  confirm_password: yup
    .string()
    .required("Enter confirm password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const CreateNewPassword: FunctionalComponent<ICreateNewPassword> = ({
  onClick,
  email,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const completeResetPasswordRequest = useRequest<ResetPasswordCompleteProps>(
    resetPasswordComplete,
  );

  async function completeResetPasswordFunc(
    password: string,
    confirm_password: string,
    email: string,
  ) {
    const [response, error] = await completeResetPasswordRequest.makeRequest({
      password,
      confirm_password,
      email,
    });
    if (!error) {
      // Set flag to indicate password has been reset
      localStorage.setItem("passwordResetCompleted", "true");

      // Mark user as having reset password after Jan 17, 2026
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.password_reset_after_jan_17_2026 = true;
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch (e) {
        console.error("Error updating user password reset status:", e);
      }
      NotifySuccess("Password reset successful!");
      onClick();
    } else {
      const errorMsg = error?.data?.message || error?.data?.info;
      const msg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg || "Failed to reset password. Please try again.";
      NotifyError(msg);
      return;
    }
  }

  const formik = useFormik({
    initialValues: { password: "", confirm_password: "", email: "" },
    onSubmit(values) {
      completeResetPasswordFunc(
        values.password,
        values.confirm_password,
        email,
      );
    },
    validationSchema,
  });
  return (
    <>
      <PageTitle title="Create New Password" />
      <form
        onSubmit={formik.handleSubmit}
        className="w-full lg:w-3/4  mb-3 flex flex-col items-start"
      >
        <h1 className="font-bold mb-2 text-2xl text-gray-800">
          Create Password
        </h1>
        <p className="text-gray-500 mb-5 font-light text-sm text-left">
          Ensure your password has at least
        </p>

        <div className="mt-5 w-full">
          <Input
            label="Password"
            id="password"
            dimension="lg"
            variant={formik.errors.password ? "danger" : "primary"}
            {...formik.getFieldProps("password")}
            rightSlot={() => (
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 cursor-pointer"
              >
                {showPassword ? <VisibilityIcon /> : <CancelVisibilityIcon />}
              </span>
            )}
            type={showPassword ? "text" : "password"}
            required
            error={formik.touched.password ? formik.errors.password : undefined}
          />
        </div>

        <div className="mt-5 mb-5 w-full">
          <Input
            label="Confirm Password"
            id="confirm_password"
            dimension="lg"
            variant="primary"
            {...formik.getFieldProps("confirm_password")}
            type="text"
            autoComplete="confirm_password"
            required
            error={
              formik.touched.confirm_password
                ? formik.errors.confirm_password
                : undefined
            }
          />
        </div>

        <div className="mt-5 w-full">
          <Button
            type="submit"
            dimension="lg"
            variant="primary"
            isLoading={completeResetPasswordRequest.isLoading}
            disabled={!(formik.isValid && formik.dirty)}
          >
            Submit
          </Button>
        </div>
      </form>
    </>
  );
};

export default CreateNewPassword;
