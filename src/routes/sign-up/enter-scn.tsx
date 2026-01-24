import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import LoginStepBar from "@/components/ui/login-step-bar";
import LoginStepCheck from "@/components/ui/login-step-check";
import { findSCNApi } from "@/api/auth";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import PageLoader from "@/components/ui/page-loader";
import Support from "@/components/ui/support";
import PageTitle from "@/components/ui/page-title";

interface IEnterSCNProps {
  onNext: (scn: string, userData: any) => void;
  activatePage: (page: string) => void;
}

const EnterSCN: FunctionalComponent<IEnterSCNProps> = ({
  onNext,
  activatePage,
}) => {
  const [scn, setSCN] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signUpStepArray = [
    { name: "Enter SCN", state: true },
    { name: "Register", state: false },
    { name: "Verify Email", state: false },
    { name: "Create Password", state: false },
  ];

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!scn || scn.trim().length < 3) {
      NotifyError("Please enter a valid SCN");
      return;
    }

    setIsLoading(true);
    try {
      const [response, error] = await findSCNApi({ scn: scn.trim() });

      if (error) {
        NotifyError(error?.data?.message || error?.message || "SCN not found");
        setIsLoading(false);
        return;
      }

      NotifySuccess("SCN found! Please proceed to register.");
      onNext(scn.trim(), response);
    } catch (err: any) {
      NotifyError(err?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-w-full min-h-screen p-4 lg:px-[10%] lg:pt-[10%] 2xl:px-[15%] flex flex-col justify-center lg:justify-start items-start">
      <PageTitle title="Sign Up" />

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
          Create your account
        </h1>

        <p className="text-gray-500 mb-5 font-light text-sm text-left">
          Let's help you create your account and get access to your NBA portal.
          Please enter your SCN (Supreme Court Number) to begin.
        </p>

        <div className="mt-5 mb-5 w-full">
          <Input
            label="SCN (Supreme Court Number)"
            id="scn"
            dimension="lg"
            variant="primary"
            value={scn}
            placeholder="Enter your SCN (e.g., SCN/123456)"
            type="text"
            autoComplete="off"
            onChange={(e) => setSCN((e.target as HTMLInputElement).value)}
            rightSlot={() => {
              return isLoading ? <PageLoader isOutlined={isLoading} /> : <></>;
            }}
          />
        </div>

        <div className="mt-5 w-full">
          <Button
            type="submit"
            dimension="lg"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || !scn}
          >
            Next
          </Button>
        </div>
      </form>

      <Support />
    </div>
  );
};

export default EnterSCN;
