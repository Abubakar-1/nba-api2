import { IMyConferenceResponse } from "@/api/interfaces/conference";
import DashboardCardIcon from "@/assets/icons/dashboard-card-icon";
import DashboardUserIcon from "@/assets/icons/dashboard-user-icon";
import EmptyConferenceHandIcon from "@/assets/icons/empty-conference-hand-icon";
import AuthContext from "@/context/auth-context";
import { ACCESS_ROLES } from "@/utils/constants";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { debounce } from "lodash";
import { useState, useEffect } from "preact/hooks";
import { Fragment } from "preact";
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
import AddBulkConferencePayment from "./add-bulk-conference-payment";
import ViewConferencePayment from "./view-conference-payment";

import {
  useAdminConferenceQuery,
  useAdminConferenceMetricsQuery,
} from "@/components/hooks/use-conference-query";

const AdminConferenceDashboard = () => {
  const { user } = AuthContext.useContainer();
  const [searchValue, setSearchValue] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    // page_size: 50,
    total_rows: 10,
  });
  const [paginationState, setPaginationState] = useState<any>();
  const [viewModal, setViewModal] = useState(false);
  const [refNo, setRefNo] = useState<string>("");

  const [filter, setFilter] = useState({
    status: "",
    isActive: false,
    search: "",
  });

  const [addBulkModal, setAddBulkModal] = useState<boolean>(false);

  const {
    data: response,
    isLoading,
    error,
    refetch: makeRequest,
  } = useAdminConferenceQuery({
    page: pagination.page,
    search: filter.search,
  });
  console.log("response", response);

  const {
    data: metricsResponse,
    isLoading: metricsIsloading,
    error: metricsError,
  } = useAdminConferenceMetricsQuery();

  useEffect(() => {
    if (error)
      NotifyError(
        (error as any)?.message || "Failed to fetch admin conference data",
      );
  }, [error]);

  useEffect(() => {
    if (response?.meta) {
      setPagination((prev) => ({
        ...prev,
        total_rows: response.meta.total,
        page_size: response.meta.limit,
      }));
    }
  }, [response]);

  useEffect(() => {
    setPaginationState({
      page: pagination.page,
      // page_size: pagination.page_size,
      total_rows: pagination.total_rows,
      status: filter.search,
    });
  }, [
    pagination.page,
    // pagination.page_size,
    pagination.total_rows,
    filter.search,
  ]);

  function changePage(p: number, s: string) {
    setPagination((v) => ({ ...v, page: p }));
    setFilter((f) => ({ ...f, status: s }));
  }

  function changeSize(s: number) {
    setPagination((v) => ({ ...v, page: 1 }));
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

  const handleAddBulkModalClose = () => {
    setAddBulkModal(!addBulkModal);
  };

  return (
    <div className="px-4 mb-5 pb-10">
      <AddBulkConferencePayment
        state={addBulkModal}
        handleModalClose={handleAddBulkModalClose}
      />
      <ViewConferencePayment
        state={viewModal}
        refNo={refNo}
        handleModalClose={handleModalState}
        refresh={makeRequest}
      />
      <PageTitle title="User Conference Dashboard" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">
        NBA Conferences
      </h1>

      {isLoading ? (
        <div className="w-full h-full flex justify-center items-center">
          <PageLoader isOutlined={isLoading} />
        </div>
      ) : response?.data && response.data.length !== 0 ? (
        <>
          {user.roles[0] !== "CONFERENCE_ADMIN" && (
            <div className="flex flex-col lg:flex-row justify-center gap-4 lg:border-b-1 border-gray-100 lg:pb-10 pb-5">
              <div className="flex flex-col justify-between w-full h-full border rounded">
                <div className="flex justify-start items-center">
                  <div className="m-7 p-2 w-12 h-12 bg-[#006C9C] flex justify-center items-center rounded-lg text-white">
                    <DashboardCardIcon />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-gray-500 font-medium">Total Payment</p>
                    <h1 className="font-bold text-xl">
                      ₦
                      {(response?.metrics?.total_payment ?? 0).toLocaleString()}
                    </h1>
                  </div>
                </div>
                <div className="h-12 w-full rounded-br rounded-bl text-sm font-semibold bg-[#006C9C] bg-opacity-[12%] flex justify-start items-center pl-3">
                  <p>
                    {(response?.metrics?.total_attended ?? 0) + " Payment(s)"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between w-full h-full border rounded">
                <div className="flex justify-start items-center">
                  <div className="m-7 p-2 w-12 h-12 bg-[#00532F] opacity-70 flex justify-center items-center rounded-lg text-white">
                    <DashboardUserIcon />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-gray-500 font-medium">Lawyers</p>
                    <h1 className="font-bold text-xl">
                      ₦
                      {(
                        response?.metrics?.lawyer_payment ?? 0
                      ).toLocaleString()}
                    </h1>
                  </div>
                </div>
                <div className="h-12 w-full rounded-br rounded-bl text-sm font-semibold bg-[#E5F4E6] flex justify-start items-center pl-3">
                  <p>
                    {(response?.metrics?.lawyer_attended ?? 0) + " Payment(s)"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between w-full h-full border rounded">
                <div className="flex justify-start items-center">
                  <div className="m-7 p-2 w-12 h-12 bg-[#CA7900] bg-opacity-70 flex justify-center items-center rounded-lg text-white">
                    <DashboardCardIcon />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-gray-500 font-medium">Non Lawyers</p>
                    <h1 className="font-bold text-xl">
                      ₦
                      {(
                        response?.metrics?.non_lawyer_payment ?? 0
                      ).toLocaleString()}
                    </h1>
                  </div>
                </div>
                <div className="h-12 w-full rounded-br rounded-bl text-sm font-semibold bg-[#CA7900] bg-opacity-[12%] flex justify-start items-center pl-3">
                  <p>
                    {(response?.metrics?.non_lawyer_attended ?? 0) +
                      " Payment(s)"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between w-full h-full border rounded">
                <div className="flex justify-start items-center">
                  <div className="m-7 p-2 w-12 h-12 bg-[#892EF2] flex justify-center items-center rounded-lg text-white">
                    <DashboardCardIcon />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-gray-500 font-medium">Intl Delegates</p>
                    <h1 className="font-bold text-xl">
                      $
                      {(
                        response?.metrics?.intl_delegate_payment ?? 0
                      ).toLocaleString()}
                    </h1>
                  </div>
                </div>
                <div className="h-12 w-full rounded-br rounded-bl text-sm font-semibold bg-[#892EF2] bg-opacity-[12%] flex justify-start items-center pl-3">
                  <p>
                    {(response?.metrics?.intl_delegate_attended ?? 0) +
                      " Payment(s)"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col lg:flex-row lg:gap-5 mt-4">
            <div className="flex flex-col w-full lg:w-2/5">
              <div className=" font-bold text-xl w-full pb-1 text-left">
                Participation
              </div>
              <div className="flex w-full h-fit flex-col lg:flex-row justify-center gap-4 border-gray-100 mb-3">
                <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
                  <p className="text-sm text-gray-500"> Physical</p>
                  <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                    <div className="w-3/4 bg-[#00532F] h-1.5 rounded-lg"></div>
                  </div>
                  <h1 className="font-bold text-lg">
                    {(metricsResponse &&
                      metricsResponse?.participation_stats?.physical.toLocaleString()) ||
                      "0"}
                  </h1>
                </div>
                <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
                  <p className="text-sm text-gray-500"> Virtual</p>
                  <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                    <div className="w-3/4 bg-[#CA7900] h-1.5 rounded-lg"></div>
                  </div>
                  <h1 className="font-bold text-lg">
                    {(metricsResponse &&
                      metricsResponse?.participation_stats?.virtual.toLocaleString()) ||
                      "0"}
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full lg:w-3/5">
              <div className=" font-bold text-xl w-full  pb-1 text-left">
                Payment Rate
              </div>
              <div className="flex w-full h-fit flex-col lg:flex-row justify-center gap-4 border-gray-100 mb-3">
                <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
                  <p className="text-sm text-gray-500"> Early Bird</p>
                  <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                    <div className="w-3/4 bg-green-500 h-1.5 rounded-lg"></div>
                  </div>
                  <h1 className="font-bold text-lg">
                    {(metricsResponse &&
                      metricsResponse?.payment_rate_stats?.early_bird.toLocaleString()) ||
                      "0"}
                  </h1>
                </div>
                <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
                  <p className="text-sm text-gray-500"> Regular</p>
                  <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                    <div className="w-3/4 bg-[#892EF2] h-1.5 rounded-lg"></div>
                  </div>
                  <h1 className="font-bold text-lg">
                    {(metricsResponse &&
                      metricsResponse?.payment_rate_stats?.regular.toLocaleString()) ||
                      "0"}
                  </h1>
                </div>
                <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
                  <p className="text-sm text-gray-500"> Late Reg</p>
                  <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                    <div className="w-3/4 bg-[#00532F] h-1.5 rounded-lg"></div>
                  </div>
                  <h1 className="font-bold text-lg">
                    {(metricsResponse &&
                      metricsResponse?.payment_rate_stats?.late_registration.toLocaleString()) ||
                      "0"}
                  </h1>
                </div>
                <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
                  <p className="text-sm text-gray-500"> On Site Reg</p>
                  <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                    <div className="w-3/4 bg-[#006C9C] h-1.5 rounded-lg"></div>
                  </div>
                  <h1 className="font-bold text-lg">
                    {(metricsResponse &&
                      metricsResponse?.payment_rate_stats?.on_site_registration.toLocaleString()) ||
                      "0"}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="border-t-1 border-gray-100 font-bold text-xl w-full mt-7 pt-5 pb-1 text-left">
            Participation
          </div>
          <div className="flex w-full h-fit flex-col lg:flex-row justify-center gap-4 border-gray-100 ">
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> Physical</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-green-500 h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {metricsResponse &&
                  metricsResponse?.participation_stats?.physical}
              </h1>
            </div>
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> Virtual</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-green-500 h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {metricsResponse &&
                  metricsResponse?.participation_stats?.virtual}
              </h1>
            </div>
          </div> */}

          <div className="border-t-1 border-gray-100 font-bold text-xl w-full mt-7 pt-5 pb-1 text-left">
            Category
          </div>
          <div className="grid w-full h-fit grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 border-gray-100">
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> Legal Practitioners</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-[#006C9C] h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {(metricsResponse &&
                  metricsResponse?.category_stats?.legal_practitioner.toLocaleString()) ||
                  "0"}
              </h1>
            </div>
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> SAN</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-[#00532F] h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {(metricsResponse &&
                  metricsResponse?.category_stats?.san.toLocaleString()) ||
                  "0"}
              </h1>
            </div>
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> Benchers</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-[#CA7900] h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {(metricsResponse &&
                  metricsResponse?.category_stats?.bencher.toLocaleString()) ||
                  "0"}
              </h1>
            </div>
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> Judges</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-[#892EF2] h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {(metricsResponse &&
                  metricsResponse?.category_stats?.judge.toLocaleString()) ||
                  "0"}
              </h1>
            </div>
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> AG</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-green-500 h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {(metricsResponse &&
                  metricsResponse?.category_stats?.ag.toLocaleString()) ||
                  "0"}
              </h1>
            </div>
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> Khadi</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-[#CA7900] h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {(metricsResponse &&
                  metricsResponse?.category_stats?.khadi.toLocaleString()) ||
                  "0"}
              </h1>
            </div>
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> Non Lawyer</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-green-500 h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {(metricsResponse &&
                  metricsResponse?.category_stats?.non_lawyer.toLocaleString()) ||
                  "0"}
              </h1>
            </div>
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500">Magistrate</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-[#00532F] h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {(metricsResponse &&
                  metricsResponse?.category_stats?.magistrate.toLocaleString()) ||
                  "0"}
              </h1>
            </div>
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500">International Delegate</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-[#006C9C] h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {(metricsResponse &&
                  metricsResponse?.category_stats?.international_delegate.toLocaleString()) ||
                  "0"}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 w-full lg:mt-14 lg:mb-10 my-5">
            <div className="col-span-2 w-full mb-3 lg:mb-0">
              <Input
                id="search"
                dimension="lg"
                variant="primary"
                value={searchValue}
                onChange={(e) => {
                  handleKeypress(e.currentTarget.value);
                }}
                rightSlot={() => (
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
                )}
                type="text"
                placeholder={"Search by transaction reference"}
                className=" w-full"
              />
            </div>
            {/* filter component starts from here */}
            <div className="col-span-2 w-full mb-3 lg:mb-0">
              <div className="flex justify-center items-center w-full h-full">
                <div className=" justify-between items-center text-gray-500 w-full lg:w-2/3 h-12 hidden lg:flex"></div>
                <div className="hidden lg:block bg-yelow-300 w-1/3 h-10"></div>
              </div>
            </div>

            <div className="col-span-1 inline-flex justify-end w-full lg:mt-0 relative text-sm ">
              {ACCESS_ROLES.admin_access.some((v) =>
                user.roles.includes(v),
              ) && (
                <Button
                  variant="primary"
                  dimension="lg"
                  id="payment"
                  className="w-1/2 md:w-1/3 lg:w-full inline-flex justify-center lg:max-w-[10rem] text-center px-4 sm:text-sm font-semibold focus:outline-none appearance-none text-white py-3.5 rounded-3xl border hover:cursor-pointer bg-primary-500"
                  onClick={handleAddBulkModalClose}
                >
                  Bulk Payment <PlusIcon className="ml-2 w-5 h-5" />
                </Button>
              )}
            </div>
            <div className="inline-flex justify-end w-full lg:mt-0 relative text-sm "></div>
          </div>
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
              {(response?.data || []).map((el: any, idx: number) => (
                <TableRow key={el?.id}>
                  <TableCell alignment="left">
                    <p className="text-sm text-black">
                      {el.payer_name} <br />
                      {/* <span className="text-blue-500 text-sm">SCN387584</span> */}
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
            No registered conference
          </h1>
          <p className="text-gray-500 font-normal">
            Your registered conferences will be displayed here
          </p>
          {/* <Button
            variant="primary"
            dimension="lg"
            id="payment"
            className="mt-5 w-full md:w-full inline-flex justify-center lg:w-full lg:max-w-[10rem] text-center px-4 sm:text-sm font-semibold focus:outline-none appearance-none text-white py-3.5 rounded-3xl border hover:cursor-pointer bg-primary-500"
            // onClick={handleAddModalClose}
          >
            Register
          </Button> */}
        </div>
      )}
    </div>
  );
};
export default AdminConferenceDashboard;
