import { validateUserOTP } from "@/api/auth";
import { IValidateOTP } from "@/api/interfaces/auth";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import LoginStepBar from "@/components/ui/login-step-bar";
import LoginStepCheck from "@/components/ui/login-step-check";
import PageTitle from "@/components/ui/page-title";
import AuthContext from "@/context/auth-context";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { Link } from "react-router-dom";
import * as yup from "yup";

interface IVerifyAccount {
  onClick: any;
  activatePage: any;
  previousPage: any;
}

const VerifyAccount: FunctionalComponent<IVerifyAccount> = ({
  onClick,
  activatePage,
  previousPage,
}) => {
  const { signUpInfo } = AuthContext.useContainer();

  const { makeRequest, isLoading } = useRequest<IValidateOTP>(validateUserOTP);

  const validationSchema = yup.object({
    otp: yup.string().required("Required field"),
  });

  async function submit(body: IValidateOTP) {
    const [response, _err] = await makeRequest(body);
    if (!_err) {
      onClick();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  const signUpStepArray = [
    {
      name: "SCN & Year",
      state: true,
    },
    {
      name: "Verify Bio",
      state: true,
    },
    {
      name: "Update Bio",
      state: true,
    },
    {
      name: "Verify Account",
      state: true,
    },
    {
      name: "Create Password",
      state: false,
    },
  ];

  const formik = useFormik({
    validationSchema,
    initialValues: {
      otp: "",
    },
    onSubmit(values, formikHelpers) {
      submit({ ...values, email: signUpInfo?.email + "" });
    },
  });
  return (
    <div className="min-w-full min-h-screen p-4 pt-[10%] lg:px-[10%] lg:pt-[10%] 2xl:px-[15%] flex flex-col justify-center lg:justify-start items-start">
      <PageTitle title="Verify Account" />
      <div className="h-fit w-full flex justify-evenly items-center mb-10 lg:-ml-4">
        {signUpStepArray.map((el, id) => {
          return (
            <div
              className={`hidden md:flex justify-evenly items-center w-full ${
                el.name === "Create Password" && "!justify-start"
              }`}
            >
              <LoginStepCheck
                state={el.state}
                value={el.name}
                onClick={() => el.state && activatePage(el.name)}
              />

              {el.name !== "Create Password" && (
                <LoginStepBar state={el.state} />
              )}
            </div>
          );
        })}
      </div>

      <>
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
        <form
          onSubmit={formik.handleSubmit}
          className="w-full lg:w-3/4  mb-3 flex flex-col items-start"
        >
          <h1 className="font-bold mb-2 text-2xl text-gray-800">
            Verify your account
          </h1>
          <p className="text-gray-500 mb-5 font-light text-sm text-left">
            An OTP has been sent to{" "}
            <span className=" font-semibold ">{signUpInfo?.email}</span>
          </p>
          <div className="mt-5 mb-5 w-full">
            <Input
              label="Enter OTP"
              id="otp"
              dimension="lg"
              variant={formik.errors.otp ? "danger" : "primary"}
              {...formik.getFieldProps("otp")}
              type="text"
              autoComplete="otp"
              required
              error={formik.touched.otp ? formik.errors.otp : undefined}
            />
          </div>

          <div className="mt-3 w-full">
            <Button
              type="submit"
              dimension="lg"
              variant="primary"
              className="flex-1  bg-primary-500 p-4 text-white rounded-full"
              isLoading={isLoading}
              disabled={!(formik.isValid && formik.dirty)}
            >
              Next
            </Button>
          </div>
          <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
            <p className="text-gray-400">
              Entered a Wrong Email?{" "}
              <button
                type="button"
                onClick={(e) => {
                  previousPage();
                  e.preventDefault();
                }}
                className="flex-1 border-1 border-[black] rounded-full"
              >
                Click here
              </button>
            </p>
          </div>
        </form>
      </>
    </div>
  );
};
export default VerifyAccount;
