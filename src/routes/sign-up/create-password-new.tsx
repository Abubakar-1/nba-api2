import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import LoginStepBar from "@/components/ui/login-step-bar";
import LoginStepCheck from "@/components/ui/login-step-check";
import { updateRegistrationPasswordApi } from "@/api/auth";
import { IRegistrationCompleteResponse } from "@/api/interfaces/auth";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Support from "@/components/ui/support";
import PageTitle from "@/components/ui/page-title";
import AuthContext from "@/context/auth-context";

interface ICreatePasswordNewProps {
  email: string;
  onBack: () => void;
  activatePage: (page: string) => void;
}

const CreatePasswordNew: FunctionalComponent<ICreatePasswordNewProps> = ({
  email,
  onBack,
  activatePage,
}) => {
  const navigate = useNavigate();
  const { login } = AuthContext.useContainer();
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  const signUpStepArray = [
    { name: "Enter SCN", state: true },
    { name: "Register", state: true },
    { name: "Verify Email", state: true },
    { name: "Create Password", state: true },
  ];

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*]/.test(pwd)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return null;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      NotifyError(passwordError);
      return;
    }

    if (password !== retypePassword) {
      NotifyError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const [response, error] = await updateRegistrationPasswordApi({
        email,
        password,
        retypePassword,
      });

      if (error) {
        NotifyError(
          error?.data?.message ||
            error?.message ||
            error?.message[0] ||
            "Failed to create password",
        );
        setIsLoading(false);
        return;
      }

      const authResponse = response as IRegistrationCompleteResponse;

      // Log the user in automatically
      if (authResponse?.accessToken) {
        await login(authResponse);
        NotifySuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        NotifySuccess(
          "Account created successfully! Please login to continue.",
        );
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err: any) {
      NotifyError(err?.message || "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-w-full min-h-screen p-4 lg:px-[10%] lg:pt-[10%] 2xl:px-[15%] flex flex-col justify-center lg:justify-start items-start">
      <PageTitle title="Sign Up - Create Password" />

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
          Create your password
        </h1>

        <p className="text-gray-500 mb-5 font-light text-sm text-left">
          Almost done! Create a strong password to secure your account.
        </p>

        <div className="w-full space-y-4">
          {/* Password */}
          <div className="w-full">
            <Input
              label="Password"
              id="password"
              dimension="lg"
              variant="primary"
              value={password}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              onChange={(e) =>
                setPassword((e.target as HTMLInputElement).value)
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-primary-500 mt-1"
            >
              {showPassword ? "Hide" : "Show"} password
            </button>
          </div>

          {/* Retype Password */}
          <div className="w-full">
            <Input
              label="Confirm Password"
              id="retypePassword"
              dimension="lg"
              variant="primary"
              value={retypePassword}
              placeholder="Re-enter your password"
              type={showRetypePassword ? "text" : "password"}
              onChange={(e) =>
                setRetypePassword((e.target as HTMLInputElement).value)
              }
            />
            <button
              type="button"
              onClick={() => setShowRetypePassword(!showRetypePassword)}
              className="text-xs text-primary-500 mt-1"
            >
              {showRetypePassword ? "Hide" : "Show"} password
            </button>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Password must contain:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className={password.length >= 8 ? "text-green-600" : ""}>
                • At least 8 characters
              </li>
              <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                • One uppercase letter
              </li>
              <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                • One lowercase letter
              </li>
              <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>
                • One number
              </li>
              <li
                className={/[!@#$%^&*]/.test(password) ? "text-green-600" : ""}
              >
                • One special character (!@#$%^&*)
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-7 w-full flex gap-4">
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
            disabled={isLoading || !password || !retypePassword}
            className="flex-1  bg-primary-500 p-4 text-white rounded-full"
          >
            Complete Registration
          </Button>
        </div>
      </form>

      <Support />
    </div>
  );
};

export default CreatePasswordNew;
