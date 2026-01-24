import ConfirmIcon from "@/assets/icons/confirm-icon";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import PageTitle from "@/components/ui/page-title";
import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import { Link, useNavigate } from "react-router-dom";
import { Fragment } from "preact";
import * as yup from "yup";
import CreateNewPassword from "./create-new-password";
import InitiateResetPassword from "./initiate-reset-password";
import VerifyResetPassword from "./verify-reset-password";

const validationSchema = yup.object({
  email: yup.string().email().required("Required field"),
});

const ResetPassword: FunctionalComponent = () => {
  const [resetPasswordState, setResetPasswordStatee] = useState({
    initiate: true,
    verifyAccount: false,
    createPassword: false,
    email: "",
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleStep1 = (email: string) => {
    setResetPasswordStatee((prev) => ({
      ...prev,
      initiate: false,
      verifyAccount: true,
      createPassword: false,
      email,
    }));
  };

  return (
    <div className="min-w-full min-h-screen p-4 pt-[10%] lg:px-[10%] lg:pt-[10%] 2xl:px-[15%] flex flex-col justify-center lg:justify-start items-start">
      <PageTitle title="Reset Password" />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="lg:px-10 py-5 flex flex-col justify-center items-center gap-6">
          <ConfirmIcon />
          <h1 className="text-sm md:text-base lg:text-lg font-semibold">
            Password reset successful!
          </h1>
          <Button
            variant="primary"
            dimension="lg"
            onClick={(e) => {
              setIsOpen(false);
              navigate("/login");
              e.preventDefault();
            }}
          >
            Click here to login
          </Button>
        </div>
      </Modal>
      <>
        {resetPasswordState.initiate && (
          <InitiateResetPassword onClick={handleStep1} />
        )}

        {resetPasswordState.verifyAccount && (
          <VerifyResetPassword
            onClick={() =>
              setResetPasswordStatee((prev) => ({
                ...prev,
                initiate: false,
                verifyAccount: false,
                createPassword: true,
              }))
            }
            previousPage={() =>
              setResetPasswordStatee((prev) => ({
                ...prev,
                initiate: true,
                verifyAccount: false,
                createPassword: false,
              }))
            }
            email={resetPasswordState.email}
          />
        )}

        {resetPasswordState.createPassword && (
          <CreateNewPassword
            onClick={() => {
              setResetPasswordStatee((prev) => ({
                ...prev,
                initiate: false,
                verifyAccount: false,
                createPassword: false,
              }));
              setIsOpen(true);
            }}
            email={resetPasswordState.email}
          />
        )}
      </>
    </div>
  );
};
export default ResetPassword;
