import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
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

interface IVerifyBio {
  onClick: any;
  activatePage: any;
  previousPage: any;
}

const VerifyBio: FunctionalComponent<IVerifyBio> = ({
  onClick,
  activatePage,
  previousPage,
}) => {
  const { signUpInfo } = AuthContext.useContainer();
  const [agreed, setAgreed] = useState<boolean>(false);

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
      state: false,
    },
    {
      name: "Verify Account",
      state: false,
    },
    {
      name: "Create Password",
      state: false,
    },
  ];

  return (
    <div className="min-w-full min-h-screen p-4 lg:px-[10%] lg:pt-[10%] 2xl:px-[15%] flex flex-col justify-center lg:justify-start items-start">
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
        <div className="w-full lg:w-4/6  mb-3 flex flex-col items-start">
          <h1 className="font-bold mb-2 text-2xl text-gray-800">
            Lets confirm your details
          </h1>
          <p className="text-gray-500 mb-5 font-light text-sm text-left">
            Please double check in the information below and continue
          </p>

          <div className="mt-5 mb-5 w-full">
            <div className=" grid grid-cols-3 border-y-[1px] py-4 border-gray-300 w-full">
              <p className=" text-gray-500">Enrollment number</p>
              <p className="text-black font-semibold col-span-2">
                {signUpInfo?.scn}
              </p>
            </div>
            <div className=" grid grid-cols-3 border-b-[1px] py-4 border-gray-300 w-full">
              <p className=" text-gray-500">Full name</p>
              <p className="text-black font-semibold col-span-2">
                {signUpInfo?.last_name +
                  " " +
                  signUpInfo?.first_name +
                  " " +
                  signUpInfo?.middle_name}
              </p>
            </div>
            <div className=" grid grid-cols-3 border-b-[1px] py-4 border-gray-300 w-full">
              <p className=" text-gray-500">Year of Call</p>
              <p className="text-black font-semibold col-span-2">
                {signUpInfo?.year_of_call}
              </p>
            </div>
          </div>
          <div className="mt-5 mb-5 w-full flex">
            <Checkbox
              dimension="md"
              variant="primary"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
            ></Checkbox>
            <p className="text-gray-500 text-xs -mt-1">
              By ticking this box, I confirm that the information I have
              provided is both accurate and mine. I acknowledge that any errors
              or inaccuracies in the information provided are my responsibility
              and may have consequences in the future..
            </p>
          </div>

          <div className="mt-5 w-full">
            <Button
              type="button"
              dimension="lg"
              variant="primary"
              onClick={() => onClick()}
              disabled={!agreed}
            >
              Next
            </Button>
          </div>

          <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
            <button
              type="button"
              onClick={() => previousPage()}
              className="text-primary-500"
            >
              Back
            </button>
          </div>
        </div>
      </>
    </div>
  );
};
export default VerifyBio;
