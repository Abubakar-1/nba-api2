import { getUserConference } from "@/api/conference";
import { IMyConferenceResponse } from "@/api/interfaces/conference";
import DashboardCardIcon from "@/assets/icons/dashboard-card-icon";
import DashboardUserIcon from "@/assets/icons/dashboard-user-icon";
import EmptyConferenceHandIcon from "@/assets/icons/empty-conference-hand-icon";
import AuthContext from "@/context/auth-context";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { debounce } from "lodash";
import { useEffect, useState } from "preact/hooks";
import { Fragment } from "preact";
import { Link, useNavigate } from "react-router-dom";
import { useUserConferenceQuery } from "../hooks/use-conference-query";
import { NotifyError } from "../toast/toast";
import Button from "../ui/button";
import Input from "../ui/input";
import PageLoader from "../ui/page-loader";
import PageTitle from "../ui/page-title";
import { Pagination } from "../ui/pagination";
import {
  Table,
  TableHead,
  TableHeadItem,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
} from "../ui/table";
import { TableItemMenu } from "../ui/table-item-menu";
import ViewConferencePayment from "./view-conference-payment";
import { IProfile } from "@/api/interfaces/profile";
import { getProfile } from "@/api/profile";
import UserSupport from "../ui/user-support";

const UserConferenceDashboard = () => {
  const { conferenceStatus } = AuthContext.useContainer();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_rows: 10,
  });
  const [paginationState, setPaginationState] = useState<any>();
  const [viewModal, setViewModal] = useState(false);
  const [refNo, setRefNo] = useState<string>("");
  // const [refDetail, setRefDetails] = useState<any>();

  const [filter, setFilter] = useState({
    status: "",
    isActive: false,
    search: "",
  });

  const {
    data: response,
    isLoading,
    error,
  } = useUserConferenceQuery({
    page: pagination.page,
    // page_size: pagination.page_size,
    // search: filter.search,
  });

  console.log("response", response);

  useEffect(() => {
    if (error)
      NotifyError((error as any)?.message || "Failed to fetch conference data");
  }, [error]);

  useEffect(() => {
    if (response?.pagination) {
      if (response.pagination.total_rows !== pagination.total_rows) {
        setPagination((prev) => ({
          ...prev,
          total_rows: response.pagination.total_rows,
        }));
      }
    }
  }, [response]);

  useEffect(() => {
    setPaginationState({
      page: pagination.page,
      page_size: pagination.page_size,
      total_rows: pagination.total_rows,
      status: filter.search,
    });
  }, [
    pagination.page,
    pagination.page_size,
    pagination.total_rows,
    filter.search,
  ]);

  function changePage(p: number, s: string) {
    setPagination((v) => ({ ...v, page: p }));
    setFilter((f) => ({ ...f, status: s }));
  }

  function changeSize(s: number) {
    setPagination((v) => ({ ...v, page_size: s, page: 1 }));
  }

  function searchTransaction(searchValue: string) {
    setFilter((f) => ({ ...f, search: searchValue }));
  }
  const handleKeypress = debounce((searchValue: string) => {
    searchTransaction(searchValue);
    setSearchValue(searchValue);
  }, 1000);

  const handleViewModal = (data: any) => {
    setRefNo(data.reference + data.id);
    setViewModal(!viewModal);
  };

  const handleModalState = () => {
    setViewModal(!viewModal);
  };

  // // Creating Different registration flow for early birds 1-9 years
  // const [earlyBird, setEarlyBird] = useState(false);
  // const {
  //   response: profileData,
  //   isLoading: profileLoading,
  //   makeRequest: profileMakeRequest,
  // } = useFetcher<any, IProfile>(getProfile);

  // const excludeEarlyBirdUsers2016TillDate = (profileData: any) => {
  //   if (profileData) {
  //     const { year_of_call } = profileData;

  //     // Check if the year_of_call is within the excluded range
  //     if (year_of_call >= 2016 && year_of_call <= 2025) {
  //       setEarlyBird(true);
  //     } else {
  //       setEarlyBird(false);
  //     }
  //   }
  // };

  // useEffect(() => {
  //   if (profileData) {
  //     excludeEarlyBirdUsers2016TillDate(profileData);
  //   }
  // }, [profileData]);

  // const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // const openSupportModal = () => {
  //   setIsSupportModalOpen(true); // Trigger modal to open
  // };
  return (
    <>
      <div className="px-4 mb-5 pb-10">
        <ViewConferencePayment
          state={viewModal}
          handleModalClose={handleModalState}
          refNo={refNo}
        />
        <PageTitle title="User Conference Dashboard" />
        <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">
          NBA Conference
        </h1>
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <PageLoader isOutlined={isLoading} />
          </div>
        ) : response?.items && response.items.length !== 0 ? (
          <>
            <div className="flex flex-col lg:flex-row justify-center gap-4">
              <div className="flex flex-col justify-between w-full h-full border rounded">
                <div className="flex justify-start items-center">
                  <div className="m-7 p-2 w-12 h-12 bg-[#006C9C] flex justify-center items-center rounded-lg text-white">
                    <DashboardCardIcon />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-gray-500 font-medium">Total Payment</p>
                    <h1 className="font-bold text-xl">
                      {" "}
                      ₦
                      {(response?.metrics?.total_payment ?? 0).toLocaleString()}
                    </h1>
                  </div>
                </div>
                <div className="h-12 w-full rounded-br rounded-bl text-sm font-semibold bg-[#006C9C] bg-opacity-[12%] flex justify-start items-center pl-3">
                  <p></p>
                </div>
              </div>

              <div className="flex flex-col justify-between w-full h-full border rounded">
                <div className="flex justify-start items-center">
                  <div className="m-7 p-2 w-12 h-12 bg-primary-600 opacity-70 flex justify-center items-center rounded-lg text-white">
                    <DashboardUserIcon />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-gray-500 font-medium">Total Attended</p>
                    <h1 className="font-bold text-xl">
                      {response?.metrics?.total_attended ?? 0}
                    </h1>
                  </div>
                </div>
                <div className="h-12 w-full rounded-br rounded-bl text-sm font-semibold bg-[#E5F4E6] flex justify-start items-center pl-3">
                  <p></p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 w-full lg:mt-10 lg:mb-10 my-5"></div>
            <Table>
              <TableHead textSize="xs">
                <TableHeadItem>PAYER</TableHeadItem>
                <TableHeadItem>ATTENDING</TableHeadItem>
                <TableHeadItem>CATEGORY</TableHeadItem>
                <TableHeadItem>TYPE</TableHeadItem>
                <TableHeadItem>REFERENCE</TableHeadItem>
                <TableHeadItem>AMOUNT</TableHeadItem>
                <TableHeadItem>STATUS</TableHeadItem>
                <TableHeadItem>ACTION</TableHeadItem>
              </TableHead>
              <TableBody>
                {(response?.items || []).map((el: any, idx: number) => (
                  <TableRow key={el?.id}>
                    <TableCell alignment="left">
                      <p className="text-sm text-black">
                        {el.payer_name} <br />
                      </p>
                    </TableCell>
                    <TableCell alignment="left">{el.participation}</TableCell>
                    <TableCell alignment="left">{el.category}</TableCell>
                    <TableCell alignment="left">{el.payment_rate}</TableCell>
                    <TableCell alignment="left">{el.reference}</TableCell>
                    <TableCell alignment="left">
                      ₦{(el?.amount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell alignment="left">
                      <p
                        className={`py-2 px-3 w-fit ${classNames({
                          "bg-yellow-100 text-yellow-500":
                            el?.status?.toLocaleLowerCase() === "pending",
                          "bg-green-100 text-primary-500 ":
                            el?.status?.toLocaleLowerCase() === "approved",
                        })} rounded-3xl`}
                      >
                        {el.status}
                      </p>
                    </TableCell>
                    <TableCell alignment="left">
                      <TableItemMenu>
                        <div className="px-1 py-1 ">
                          <div className="flex flex-col gap-1 items-start font-medium">
                            <button
                              type="button"
                              className="hover:bg-gray-100 text-black w-full text-left p-3"
                              onClick={() => handleViewModal(el)}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </TableItemMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter key="footer">
                <Pagination
                  state={paginationState}
                  onChange={changePage}
                  onChangeSize={changeSize}
                />
              </TableFooter>
            </Table>
          </>
        ) : (
          <div className="h-80 flex flex-col justify-center items-center gap-1 bg-white w-full p-3 border rounded shadow-md text-center ">
            <EmptyConferenceHandIcon />
            <h1 className="text-gray-700 font-bold text-xl lg:text-2xl">
              Not yet registered ? Registration is ongoing!
            </h1>
            <p className="text-gray-500 font-normal">
              To view your AGC payment login to: nbaagc.org or click the button
              below
            </p>
            <Button
              variant="primary"
              dimension="lg"
              id="payment"
              type="button"
              className="mt-5 w-full md:w-full inline-flex justify-center lg:w-full lg:max-w-[10rem] text-center px-4 sm:text-sm font-semibold focus:outline-none appearance-none text-white py-3.5 rounded-3xl border hover:cursor-pointer bg-primary-500"
              onClick={() => navigate("/reg/conference")}
            >
              Register for Conference
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
export default UserConferenceDashboard;

// /* <div className="col-span-2 w-full mb-3 lg:mb-0">
//             <Input
//               id="search"
//               dimension="lg"
//               variant="primary"
//               value={searchValue}
//               onChange={(e) => {
//                 handleKeypress(e.currentTarget.value);
//               }}
//               rightSlot={() => (
//                 <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
//               )}
//               type="text"
//               placeholder={"Search by transaction reference"}
//               className=" w-full"
//             />
//           </div> */

//  : earlyBird ? (
//           <div className="bg-[#dddee16f] rounded-lg mx-auto px-[25px] py-[40px] w-full md:w-[40rem] shadow-lg mt-[50px]">
//             <h1 className="text-gray-700 font-bold text-xl lg:text-2xl text-center">
//               Early bird payment (#40,000)
//             </h1>
//             <p className="text-gray-500 font-normal text-center mt-[5px]">
//               Note: Include your first and last name while making the payment
//               below.{" "}
//             </p>
//             <div className="mx-auto w-[100px] mt-[30px]">
//               <Link to="https://sandbox.flutterwave.com/pay/nbaconference2025">
//                 <button className="bg-[#00900a] text-white h-[42px] w-[130px] font-bold rounded-md">
//                   Make Payment
//                 </button>
//               </Link>
//             </div>
//           </div>
//         ) : earlyBird === false ? (
//           <div className="h-80 flex flex-col justify-center items-center gap-1 bg-white w-full p-3 border rounded shadow-md text-center ">
//             <EmptyConferenceHandIcon />
//             <h1 className="text-gray-700 font-bold text-xl lg:text-2xl">
//               Not yet registered
//             </h1>
//             <p className="text-gray-500 font-normal">
//               Your registered conferences will be displayed here
//             </p>
//             <Button
//               variant="primary"
//               dimension="lg"
//               id="payment"
//               type="button"
//               className="mt-5 w-full md:w-full inline-flex justify-center lg:w-full lg:max-w-[10rem] text-center px-4 sm:text-sm font-semibold focus:outline-none appearance-none text-white py-3.5 rounded-3xl border hover:cursor-pointer bg-primary-500"
//               onClick={() => navigate("/reg/conference")}
//             >
//               Register
//             </Button>
//           </div>
//         )        {/* <h1 className="font-bold text-2xl text-center mt-[40px]">Please check back for 2025 conference registration and payment</h1> */}

// profileLoading ? (
//           <div className="w-full h-full flex justify-center items-center">
//             <PageLoader isOutlined={isLoading} />
//           </div>
//         ) :
