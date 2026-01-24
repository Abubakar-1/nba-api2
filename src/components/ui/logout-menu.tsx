import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import VerifyNINIcon from "@/assets/icons/verify-nin-icon";
import { Modal } from "./modal";
import Button from "./button";
import Input from "./input";
import { useFormik } from "formik";
import { NotifyError } from "../toast/toast";
import { useRequest } from "../hooks/use-request";
import { getNIN, verifyNIN } from "@/api/profile";
import VerifySuccessIcon from "@/assets/icons/verify-success-icon";
import VerifiedCheckIcon from "@/assets/icons/verified-check-icon";
import { useFetcher } from "../hooks/use-fetcher";
import { IVNINStatusResponse } from "@/api/interfaces/profile";
import { BtnLoader } from "./loader";

interface LogoutMenuProps {
  username: any;
  logout: () => void;
}

export const LogoutMenu = ({ username, logout }: LogoutMenuProps) => {
  const [successModal, setSuccessModal] = useState(false);
  const [verificationId, setVerificationId] = useState("");

  const [verifyState, setVerifyState] = useState({
    initial: false,
    verify: false,
    complete: false,
  });

  const handleAddModalClose = () => {
    // setVerifyNINModal((prev) => !prev);
    setVerifyState((prev) => ({
      ...prev,
      initial: false,
      verify: false,
      complete: false,
    }));
  };
  const handleAddModalOpen = () => {
    setVerifyState((prev) => ({
      ...prev,
      initial: true,
      verify: false,
      complete: false,
    }));
  };
  const { response, isLoading, makeRequest } = useFetcher<
    any,
    IVNINStatusResponse
  >(getNIN);

  const verifyNINRequest = useRequest<{ id: string }>(verifyNIN);

  async function submit(body: { id: string }) {
    const [response, _err] = await verifyNINRequest.makeRequest(body);
    if (!_err) {
      handleAddModalClose();
      setVerificationId(response?.nba_id);
      setSuccessModal(true);
      verifyFormik.resetForm();
      makeRequest();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  const verifyFormik = useFormik({
    initialValues: { id: "" },
    onSubmit(values) {
      submit(values);
    },
    validationSchema: null,
  });

  return (
    <>
      <Modal
        dimensions="lg"
        isOpen={verifyState.initial}
        showCloseIcon={verifyState.initial}
        onClose={handleAddModalClose}
      >
        {verifyState.initial && (
          <div>
            <h1 className="font-bold text-lg lg:text-xl">
              How to Generate VNIN using USSD Code
            </h1>
            <ul className="pl-4 mt-7 font-medium text-sm list-disc list-outside">
              <li className="mb-3">Dial *346*3*Enter Your NIN*471335#</li>
              <li className="">
                You'll get an SMS on your registered phone containing the
                virtual NIN.
              </li>
              <li className="">
                Select "proceed," then input the VNIN on the subsequent page and
                submit
              </li>
            </ul>
            <div className="mt-7 w-full">
              <Button
                type="button"
                dimension="lg"
                variant="primary"
                onClick={() =>
                  setVerifyState((prev) => ({
                    ...prev,
                    initial: false,
                    verify: true,
                    complete: false,
                  }))
                }
              >
                Proceed
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={verifyState.verify}
        showCloseIcon={verifyState.verify}
        onClose={handleAddModalClose}
      >
        <form onSubmit={verifyFormik.handleSubmit}>
          <h1 className="font-bold text-lg lg:text-2xl">Enter your NIN</h1>
          <div className="mt-5 w-full">
            <Input
              {...verifyFormik.getFieldProps("id")}
              label="NIN"
              placeholder="Enter NIN"
              type="text"
              variant="primary"
              dimension="lg"
            />
          </div>
          <div className="mt-7 w-full">
            <Button
              type="submit"
              dimension="lg"
              variant="primary"
              isLoading={verifyNINRequest.isLoading}
              disabled={!(verifyFormik.isValid && verifyFormik.dirty)}
            >
              Submit
            </Button>
          </div>
          <div className="mt-3 w-full">
            <Button
              variant="primary"
              dimension="lg"
              type="button"
              className="w-full block text-lg text-center font-medium text-gray-700"
              onClick={() => handleAddModalClose()}
            >
              cancel
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={successModal}
        showCloseIcon={successModal}
        onClose={() => setSuccessModal(false)}
      >
        <div className="flex flex-col justify-center items-center w-full">
          <VerifySuccessIcon />
          <h1 className="font-semibold text-lg lg:text-xl mt-7">
            NIN sent successfully
          </h1>
          <p className="text-gray-600 mt-4 text-sm">
            Hello! your profile verification been sent successfully. Your
            {/* verification ID is{" "} */}
            {/* <span className="font-semibold text-black">{verificationId}</span>. */}
          </p>
        </div>
        <div className="w-full mt-7">
          <Button
            type="button"
            variant="primary"
            dimension="lg"
            onClick={() => {
              setSuccessModal(false);
              setVerificationId("");
            }}
          >
            Close
          </Button>
        </div>
      </Modal>
      <Menu>
        <div className="flex items-center py-2">
          {!isLoading && response ? (
            response.is_verified ? (
              <div className="hidden lg:flex p-3 rounded text-green-700 justify-center items-center w-44 mr-8 gap-3 bg-green-50">
                <p className="text-xs font-bold">{response?.nba_id}</p>
                <VerifiedCheckIcon />
              </div>
            ) : (
              // <div className="hidden lg:flex p-3 rounded text-green-700 justify-center items-center w-44 mr-8 gap-3 "></div>
              <div
                role="button"
                onClick={handleAddModalOpen}
                className="hidden lg:flex p-3 rounded text-[#B45309] justify-center items-center w-44 mr-8 gap-3 bg-[#FFFBEB]"
              >
                <VerifyNINIcon />{" "}
                <p className="text-xs font-bold">Verify NIN</p>
              </div>
              // <div
              //   role="button"
              //   onClick={handleAddModalOpen}
              //   className="hidden lg:flex p-3 rounded text-[#B45309] justify-center items-center w-44 mr-8 gap-3 "
              // ></div>
            )
          ) : (
            <div
              role="button"
              className="hidden lg:flex p-3 rounded text-[#B45309] justify-center items-center w-44 mr-8 gap-3 "
            ></div>
          )}

          {/* {!isLoading && !response ? (
            <div
              role="button"
              onClick={handleAddModalOpen}
              className="hidden lg:flex p-3 rounded text-[#B45309] justify-center items-center w-44 mr-8 gap-3 bg-[#FFFBEB]"
            >
              <VerifyNINIcon /> <p className="text-xs font-bold">Verify NIN</p>
            </div>
          ) : (
            <div className="hidden lg:flex p-3 rounded text-green-700 justify-center items-center w-44 mr-8 gap-3 bg-green-50">
              <p className="text-xs font-bold">{response?.nba_id}</p>
              <VerifiedCheckIcon />
            </div>
          )} */}

          <UserCircleIcon className="rounded-full h-16 w-16 text-gray-400 lg:-mr-16 " />
          <Menu.Button className="flex items-center justify-end w-full font-medium text-gray-600 rounded hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            <p className="text-xs lg:text-sm 2xl:text-lg">
              {username?.first_name + " " + username?.last_name}
            </p>
            <span className="ml-3">
              <svg
                width="12"
                height="7"
                viewBox="0 0 12 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.25 0.75L6 6L0.75 0.75"
                  stroke="#333333"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className=" absolute top-10 right-0 w-52 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }: any) => (
                  <button
                    className={`${
                      active
                        ? "hover:bg-primary-500 hover:text-white"
                        : "text-gray-900"
                    } flex gap-2 rounded items-center w-full px-2 py-2 text-sm`}
                    onClick={() => logout()}
                  >
                    {active ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                        />
                      </svg>
                    )}
                    Log out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
};
