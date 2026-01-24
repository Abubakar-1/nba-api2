import { loginApi, verifySCNApi } from "@/api/auth";
import { ILogin, ILoginResponse } from "@/api/interfaces/auth";

interface ILoginForm {
  username: string;
  password: string;
}
import CancelVisibilityIcon from "@/assets/icons/cancel-visibility-icon";
import VisibilityIcon from "@/assets/icons/visibility-icon";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import { PasswordChangeNoticeModal } from "@/components/ui/password-change-notice-modal";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageTitle from "@/components/ui/page-title";
import AuthContext from "@/context/auth-context";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { useState, useEffect } from "preact/hooks";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

const validationSchema = yup.object({
  username: yup.string().required("Required field"),
  password: yup.string().required("Required field"),
});

const Login: FunctionalComponent = () => {
  const navigate = useNavigate();
  const { login, signUpInfo } = AuthContext.useContainer();

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { isLoading, makeRequest, error } = useRequest<ILogin>(loginApi);
  const verifyCenterRequest = useRequest(verifySCNApi);
  const [showPasswordNotice, setShowPasswordNotice] = useState<boolean>(false);

  // Check if user has already reset their password or dismissed the notice
  useEffect(() => {
    const hasResetPassword = localStorage.getItem("passwordResetCompleted");
    const hasSeenNotice = localStorage.getItem("hasSeenPasswordNotice");

    // Show modal only if neither flag is set
    if (!hasResetPassword && !hasSeenNotice) {
      setShowPasswordNotice(true);
    }
  }, []);

  const handleClosePasswordNotice = () => {
    // Set flag to prevent showing modal again
    localStorage.setItem("hasSeenPasswordNotice", "true");
    setShowPasswordNotice(false);
  };

  // Check if user needs to reset password on component mount

  async function loginUser(formData: ILoginForm) {
    const username = formData.username.trim();

    // Check if input is a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(username);

    const payload: ILogin = {
      password: formData.password.trim(),
    };

    if (isEmail) {
      payload.email = username;
    } else {
      payload.scn = username;
    }

    const [response, _err] = (await makeRequest(payload)) as [any, any];
    if (!_err) {
      if (response?.accessToken) {
        // Direct successful login (e.g. recognized device)
        NotifySuccess("Login successful!");
        login(response);
        navigate("/dashboard");
      } else {
        // Redirect to OTP verification
        NotifySuccess("OTP code sent to your email!");
        navigate("/verify-otp", { state: { email: username } });
      }
    } else if (_err && _err?.data) {
      const errorMsg = _err?.data?.message || _err?.data?.info;
      const msg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg || "Login failed";
      NotifyError(msg);
      return;
    } else {
      NotifyError(
        _err?.info || _err?.message || "An unexpected error occurred",
      );
      return;
    }
  }

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    onSubmit(values: ILoginForm) {
      loginUser(values);
    },
    validationSchema,
  });
  return (
    <div className="min-w-full min-h-screen px-4 lg:px-[10%] 2xl:px-[15%] flex flex-col justify-center items-start">
      <PageTitle title="Login" />
      <PasswordChangeNoticeModal
        isOpen={showPasswordNotice}
        onClose={handleClosePasswordNotice}
      />
      <div className="w-full mb-8 overflow-hidden bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative">
        {/* @ts-ignore */}
        <marquee behavior="scroll" direction="left">
          <b>Please note: as a temporary measure, all payments are to be made only on this web portal at https://portal.nigerianbar.org.ng/
. Mobile app payments are currently on hold and will be enabled shortly.</b>
        </marquee>
      </div>
      <div className="flex mb-10">
        <Link
          to="/signup"
          className="w-24 text-left text-gray-500 border-gray-300 border-b-[0.1rem] py-2"
        >
          &nbsp; Sign Up
        </Link>
        <Link
          to="/login"
          className="w-24 text-left text-black font-semibold border-b-[0.19rem] border-primary-500 focus:outline-none py-2"
        >
          &nbsp; Login
        </Link>
      </div>

      <form
        onSubmit={formik.handleSubmit}
        className="w-full lg:w-3/4  mb-3 flex flex-col items-start"
        autocomplete="on"
      >
        <h1 className="font-bold mb-2 text-2xl text-gray-800">
          Login to your account
        </h1>
        <p className="text-gray-500 mb-5 font-light text-sm text-left">
          Please provide your email address and password to login.
        </p>

        <div className="mt-1 w-full">
          <Input
            label="Email Address or Enrollment Number"
            id="username"
            dimension="lg"
            defaultValue={signUpInfo?.email}
            variant={formik.errors.username ? "danger" : "primary"}
            {...formik.getFieldProps("username")}
            type="text"
            placeholder={"smith@gmail.com or SCN000000"}
            autoComplete="username"
            required
            error={formik.touched.username ? formik.errors.username : undefined}
          />
        </div>

        <div className="mt-5 mb-5 w-full relative">
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
            autoComplete="password"
            required
            error={formik.touched.password ? formik.errors.password : undefined}
          />
        </div>
        <div className="mt-2 mb-2 w-full">
          <Button
            type="submit"
            dimension="lg"
            variant="primary"
            isLoading={isLoading || verifyCenterRequest.isLoading}
            // disabled={!(formik.isValid && formik.dirty)}
          >
            Login
          </Button>
        </div>

        <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
          <Link to="/passwordreset" className="text-primary-500 cursor-pointer">
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
};
export default Login;
