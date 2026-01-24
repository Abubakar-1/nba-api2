import { memo } from "preact/compat";
import { FunctionalComponent, h, Fragment } from "preact";
import { useCallback, useState, useMemo } from "preact/hooks";
import { Link, useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import { ArrowSmallLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import LoginStepBar from "@/components/ui/login-step-bar";
import LoginStepCheck from "@/components/ui/login-step-check";
import AuthContext from "@/context/auth-context";
import { useRequest } from "@/components/hooks/use-request";
import { ISignUp } from "@/api/interfaces/auth";
import { verifySignUpSCNApi } from "@/api/auth";
import { NotifyError, NotifyWarning } from "@/components/toast/toast";
import PageLoader from "@/components/ui/page-loader";
import Support from "@/components/ui/support";
import PageTitle from "@/components/ui/page-title";

interface ISignUpAccount {
  onClick: () => void;
  // activatePage is called with a step name (string) in this file
  activatePage: (page: string) => void;
}

const SignUpAccount: FunctionalComponent<ISignUpAccount> = memo(
  ({ onClick, activatePage }) => {
    const { setSignUpInfo, signUpInfo } = AuthContext.useContainer();
    const { isLoading, makeRequest, error } = useRequest<{ scn: string }>(
      verifySignUpSCNApi
    );
    const [userInfo, setUserInfo] = useState<ISignUp>();
    const [scnSearchInfo, setScnSearchInfo] = useState<ISignUp[]>();
    const [scnValue, setScnValue] = useState<string>();
    const [selected, setSelected] = useState<boolean>();

    const [resetSignUpState, setResetSignUpState] = useState({
      signUp: true,
      confirm: false,
      update: false,
      verify: false,
      createPassword: false,
      email: "",
    });

    async function verifyUser(scn: string) {
      const [response, _err] = await makeRequest({
        scn: scn,
      });
      if (!_err) {
        setScnSearchInfo(response);
      } else if (_err && _err?.data) {
        NotifyError(_err?.data?.info);
        return;
      } else {
        NotifyError(_err?.info);
        return;
      }
    }

    const handleSearch = useCallback(
      debounce((e: string) => {
        e.length > 2 && verifyUser(e);
      }, 500),
      []
    );

    const handleChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value.replace(/\s+/g, "");
      setScnValue(value);
      handleSearch(value);
      setSelected(false);
    };

    const handleNextPage = async (user: ISignUp | undefined) => {
      try {
        await setSignUpInfo(user);
        onClick();
      } catch (error) {}
    };

    const handleOnboarding = (e: any, el: ISignUp | undefined) => {
      if (el && el.has_onboarded) {
        NotifyWarning(
          "Onboarding process has been completed, please proceed to log in"
        );
      } else if (!selected) {
        NotifyError("Please click on your profile before proceeding.");
      } else handleNextPage(el);
      e.preventDefault();
    };

    const signUpStepArray = useMemo(
      () => [
        {
          name: "SCN & Year",
          state: true,
        },
        {
          name: "Verify Bio",
          state: false,
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
      ],
      []
    );

    const handleSelect = useCallback((el: ISignUp) => {
      setUserInfo(el);
      setScnSearchInfo([el]);
      setScnValue(el.scn);
      setSelected(true);
    }, []);
    return (
      <div className="min-w-full min-h-screen p-4 lg:px-[10%] lg:pt-[10%] 2xl:px-[15%] flex flex-col justify-center lg:justify-start items-start">
        <PageTitle title="Sign Up" />
        <div className="h-fit w-full flex justify-evenly items-center mb-10 lg:-ml-4">
          {signUpStepArray.map((el, id) => {
            return (
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
            // onSubmit={formik.handleSubmit}
            className="w-full lg:w-3/4  mb-3 flex flex-col items-start"
          >
            <h1 className="font-bold mb-2 text-2xl text-gray-800">
              Create your account
            </h1>

            <p className="text-red-600 font-semibold animate-pulse mb-3">
              New Wigs, Please Signup using your exam number e.g EXM000111
            </p>

            <p className="text-gray-500 mb-5 font-light text-sm text-left">
              Let's help you create your account and get access to your NBA
              portal.
            </p>

            <div className="mt-5 mb-5 w-full">
              <div className="mt-5 mb-5 w-full">
                <Input
                  label="Enrollment Number"
                  id="center"
                  dimension="lg"
                  variant="primary"
                  value={scnValue}
                  placeholder="Enter Enrollment Number"
                  type="text"
                  autoComplete="SCN-Number"
                  onChange={handleChange}
                  rightSlot={() => {
                    return isLoading ? (
                      <PageLoader isOutlined={isLoading} />
                    ) : (
                      <></>
                    );
                  }}
                />
              </div>

              {scnSearchInfo &&
                scnSearchInfo?.length > 0 &&
                scnSearchInfo.map((el: ISignUp, idx: number) => (
                  <div
                    key={el.scn ?? idx}
                    className="flex gap-5 mb-3 w-full border-b-[1px]"
                  >
                    <button
                      className=" border-gray-300 pb-3 text-xs text-left lg:text-sm text-gray-500 hover:text-primary-500 w-full"
                      onClick={(e) => {
                        handleSelect(el);
                        e.preventDefault();
                      }}
                    >
                      {el.last_name + " " + el.first_name + " - " + el.scn}
                    </button>
                    {selected ? (
                      <CheckCircleIcon className="w-5 h-5 text-primary-500 " />
                    ) : (
                      <ArrowSmallLeftIcon className="w-5 h-5 text-gray-400 " />
                    )}
                  </div>
                ))}
            </div>

            <div className="mt-5 w-full">
              <Button
                type="submit"
                dimension="lg"
                variant="primary"
                onClick={(e) => handleOnboarding(e, userInfo)}
                // disabled={!selected}
              >
                Next
              </Button>
            </div>
          </form>
        </>
        <Support />
      </div>
    );
  }
);

export default SignUpAccount;
