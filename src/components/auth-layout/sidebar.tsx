import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/svg/logo.svg";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { UsersIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "preact/hooks";
import { Fragment } from "preact";
import PaymentIcon from "@/assets/icons/payment-icon";
import HomeIcon from "@/assets/icons/home-icon";
import TransactionIcon from "@/assets/icons/transaction-icon";
import ProfileIcon from "@/assets/icons/profile-icon";
import LawyersIcon from "@/assets/icons/lawyers-icon";
import BranchIcon from "@/assets/icons/branch-icon";
import VerifiedLawyersIcon from "@/assets/icons/verified-lawyers-icon";
import DocumentRequestIcon from "@/assets/icons/document-request-icon";
import UserManagementIcon from "@/assets/icons/user-management-icon";
import { ACCESS_ROLES } from "@/utils/constants";
import AuthContext from "@/context/auth-context";
import { logoutApi } from "@/api/auth";
import { useRequest } from "../hooks/use-request";
import { FaCircle } from "react-icons/fa";
interface SidebarNavLinkProps {
  to: string;
  children: any;
}

interface ISidebarNavLink {
  to: string;
  name: string;
  openName: string;
  children: any;
  [x: string]: any;
}

interface SidebarSubProps {
  to: string;
  children: any;
  onClick?: any;
}

const SidebarNavLink = ({ to, children, ...props }: SidebarNavLinkProps) => {
  const location = useLocation();

  return (
    <NavLink
      to={to}
      {...props}
      className={
        location.pathname.includes(to)
          ? " bg-white mx-7 px-5 rounded text-primary-500 flex items-center py-[0.9rem] font-semibold cursor-pointer"
          : "flex text-white mx-7 px-5 text-opacity-80 items-center py-[0.9rem] font-medium hover:bg-white hover:bg-opacity-10 cursor-pointer"
      }
    >
      {children}
    </NavLink>
  );
};

const SidebarBtn = ({
  name,
  openName,
  children,
  to,
  ...props
}: ISidebarNavLink) => {
  return (
    <>
      {to ? (
        <NavLink
          to={to}
          {...props}
          className={`${
            openName === name
              ? " bg-white rounded text-primary-500 font-semibold"
              : " text-white text-opacity-80 font-medium "
          } flex mx-7 px-5 cursor-pointer py-[0.9rem] items-center w-[13.5rem]`}
        >
          {children}
        </NavLink>
      ) : (
        <button
          className={`${
            openName === name
              ? " bg-white rounded text-primary-500 font-semibold"
              : " text-white text-opacity-80 font-medium "
          } flex mx-7 px-5 cursor-pointer py-[0.9rem] items-center w-[13.5rem]`}
        >
          {children}
        </button>
      )}
    </>
  );
};

const SidebarSubLink = ({ to, children, ...props }: SidebarSubProps) => {
  const sublocation = useLocation();

  return (
    <div className="relative">
      <NavLink
        to={to}
        {...props}
        className={
          sublocation.pathname.includes(to)
            ? " bg-white bg-opacity-20 mx-7 px-3 rounded text-white flex items-center py-2.5 text-[12.2px] cursor-pointer "
            : "flex text-white mx-3 px-5 text-opacity-70 items-center py-2.5 text-[12.2px] cursor-pointer"
        }
      >
        {children}
      </NavLink>
    </div>
  );
};

interface Props {
  sidebarOpen: boolean;
}

const Sidebar = ({ sidebarOpen }: Props) => {
  const sideBarLocation = useLocation();
  const [openParent, setOpenParent] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>();

  const { user, logout } = AuthContext.useContainer();
  console.log("Sidebar user.roles:", user);
  if (user?.roles && typeof ACCESS_ROLES === "object") {
    Object.entries(ACCESS_ROLES).forEach(([key, roles]) => {
      const hasAccess = roles.some((role: string) => user.roles.includes(role));
      console.log(`User has access to ${key}:`, hasAccess);
    });
  }
  const { makeRequest } = useRequest(logoutApi);

  async function logoutUser() {
    const [_, error] = await makeRequest({});
    logout();
  }

  const funcSetParentName = (name: string) => {
    if (name === openParent) {
      setOpenParent("");
    } else setOpenParent(name);
  };

  const navArrList = [
    {
      name: "Dashboard",
      icon: HomeIcon,
      link: "/dashboard",
    },
    {
      name: "Make Payment",
      icon: PaymentIcon,
      link: "/payment",
      children: [
        {
          title: "BPF Payment",
          link: "/payment/bpf",
        },
        {
          title: "Stamp & Seal",
          link: "/payment/sealandstamp",
        },
        {
          title: "Backlog",
          link: "/payment/backlog",
        },
      ],
    },
    {
      name: "Certificate & License",
      icon: PaymentIcon,
      link: "/digital-license",
      children: [
        {
          title: "Digital Licenses",
          link: "/digital-license",
        },
      ],
    },
    {
      name: "Transaction",
      icon: TransactionIcon,
      link: "/transaction",
      children: [
        {
          title: "My Transactions",
          link: "/",
        },
      ],
    },
    {
      name: "Branches",
      icon: BranchIcon,
      link: "/branch",
    },
    {
      name: "Lawyers",
      icon: LawyersIcon,
      link: "/lawyers",
    },
    {
      name: "Verified List",
      icon: VerifiedLawyersIcon,
      link: "/verifiedlawyers",
    },
    {
      name: "Profile",
      icon: ProfileIcon,
      link: "/profile",
    },
  ];
  useEffect(() => {
    const pathname = sideBarLocation.pathname;

    if (pathname.startsWith("/payment")) {
      setOpenParent("pay");
      setIsOpen(true);
    } else if (
      pathname.startsWith("/digital-license") ||
      pathname.startsWith("/certificates") ||
      pathname.startsWith("/letterofgoodstanding")
    ) {
      setOpenParent("pay2");
      setIsOpen(true);
    } else if (
      pathname.startsWith("/my/transaction") ||
      pathname.startsWith("/my/old/transaction") ||
      pathname === "/transaction"
    ) {
      setOpenParent("transaction");
      setIsOpen(true);
    } else if (pathname === "/dashboard") {
      setOpenParent("dashboard");
      setIsOpen(false);
    } else if (pathname.startsWith("/conference")) {
      setOpenParent("conference");
      setIsOpen(false);
    } else if (pathname.startsWith("/stampseal/upload")) {
      setOpenParent("upload");
      setIsOpen(false);
    } else if (pathname.startsWith("/stampseal/doc")) {
      setOpenParent("doc");
      setIsOpen(false);
    } else if (pathname.startsWith("/usermanagement")) {
      setOpenParent("usermanagement");
      setIsOpen(false);
    } else if (pathname.startsWith("/profile")) {
      setOpenParent("profile");
      setIsOpen(false);
    } else if (pathname.startsWith("/branch")) {
      setOpenParent("branch");
      setIsOpen(false);
    } else if (pathname.startsWith("/lawyers")) {
      setOpenParent("lawyers");
      setIsOpen(false);
    } else if (pathname.startsWith("/verifiedlawyers")) {
      setOpenParent("verifiedlawyers");
      setIsOpen(false);
    }
  }, [sideBarLocation.pathname]);

  return (
    <>
      <div
        id="sidebar"
        className={`h-screen hidden lg:block ${
          sidebarOpen ? "min-w-64" : "!w-20 z-40 "
        } sticky flex flex-col py-5 w-[17rem] top-0 pt-[7.7rem] left-0 bg-primary-500 ease-in duration-200 delay-75 overflow-hidden`}
      >
        <div className="flex flex-col h-full justify-between font-normal pt-2">
          <ul
            className={`static list-none flex-1 pb-4 overflow-y-auto scrollbar-hide ${
              !sidebarOpen && "list-none flex flex-col gap-1"
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div>
              <li
                className=" -mt-1 mb-1 "
                onClick={() => {
                  setIsOpen(false);
                  setOpenParent("dashboard");
                }}
              >
                <SidebarBtn
                  to="/dashboard"
                  name="dashboard"
                  openName={openParent}
                >
                  <span className="fill-current mr-6">
                    <HomeIcon className="w-6 h-6" aria-hidden="true" />
                  </span>
                  <p className="text-[13.5px] font-semibold font-['Urbanist']">
                    Dashboard
                  </p>
                </SidebarBtn>
              </li>

              {ACCESS_ROLES.branch_dashboard?.some((v) =>
                user?.roles.includes(v),
              ) && (
                <li
                  className=" -mt-1 mb-1 "
                  onClick={() => {
                    setIsOpen(false);
                    setOpenParent("branch-dashboard");
                  }}
                >
                  <SidebarBtn
                    to="/branch/admin/home"
                    name="branch-dashboard"
                    openName={openParent}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="fill-current mr-6">
                      <BranchIcon className="w-6 h-6" aria-hidden="true" />
                    </span>
                    <p className="text-[13.5px] font-semibold font-['Urbanist']">
                      Branch Dashboard
                    </p>
                  </SidebarBtn>
                </li>
              )}

              {ACCESS_ROLES.payment_menu.some((v) =>
                user.roles.includes(v),
              ) && (
                <div
                  className={`${
                    openParent === "pay" && isOpen === true
                      ? " py-2 rounded-lg mx-3"
                      : ""
                  }`}
                >
                  <li
                    className=" -mt-2 mb-3"
                    onClick={() => {
                      if (isOpen && openParent !== "pay") {
                        setOpenParent("pay");
                      } else {
                        setIsOpen(!isOpen);
                        setOpenParent("pay");
                      }
                    }}
                  >
                    <SidebarBtn to="" name="pay" openName={openParent}>
                      <span className="fill-current mr-7">
                        <PaymentIcon className="w-6 h-6" aria-hidden="true" />
                      </span>
                      <p className="text-[13.5px] font-semibold font-['Urbanist'] whitespace-nowrap">
                        Make Payment
                      </p>

                      {openParent === "pay" && isOpen === true ? (
                        <div className="w-full flex justify-end">
                          <ChevronUpIcon className="ml-5 w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-full flex justify-end">
                          <ChevronDownIcon className="ml-5 w-5 h-5" />
                        </div>
                      )}
                    </SidebarBtn>
                  </li>

                  {openParent === "pay" && isOpen === true ? (
                    <ul className="mt-3 mb-3 min-w-full">
                      {/* BPF Payment first */}
                      <li className="pl-10 text-gray-500 w-full">
                        <SidebarSubLink to="/payment/bpf">
                          <p className="text-[13px] font-medium flex items-center gap-2">
                            <span className="flex items-center justify-center w-3 h-3 rounded-full border border-white">
                              <FaCircle color="white" size={6} />
                            </span>
                            BPF Payment
                          </p>
                        </SidebarSubLink>
                      </li>

                      <li className="pl-10 text-gray-500 w-full">
                        <SidebarSubLink to="/payment/branchdues">
                          <p className="text-[13px] font-medium flex items-center gap-2">
                            <span className="flex items-center justify-center w-3 h-3 rounded-full border border-white">
                              <FaCircle color="white" size={6} />
                            </span>
                            Branch Dues
                          </p>
                        </SidebarSubLink>
                      </li>

                      <li className="pl-10 text-gray-500 w-full">
                        <SidebarSubLink to="/payment/sealandstamp">
                          <p className="text-[13px] font-medium flex items-center gap-2">
                            <span className="flex items-center justify-center w-3 h-3 rounded-full border border-white">
                              <FaCircle color="white" size={6} />
                            </span>
                            Stamp & Seal
                          </p>
                        </SidebarSubLink>
                      </li>

                      <li className="pl-10 text-gray-500 w-full">
                        <SidebarSubLink to="/payment/backlog">
                          <p className="text-[13px] font-medium flex items-center gap-2">
                            <span className="flex items-center justify-center w-3 h-3 rounded-full border border-white">
                              <FaCircle color="white" size={6} />
                            </span>
                            Backlog BPF
                          </p>
                        </SidebarSubLink>
                      </li>
                    </ul>
                  ) : null}
                </div>
              )}
              {ACCESS_ROLES.transaction.some((v) => user.roles.includes(v)) && (
                <>
                  <li
                    className=" -mt-2 mb-3"
                    onClick={() => {
                      if (isOpen && openParent !== "pay2") {
                        setOpenParent("pay2");
                      } else {
                        setIsOpen(!isOpen);
                        setOpenParent("pay2");
                      }
                    }}
                  >
                    <SidebarBtn to="" name="pay2" openName={openParent}>
                      <span className="fill-current mr-7">
                        <VerifiedLawyersIcon
                          className="w-6 h-6"
                          aria-hidden="true"
                        />
                      </span>
                      <p className="text-[13.5px] font-semibold font-['Urbanist'] whitespace-nowrap">
                        Digital Center
                      </p>

                      {openParent === "pay2" && isOpen === true ? (
                        <div className="w-full flex justify-end">
                          <ChevronUpIcon className="ml-5 w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-full flex justify-end">
                          <ChevronDownIcon className="ml-5 w-5 h-5" />
                        </div>
                      )}
                    </SidebarBtn>
                  </li>

                  {openParent === "pay2" && isOpen === true ? (
                    <ul className="mt-3 mb-3 min-w-full">
                      <li className="pl-10 text-gray-500 w-full">
                        <SidebarSubLink to="/digital-license">
                          <p className="text-[13px] font-medium flex items-center gap-2">
                            <span className="flex items-center justify-center w-3 h-3 rounded-full border border-white">
                              <FaCircle color="white" size={6} />
                            </span>
                            Digital License
                          </p>
                        </SidebarSubLink>
                      </li>

                      {/* <li className="pl-10 text-gray-500 w-full">
                        <a
                          href="https://www.nbaicle.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex text-white mx-3 px-5 text-opacity-70 items-center py-2.5 text-[12.2px] cursor-pointer"
                        >
                          <p className="text-[13px] font-medium flex items-center gap-2">
                            <span className="flex items-center justify-center w-3 h-3 rounded-full border border-white">
                              <FaCircle color="white" size={6} />
                            </span>
                            CPD Tracker
                          </p>
                        </a>
                      </li> */}

                      <li className="pl-10 text-gray-500 w-full">
                        <SidebarSubLink to="/letterofgoodstanding">
                          <p className="text-[13px] font-medium flex items-center gap-2">
                            <span className="flex items-center justify-center w-3 h-3 rounded-full border border-white">
                              <FaCircle color="white" size={6} />
                            </span>
                            Letter of Good Standing
                          </p>
                        </SidebarSubLink>
                      </li>
                    </ul>
                  ) : null}

                  <li
                    className="-mt-2"
                    onClick={() => {
                      if (isOpen && openParent !== "transaction") {
                        setOpenParent("transaction");
                      } else {
                        setIsOpen(!isOpen);
                        setOpenParent("transaction");
                      }
                    }}
                  >
                    <SidebarBtn
                      to="/transaction"
                      name="transaction"
                      openName={openParent}
                    >
                      <span className="fill-current mr-6">
                        <TransactionIcon
                          className="w-6 h-6"
                          aria-hidden="true"
                        />
                      </span>
                      <p className="text-[13.5px] font-semibold font-['Urbanist']">
                        Transactions
                      </p>
                      {openParent === "transaction" && isOpen === true ? (
                        <div className="w-full flex justify-end">
                          <ChevronUpIcon className="ml-5 w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-full flex justify-end">
                          <ChevronDownIcon className="ml-5 w-5 h-5" />
                        </div>
                      )}
                    </SidebarBtn>
                  </li>

                  {openParent === "transaction" && isOpen === true ? (
                    <ul className="mt-3 mb-3 min-w-full">
                      <li className="pl-10 text-gray-500 w-full">
                        <SidebarSubLink to="/my/transaction">
                          <p className="text-[13px] font-medium flex items-center gap-2">
                            <span className="flex items-center justify-center w-3 h-3 rounded-full border border-white">
                              <FaCircle color="white" size={6} />
                            </span>
                            My Transactions
                          </p>
                        </SidebarSubLink>
                      </li>

                      <li className="pl-10 text-gray-500 w-full">
                        <SidebarSubLink to="/my/old/transaction">
                          <p className="text-[13px] font-medium flex items-center gap-2">
                            <span className="flex items-center justify-center w-3 h-3 rounded-full border border-white">
                              <FaCircle color="white" size={6} />
                            </span>
                            Old Transactions
                          </p>
                        </SidebarSubLink>
                      </li>
                    </ul>
                  ) : null}
                </>
              )}
              {ACCESS_ROLES.branch.some((v) => user.roles.includes(v)) && (
                <li
                  className=" mt-1"
                  onClick={() => {
                    setIsOpen(false);
                    setOpenParent("branch");
                  }}
                >
                  <SidebarBtn to="/branch" name="branch" openName={openParent}>
                    <span className="fill-current mr-5">
                      <BranchIcon className="w-6 h-6" aria-hidden="true" />
                    </span>
                    <p className="text-[13.5px] font-semibold font-['Urbanist']">
                      Branches
                    </p>
                  </SidebarBtn>
                </li>
              )}
              {ACCESS_ROLES.lawyer.some((v) => user.roles.includes(v)) && (
                <li
                  className=""
                  onClick={() => {
                    setIsOpen(false);
                    setOpenParent("lawyers");
                  }}
                >
                  <SidebarBtn
                    to="/lawyers"
                    name="lawyers"
                    openName={openParent}
                  >
                    <span className="fill-current mr-7">
                      <LawyersIcon className="w-6 h-6" aria-hidden="true" />
                    </span>
                    <p className="text-[13.5px] font-semibold font-['Urbanist']">
                      Lawyers
                    </p>
                  </SidebarBtn>
                </li>
              )}
              {ACCESS_ROLES.verified_list.some((v) =>
                user.roles.includes(v),
              ) && (
                <li
                  className=""
                  onClick={() => {
                    setIsOpen(false);
                    setOpenParent("verifiedlawyers");
                  }}
                >
                  <SidebarBtn
                    to="/verifiedlawyers"
                    name="verifiedlawyers"
                    openName={openParent}
                  >
                    <span className="fill-current mr-6">
                      <VerifiedLawyersIcon
                        className="w-6 h-6"
                        aria-hidden="true"
                      />
                    </span>
                    <p className="text-[13.5px] font-semibold font-['Urbanist']">
                      Verified List
                    </p>
                  </SidebarBtn>
                </li>
              )}
              {ACCESS_ROLES.user_access.some((v) => user.roles.includes(v)) && (
                <li
                  className=""
                  onClick={() => {
                    setIsOpen(false);
                    setOpenParent("upload");
                  }}
                >
                  <SidebarBtn
                    to="/stampseal/upload"
                    name="upload"
                    openName={openParent}
                  >
                    <span className="fill-current mr-6">
                      <DocumentRequestIcon aria-hidden="true" />
                    </span>
                    <p className="text-[13.5px] font-semibold font-['Urbanist']">
                      Stamp Validation
                    </p>
                  </SidebarBtn>
                </li>
              )}
              {ACCESS_ROLES.doc_request.some((v) => user.roles.includes(v)) && (
                <li
                  className=""
                  onClick={() => {
                    setIsOpen(false);
                    setOpenParent("doc");
                  }}
                >
                  <SidebarBtn
                    to="/stampseal/doc"
                    name="doc"
                    openName={openParent}
                  >
                    <span className="fill-current mr-6">
                      <DocumentRequestIcon aria-hidden="true" />
                    </span>
                    <p className="text-[13.5px] font-semibold font-['Urbanist']">
                      Stamp Request
                    </p>
                  </SidebarBtn>
                </li>
              )}
              {ACCESS_ROLES.user_management.some((v) =>
                user.roles.includes(v),
              ) && (
                <li
                  className=""
                  onClick={() => {
                    setIsOpen(false);
                    setOpenParent("usermanagement");
                  }}
                >
                  <SidebarBtn
                    to="/usermanagement"
                    name="usermanagement"
                    openName={openParent}
                  >
                    <span className="fill-current mr-7">
                      <UserManagementIcon aria-hidden="true" />
                    </span>
                    <p className="text-[13.5px] font-semibold font-['Urbanist']">
                      User Management
                    </p>
                  </SidebarBtn>
                </li>
              )}

              {ACCESS_ROLES.conference_sidebar_access.some((v) =>
                user.roles.includes(v),
              ) && (
                <li
                  className=""
                  onClick={() => {
                    setIsOpen(false);
                    setOpenParent("conference");
                  }}
                >
                  <a
                    href="https://agc.nigerianbar.org.ng/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-opacity-80 font-medium flex mx-7 px-5 cursor-pointer py-[0.9rem] items-center w-[13.5rem]"
                  >
                    <span className="fill-current mr-7">
                      <TransactionIcon className="w-6 h-6" aria-hidden="true" />
                    </span>
                    <p className="text-[13.5px] font-semibold font-['Urbanist']">
                      Conference
                    </p>
                  </a>
                </li>
              )}

              {ACCESS_ROLES.profile.some((v) => user.roles.includes(v)) && (
                <li
                  className=""
                  onClick={() => {
                    setIsOpen(false);
                    setOpenParent("profile");
                  }}
                >
                  <SidebarBtn
                    to="/profile"
                    name="profile"
                    openName={openParent}
                  >
                    <span className="fill-current mr-7">
                      <ProfileIcon className="w-6 h-6" aria-hidden="true" />
                    </span>
                    <p className="text-[13.5px]  font-semibold font-['Urbanist']">
                      Profile
                    </p>
                  </SidebarBtn>
                </li>
              )}
            </div>

            {/* {navArrList.map((el, i) => {
              return (
                <div key={i} className="px-1 py-1">
                  {!el.children ? (
                    <li className=" -mt-2" onClick={() => setOpenParent("")}>
                      <SidebarNavLink to={el.link}>
                        <span className="fill-current mr-6">
                          {<el.icon className="w-6 h-6" aria-hidden="true" />}
                        </span>
                        {el.name}
                      </SidebarNavLink>
                    </li>
                  ) : (
                    <li
                      className=" -mt-2"
                      onClick={() =>
                        el.children
                          ? funcSetParentName(el.name)
                          : setOpenParent("")
                      }
                    >
                      <SidebarNavLink to={el.link}>
                        <div className="flex justify-between w-full">
                          <span className="fill-current mr-3">
                            {<el.icon className="w-6 h-6" aria-hidden="true" />}
                          </span>
                          {el.name}

                          {openParent === el.name ? (
                            <ChevronUpIcon className="ml-5 w-5 h-5" />
                          ) : (
                            <ChevronDownIcon className="ml-5 w-5 h-5" />
                          )}
                        </div>
                      </SidebarNavLink>
                    </li>
                  )}

                  <ul className="mt-3 mb-3 min-w-full">
                    {el.children &&
                      openParent === el.name &&
                      el.children.map((child, idx) => {
                        return (
                          <li className="pl-10 text-gray-500 w-full  -mt-2">
                            <SidebarSubLink to={child.link}>
                              {child.title}
                            </SidebarSubLink>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              );
            })} */}
          </ul>

          {/* Logout Button at Bottom */}
          <div className="pb-5">
            <button
              onClick={logoutUser}
              className="flex items-center text-white text-opacity-80 hover:text-white mx-7 px-5 py-[0.9rem] w-[13.5rem] font-medium hover:bg-white hover:bg-opacity-10 rounded transition-colors cursor-pointer"
            >
              <span className="mr-6">
                <ArrowRightOnRectangleIcon
                  className="w-6 h-6"
                  aria-hidden="true"
                />
              </span>
              <p className="text-[13.5px] font-semibold font-['Urbanist']">
                Logout
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
