import { useState } from "preact/hooks";
import { slide as Menu } from "react-burger-menu";
import { Link } from "react-router-dom";
import { FunctionComponent } from "preact";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import PaymentIcon from "@/assets/icons/payment-icon";
import HomeIcon from "@/assets/icons/home-icon";
import TransactionIcon from "@/assets/icons/transaction-icon";
import ProfileIcon from "@/assets/icons/profile-icon";
import AuthContext from "@/context/auth-context";
import { useRequest } from "../hooks/use-request";
import { logoutApi } from "@/api/auth";
import LawyersIcon from "@/assets/icons/lawyers-icon";
import BranchIcon from "@/assets/icons/branch-icon";
import VerifiedLawyersIcon from "@/assets/icons/verified-lawyers-icon";
import { ACCESS_ROLES } from "@/utils/constants";
import DocumentRequestIcon from "@/assets/icons/document-request-icon";
import UserManagementIcon from "@/assets/icons/user-management-icon";

interface Props {
  isOpen: boolean;
  handleIsOpen(): void;
  handleStateChange: any;
}
const MyMenu: FunctionComponent<Props> = ({
  isOpen,
  handleIsOpen,
  handleStateChange,
}) => {
  const [openParent, setOpenParent] = useState<string | null>(null);
  const { user, logout } = AuthContext.useContainer();

  const { makeRequest } = useRequest(logoutApi);

  async function logoutUser() {
    const [_, error] = await makeRequest({});

    logout();
  }

  const funcSetParentName = (name: string) => {
    if (name === openParent) {
      setOpenParent(null);
    } else setOpenParent(name);
  };

  return (
    <div className="lg:hidden relative -ml-8">
      <div className="absolute -top-[1.7rem] -right-4 left-0 bottom-0">
        <Menu
          right
          isOpen={isOpen}
          onStateChange={handleStateChange}
          className="w-full"
        >
          <div className="relative min-h-screen pt-[4.5rem] px-6 text-gray-200 font-medium bg-primary-600">
            <div>
              <div className="mb-7 pl-1">
                <h4 className="text-lg">
                  {user?.last_name + " " + user?.first_name}
                </h4>
                <p className="text-xs text-gray-200 font-semibold">
                  {user?.scn}
                </p>
              </div>
              <div className="flex flex-col justify-start items-start">
                <li
                  className="inline-flex gap-2 -mt-2 mb-4 list-none"
                  onClick={() => {
                    setOpenParent(null);
                    handleIsOpen();
                  }}
                >
                  <HomeIcon
                    className="w-4 h-4 mr-2  hover:text-primary-600"
                    aria-hidden="true"
                  />
                  <Link to="/dashboard" className=" pl-2">
                    Dashboard
                  </Link>
                </li>

                {ACCESS_ROLES.branch_dashboard?.some((v) =>
                  user?.roles.includes(v),
                ) && (
                  <li
                    className="inline-flex gap-2 -mt-2 mb-4 list-none"
                    onClick={() => {
                      setOpenParent(null);
                      handleIsOpen();
                    }}
                  >
                    <BranchIcon
                      className="w-4 h-4 mr-2  hover:text-primary-600"
                      aria-hidden="true"
                    />
                    <Link
                      to="/branch/admin/home"
                      className=" pl-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Branch Dashboard
                    </Link>
                  </li>
                )}

                {ACCESS_ROLES.payment.some((v) => user.roles.includes(v)) && (
                  <div>
                    <li
                      className="inline-flex gap-2 pl-[0.1rem] list-none"
                      onClick={() => {
                        funcSetParentName("payment");
                      }}
                    >
                      <div className="flex items-center w-full justify-between">
                        <div className="inline-flex items-center">
                          <PaymentIcon
                            className="w-4 h-4 mr-2 text-primary-600"
                            aria-hidden="true"
                          />
                          <Link className="inline-flex pl-3 items-center">
                            <span>Payment</span>
                          </Link>
                        </div>

                        <div className="ml-2">
                          {openParent === "payment" ? (
                            <ChevronUpIcon
                              className="ml-5 w-5 h-5 mt-1"
                              onClick={() =>
                                openParent === "payment"
                                  ? setOpenParent(null)
                                  : funcSetParentName("payment")
                              }
                            />
                          ) : (
                            <ChevronDownIcon
                              className="ml-5 w-5 h-5 mt-1"
                              onClick={() =>
                                openParent === "payment"
                                  ? setOpenParent(null)
                                  : funcSetParentName("payment")
                              }
                            />
                          )}
                        </div>
                      </div>
                    </li>

                    <ul className="mt-1 mb-5 ml-3 min-w-full list-none">
                      {openParent === "payment" && (
                        <div>
                          <li className="pl-7 -mt-2 text-gray-200 w-full list-none">
                            <Link
                              to="/payment/branchdues"
                              onClick={() => {
                                handleIsOpen();
                                setOpenParent(null);
                              }}
                            >
                              <p className="pt-3 font-semibold">Branch Dues</p>
                            </Link>
                          </li>

                          <li className="pl-7 -mt-2 text-gray-200 w-full list-none">
                            <Link
                              to="/payment/bpf"
                              onClick={() => {
                                handleIsOpen();
                                setOpenParent(null);
                              }}
                            >
                              <p className="pt-3">BPF Payment</p>
                            </Link>
                          </li>

                          <li className="pl-7 -mt-2 text-gray-200 w-full list-none">
                            <Link
                              to="/payment/sealandstamp"
                              onClick={() => {
                                handleIsOpen();
                                setOpenParent(null);
                              }}
                            >
                              <p className="pt-3">Stamp & Seal</p>
                            </Link>
                          </li>

                          <li className="pl-7 -mt-2 text-gray-200 w-full list-none">
                            <Link
                              to="/payment/backlog"
                              onClick={() => {
                                handleIsOpen();
                                setOpenParent(null);
                              }}
                            >
                              <p className="pt-3">Backlog</p>
                            </Link>
                          </li>
                        </div>
                      )}
                    </ul>
                  </div>
                )}

                {ACCESS_ROLES.transaction.some((v) =>
                  user.roles.includes(v),
                ) && (
                  <div>
                    <li className="inline-flex gap-2 pl-[0.1rem] -mt-1 list-none">
                      <div className="flex items-center w-full justify-between">
                        <div className="inline-flex items-center">
                          <TransactionIcon
                            className="w-4 h-4 mr-2 text-primary-600"
                            aria-hidden="true"
                          />
                          <Link
                            to="/transaction"
                            className="inline-flex pl-2 items-center"
                            onClick={() => {
                              handleIsOpen();
                            }}
                          >
                            <span>Transactions</span>
                          </Link>
                        </div>

                        <div>
                          {openParent === "transaction" ? (
                            <ChevronUpIcon
                              className="ml-5 w-5 h-5 mt-1"
                              onClick={() =>
                                openParent === "transaction"
                                  ? setOpenParent(null)
                                  : funcSetParentName("transaction")
                              }
                            />
                          ) : (
                            <ChevronDownIcon
                              className="ml-5 w-5 h-5 mt-1"
                              onClick={() =>
                                openParent === "transaction"
                                  ? setOpenParent(null)
                                  : funcSetParentName("transaction")
                              }
                            />
                          )}
                        </div>
                      </div>
                    </li>

                    <ul className="mt-1 mb-5 ml-3 min-w-full list-none">
                      {openParent === "transaction" && (
                        <div>
                          <li className="pl-7 -mt-2 text-gray-200 w-full list-none">
                            <Link
                              to="/my/transaction"
                              onClick={() => {
                                handleIsOpen();
                                setOpenParent(null);
                              }}
                            >
                              <p className="pt-3">My Transaction</p>
                            </Link>
                          </li>
                          <li className="pl-7 -mt-1.5 text-gray-200 w-full list-none">
                            <Link
                              to="/my/old/transaction"
                              onClick={() => {
                                handleIsOpen();
                                setOpenParent(null);
                              }}
                            >
                              <p className="pt-3">Old Transaction</p>
                            </Link>
                          </li>
                        </div>
                      )}
                    </ul>
                  </div>
                )}

                {ACCESS_ROLES.transaction.some((v) =>
                  user.roles.includes(v),
                ) && (
                  <div>
                    <li
                      className="inline-flex gap-2 pl-[0.1rem] -mt-1 list-none"
                      onClick={() => {
                        funcSetParentName("digitalCenter");
                      }}
                    >
                      <div className="flex items-center w-full justify-between">
                        <div className="inline-flex items-center">
                          <VerifiedLawyersIcon
                            className="w-4 h-4 mr-2 text-primary-600"
                            aria-hidden="true"
                          />
                          <Link className="inline-flex pl-2 items-center">
                            <span>Digital Center</span>
                          </Link>
                        </div>

                        <div>
                          {openParent === "digitalCenter" ? (
                            <ChevronUpIcon
                              className="ml-5 w-5 h-5 mt-1"
                              onClick={() =>
                                openParent === "digitalCenter"
                                  ? setOpenParent(null)
                                  : funcSetParentName("digitalCenter")
                              }
                            />
                          ) : (
                            <ChevronDownIcon
                              className="ml-5 w-5 h-5 mt-1"
                              onClick={() =>
                                openParent === "digitalCenter"
                                  ? setOpenParent(null)
                                  : funcSetParentName("digitalCenter")
                              }
                            />
                          )}
                        </div>
                      </div>
                    </li>

                    <ul className="mt-1 mb-5 ml-3 min-w-full list-none">
                      {openParent === "digitalCenter" && (
                        <div>
                          <li className="pl-7 -mt-2 text-gray-200 w-full list-none">
                            <Link
                              to="/digital-license"
                              onClick={() => {
                                handleIsOpen();
                                setOpenParent(null);
                              }}
                            >
                              <p className="pt-3">Digital License</p>
                            </Link>
                          </li>

                          {/* <li className="pl-7 -mt-2 text-gray-200 w-full list-none">
                            <a
                              href="https://www.nbaicle.org"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                handleIsOpen();
                                setOpenParent(null);
                              }}
                            >
                              <p className="pt-3">CPD Tracker</p>
                            </a>
                          </li> */}

                          <li className="pl-7 -mt-2 text-gray-200 w-full list-none">
                            <Link
                              to="/letterofgoodstanding"
                              onClick={() => {
                                handleIsOpen();
                                setOpenParent(null);
                              }}
                            >
                              <p className="pt-3">Letter of Good Standing</p>
                            </Link>
                          </li>
                        </div>
                      )}
                    </ul>
                  </div>
                )}

                {ACCESS_ROLES.branch.some((v) => user.roles.includes(v)) && (
                  <div>
                    <li
                      className="inline-flex gap-2 -mt-1 mb-5 list-none"
                      onClick={() => {
                        setOpenParent(null);
                        handleIsOpen();
                      }}
                    >
                      <div className="inline-flex items-center">
                        <BranchIcon
                          className="w-4 h-4 mr-2 hover:text-primary-600"
                          aria-hidden="true"
                        />
                        <Link to="/branch" className="pl-2">
                          <span>Branches</span>
                        </Link>
                      </div>
                    </li>
                  </div>
                )}

                {ACCESS_ROLES.lawyer.some((v) => user.roles.includes(v)) && (
                  <li
                    className="inline-flex gap-2 mb-5 list-none"
                    onClick={() => {
                      setOpenParent(null);
                      handleIsOpen();
                    }}
                  >
                    <LawyersIcon
                      className="w-4 h-4 mr-2  hover:text-primary-600"
                      aria-hidden="true"
                    />
                    <Link to="/lawyers" className=" pl-4">
                      Lawyers
                    </Link>
                  </li>
                )}
                {ACCESS_ROLES.verified_list.some((v) =>
                  user.roles.includes(v),
                ) && (
                  <li
                    className="inline-flex gap-2 mb-5 list-none"
                    onClick={() => {
                      setOpenParent(null);
                      handleIsOpen();
                    }}
                  >
                    <VerifiedLawyersIcon
                      className="w-4 h-4 mr-2  hover:text-primary-600"
                      aria-hidden="true"
                    />
                    <Link to="/verifiedlawyers" className=" pl-3">
                      Verified Lawyers
                    </Link>
                  </li>
                )}
                {ACCESS_ROLES.user_access.some((v) =>
                  user.roles.includes(v),
                ) && (
                  <li
                    className="inline-flex gap-2 mb-5 list-none"
                    onClick={() => {
                      setOpenParent(null);
                      handleIsOpen();
                    }}
                  >
                    <DocumentRequestIcon aria-hidden="true" />
                    <Link to="/stampseal/upload" className=" pl-2">
                      Stamp Application
                    </Link>
                  </li>
                )}

                {ACCESS_ROLES.conference_sidebar_access.some((v) =>
                  user.roles.includes(v),
                ) && (
                  <li
                    className="inline-flex gap-2 -mt-2 mb-4 list-none"
                    onClick={() => {
                      setOpenParent(null);
                      handleIsOpen();
                    }}
                  >
                    <TransactionIcon
                      className="w-4 h-4 mr-2 text-primary-600"
                      aria-hidden="true"
                    />
                    <a
                      href="https://agc.nigerianbar.org.ng/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className=" pl-3"
                    >
                      Conference
                    </a>
                  </li>
                )}
                {ACCESS_ROLES.doc_request.some((v) =>
                  user.roles.includes(v),
                ) && (
                  <li
                    className="inline-flex gap-2 mb-5 list-none"
                    onClick={() => {
                      setOpenParent(null);
                      handleIsOpen();
                    }}
                  >
                    <DocumentRequestIcon aria-hidden="true" />
                    <Link to="/stampseal/doc" className=" pl-4">
                      Stamp Request
                    </Link>
                  </li>
                )}
                {ACCESS_ROLES.user_management.some((v) =>
                  user.roles.includes(v),
                ) && (
                  <li
                    className="inline-flex gap-2 mb-5 list-none"
                    onClick={() => {
                      setOpenParent(null);
                      handleIsOpen();
                    }}
                  >
                    <UserManagementIcon aria-hidden="true" />
                    <Link to="/usermanagement" className=" pl-4">
                      User Management
                    </Link>
                  </li>
                )}
                {ACCESS_ROLES.profile.some((v) => user.roles.includes(v)) && (
                  <li
                    className="inline-flex gap-2 mb-5 list-none"
                    onClick={() => {
                      setOpenParent(null);
                      handleIsOpen();
                    }}
                  >
                    <ProfileIcon
                      className="w-4 h-4 mr-2  hover:text-primary-600"
                      aria-hidden="true"
                    />
                    <Link to="/profile" className=" pl-4">
                      Profile
                    </Link>
                  </li>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className=" absolute bottom-14 left-7 mt-10"
            >
              Logout
            </button>
            {/* <img src={logo} className="w-10 absolute top-6 right-7" /> */}
            <div
              role="button"
              className="text-white absolute top-6 left-5"
              onClick={() => handleIsOpen()}
            >
              <XMarkIcon className="h-8 w-8 text-gray-200" />
            </div>
          </div>
        </Menu>
      </div>
    </div>
  );
};

export default MyMenu;
