import { createUserPassword } from "@/api/auth";
import { ICreateUserPassword } from "@/api/interfaces/auth";
import CancelVisibilityIcon from "@/assets/icons/cancel-visibility-icon";
import ConfirmIcon from "@/assets/icons/confirm-icon";
import VisibilityIcon from "@/assets/icons/visibility-icon";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import LoginStepBar from "@/components/ui/login-step-bar";
import LoginStepCheck from "@/components/ui/login-step-check";
import { Modal } from "@/components/ui/modal";
import PageTitle from "@/components/ui/page-title";
import AuthContext from "@/context/auth-context";
import { CreatePasswordSchema } from "@/schema/sign-up";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { Link } from "react-router-dom";
import * as yup from "yup";

interface ICreatePassword {
  onClick: any;
  activatePage: any;
}
// set
const CreatePassword: FunctionalComponent<ICreatePassword> = ({
  onClick,
  activatePage,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { signUpInfo, setSignUpInfo } = AuthContext.useContainer();

  const { makeRequest, isLoading } =
    useRequest<ICreateUserPassword>(createUserPassword);

  async function submit(body: ICreateUserPassword) {
    const [response, _err] = await makeRequest(body);
    if (!_err) {
      setIsOpen(true);
      setSignUpInfo((prevState: any) => ({
        ...prevState,
        password: body.password,
      }));
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
      state: true,
    },
  ];

  const formik = useFormik({
    validationSchema: CreatePasswordSchema,
    initialValues: {
      password: "",
      confirm_password: "",
      email: "",
    },
    onSubmit(values, formikHelpers) {
      submit({ ...values, email: signUpInfo?.email + "" });
    },
  });

  return (
    <div className="min-w-full min-h-screen p-4 lg:px-[10%] lg:pt-[10%] 2xl:px-[15%] flex flex-col justify-center lg:justify-start items-start">
      <PageTitle title="Create Password" />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="lg:px-10 py-5 flex flex-col justify-center items-center gap-6">
          <ConfirmIcon />
          <h1 className="text-sm md:text-base lg:text-lg font-semibold">
            Account created Successfully
          </h1>
          <Button
            variant="primary"
            dimension="lg"
            onClick={(e) => {
              setIsOpen(false);
              onClick();
              e.preventDefault();
            }}
          >
            Click here to login
          </Button>
        </div>
      </Modal>
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
            to="/login"
            className="pl-2 w-24 text-left text-gray-500 border-gray-300 border-b-[0.1rem]"
          >
            &nbsp; Login
          </Link>
          <Link
            to="/signup"
            className="w-24 text-left text-black font-semibold border-b-[0.19rem] border-primary-500 focus:outline-none"
          >
            &nbsp; Sign Up
          </Link>
        </div>
        <form
          onSubmit={formik.handleSubmit}
          className="w-full lg:w-3/4  mb-3 flex flex-col items-start"
        >
          <h1 className="font-bold mb-2 text-2xl text-gray-800">
            Create Password
          </h1>
          <p className="text-gray-500 mb-5 font-light text-sm text-left">
            Ensure that your password is strong and secure
          </p>

          <div className="mt-5 w-full">
            <Input
              label="Password"
              id="password"
              dimension="lg"
              defaultValue={signUpInfo?.password}
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
              error={
                formik.touched.password ? formik.errors.password : undefined
              }
            />
          </div>

          <div className="mt-5 mb-5 w-full">
            <Input
              label="Confirm Password"
              id="confirm_password"
              dimension="lg"
              variant={formik.errors.confirm_password ? "danger" : "primary"}
              {...formik.getFieldProps("confirm_password")}
              type="password"
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
              isLoading={isLoading}
              // onClick={() => onClick()}
              disabled={!(formik.isValid && formik.dirty)}
            >
              Submit
            </Button>
          </div>
        </form>
      </>
    </div>
  );
};
export default CreatePassword;
