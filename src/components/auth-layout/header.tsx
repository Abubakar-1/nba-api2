import AuthContext from "@/context/auth-context";
import { Fragment } from "preact";
import { logoutApi } from "@/api/auth";
import { useRequest } from "../hooks/use-request";
import logoCircle from "@/assets/images/nba_logo.png";
import { LogoutMenu } from "../ui/logout-menu";
import Hambugger from "./hambuger";
import { useEffect, useState } from "preact/hooks";
import {
  ArrowLeftIcon,
  Bars3CenterLeftIcon,
  BellIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { Modal } from "../ui/modal";
import Button from "../ui/button";
import { getNIN, verifyNIN } from "@/api/profile";
import { IVNINStatusResponse } from "@/api/interfaces/profile";
import { useFetcher } from "../hooks/use-fetcher";
import { NotifyError } from "../toast/toast";
import { useFormik } from "formik";
import Input from "../ui/input";
import VerifySuccessIcon from "@/assets/icons/verify-success-icon";
import VerifiedCheckIcon from "@/assets/icons/verified-check-icon";
import VerifyNINIcon from "@/assets/icons/verify-nin-icon";
import { Link, useLocation } from "react-router-dom";
import NotificationDropdown from "../ui/notification-dropdown";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/api/react-query-notifications";

interface Props {
  sidebarOpen: boolean;
  toggleSidebar: any;
  setIsSupportModalOpen: (value: boolean) => void;
}
const Header = ({
  sidebarOpen,
  toggleSidebar,
  setIsSupportModalOpen,
}: Props) => {
  const { user, logout } = AuthContext.useContainer();

  const location = useLocation();

  const { makeRequest } = useRequest(logoutApi);
  const [show, setShow] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Notification data
  const { data: unreadCountData } = useUnreadNotificationCount();
  const { data: notificationsData, isLoading: notificationsLoading } =
    useNotifications({ page: 1, limit: 5 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const unreadCount = unreadCountData?.unread_count || 0;
  const notifications = notificationsData?.notifications || [];

  const [successModal, setSuccessModal] = useState(false);
  const [verificationId, setVerificationId] = useState("");
  const [conferenceHeader, setConferenceHeader] = useState<boolean>();

  const [verifyState, setVerifyState] = useState({
    initial: false,
    verify: false,
    complete: false,
  });

  async function logoutUser() {
    const [_, error] = await makeRequest({});

    logout();
  }

  const handleClose = () => {
    setShow(!show);
  };

  const handleStateChange = (state: any) => {
    setShow(state.isOpen);
  };

  const handleAddModalClose = () => {
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
  const {
    response,
    isLoading,
    makeRequest: VerifyNINMakeRequest,
  } = useFetcher<any, IVNINStatusResponse>(getNIN);

  console.log("nin", response);

  //verify nin request
  const verifyNINRequest = useRequest<{ nin: string }>(verifyNIN);

  //verify nin submit function
  async function submit(body: { id: string }) {
    const [response, _err] = await verifyNINRequest.makeRequest({
      nin: body.id,
    });
    if (!_err) {
      handleAddModalClose();
      setVerificationId(response?.nba_id);
      setSuccessModal(true);
      verifyFormik.resetForm();
      VerifyNINMakeRequest();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  //verify nin formik
  const verifyFormik = useFormik({
    initialValues: { id: "" },
    onSubmit(values) {
      submit(values);
    },
    validationSchema: null,
  });

  useEffect(() => {
    location.pathname.split("/")[1].toLocaleLowerCase() === "reg" &&
    location.pathname.split("/")[2].toLocaleLowerCase() === "conference"
      ? setConferenceHeader(true)
      : setConferenceHeader(false);
  }, [location.pathname.split("/")[1]]);

  console.log("conference header");

  return (
    <header className="fixed flex bg-white h-20 items-center z-[60] justify-between top-0 py-3 left-0 px-0 pr-8 w-full border-b border-gray-200">
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
            Hello! your profile verification been sent successfully.
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
      <div className="flex w-full lg:w-fit items-center gap-6">
        <div className="block lg:hidden">
          <Hambugger
            isOpen={show}
            handleIsOpen={() => handleClose()}
            handleStateChange={handleStateChange}
          />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 lg:bg-primary-500 lg:px-6 lg:py-3 lg:w-[17rem] w-full">
          <img src={logoCircle} className="w-15 h-10 lg:w-12 lg:h-12" />
          {!conferenceHeader && (
            <p className="font-bold text-white text-base hidden lg:block">
              NIGERIAN BAR <br /> ASSOCIATION
            </p>
          )}
        </div>

        {/* Greeting - Desktop only */}
        {!conferenceHeader && (
          <div className="hidden lg:block ml-6">
            <p className="text-gray-700 text-sm">
              Hello,{" "}
              <span className="font-semibold text-gray-900">
                {user.first_name || "User"}
              </span>
              !
            </p>
          </div>
        )}

        {/* verify nin */}
        {!conferenceHeader ? (
          <>
            <div className="w-full flex justify-end lg:hidden">
              {!isLoading && response ? (
                response.verified ? (
                  <div className="flex lg:hidden p-3 rounded text-green-700 justify-center items-center w-32 mr-5 md:mr-10 gap-3 bg-green-50">
                    <p className="text-xs font-bold">{response?.nba_id}</p>
                    <VerifiedCheckIcon />
                  </div>
                ) : (
                  <div
                    role="button"
                    onClick={handleAddModalOpen}
                    className="flex lg:hidden p-3 rounded text-[#B45309] justify-center items-center w-32 mr-5 md:mr-10 gap-3 bg-[#FFFBEB]"
                  >
                    <VerifyNINIcon />{" "}
                    <p className="text-xs font-bold">Verify NIN</p>
                  </div>
                )
              ) : (
                <div
                  role="button"
                  className="hidden lg:flex p-3 rounded text-[#B45309] justify-center items-center w-32 mr-5 md:mr-10 gap-3 "
                ></div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full ml-[4.3rem] pl-4 flex justify-center items-center">
            <div className="flex flex-col gap-2">
              <Link
                to="/dashboard"
                className="flex gap-2 justify-between text-primary-500 text-sm font-semibold items-center"
              >
                <ArrowLeftIcon className="w-5" /> <p>Back</p>
              </Link>
              <p className="font-bold text-lg">Register</p>
            </div>
          </div>
        )}
      </div>
      <div>
        <div className="block lg:hidden">
          <Bars3CenterLeftIcon
            className="block lg:hidden h-10 w-10 text-gray-500"
            onClick={() => handleClose()}
          />
        </div>
        {!conferenceHeader && (
          <div className="hidden lg:flex items-center gap-6">
            {/* Verify NIN Button */}
            {!isLoading && response && !response.verified && (
              <button
                onClick={handleAddModalOpen}
                className="flex items-center gap-2 text-[#B45309] font-semibold text-sm hover:underline"
              >
                <VerifyNINIcon />
                <span>Verify NIN</span>
              </button>
            )}
            {!isLoading && response?.verified && (
              <div className="flex items-center gap-2 px-3 py-2 rounded bg-green-50 text-green-700">
                <p className="text-xs font-bold">{response?.nba_id}</p>
                <VerifiedCheckIcon />
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <BellIcon className="w-6 h-6 text-gray-700" />
                {/* Notification Badge - only show if count > 0 AND we actually have notifications */}
                {unreadCount > 0 && notifications.some((n) => !n.is_read) && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                onMarkAllAsRead={() => markAllAsReadMutation.mutate()}
                isLoading={notificationsLoading}
              />
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2"
              >
                {/* Avatar Circle */}
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-xs">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </div>
                {/* Dropdown Arrow */}
                <ChevronDownIcon className="w-3 h-3 text-gray-500" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-14 z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                          {user.first_name?.[0]}
                          {user.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user?.scn || "SCN2400000"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>My Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsSupportModalOpen(true);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span>Contact Support</span>
                      </button>
                      <div
                        className={""}
                        style={{
                          background: "#E7FFE83B",
                          width: 280,
                          height: 46,
                        }}
                      >
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logoutUser();
                          }}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
