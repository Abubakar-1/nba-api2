import { IAdminDashboard } from "@/api/interfaces/dashboard";
import ConferenceWomanIcon from "@/assets/icons/conference-woman-icon";
import DashboardCardIcon from "@/assets/icons/dashboard-card-icon";
import DashboardHammerIcon from "@/assets/icons/dashboard-hammer-icon";
import HandMoneyIcon from "@/assets/icons/hand-money-icon";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { memo } from "preact/compat";
import { useCallback, useState, useMemo } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import BarChart from "../chart/bar-chart";
import LineChartOne from "../chart/line-chart";
import Button from "../ui/button";
import { Select } from "../ui/select";

interface AdminDashboardProps {
  adminDashboardDetails: IAdminDashboard;
  currentYear: string;
  setCurrentYear: any;
}
type MonthData = {
  [month: string]: number;
};

const AdminDashboard: FunctionalComponent<AdminDashboardProps> = memo(
  ({ adminDashboardDetails, currentYear, setCurrentYear }) => {
    const navigate = useNavigate();

    const getMonthOrder = useCallback((month: any) => {
      const monthsOrder = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];
      return monthsOrder.indexOf(month.toLowerCase());
    }, []);

    // Memoize expensive chart data calculations
    const { ChartVal, ChartName } = useMemo(() => {
      const summary = adminDashboardDetails?.transactionsSummary || [];

      const sortedMonthData = summary.sort(
        (a, b) =>
          getMonthOrder(a.month.toLowerCase()) -
          getMonthOrder(b.month.toLowerCase())
      );

      return {
        ChartVal: sortedMonthData.map((data) => data.amount),
        ChartName: sortedMonthData.map((data) => data.month),
      };
    }, [adminDashboardDetails?.transactionsSummary, getMonthOrder]);

    const [isNotice, setIsNotice] = useState<boolean>(true);
    const toggleNotice = useCallback(() => setIsNotice(false), []);
    const handleConferenceNav = useCallback(
      () => navigate("/conference"),
      [navigate]
    );
    return (
      <>
        <div className="pb-10">
          {isNotice && (
            <div className="mb-6 lg:h-52 w-full bg-primary-500 rounded-xl flex flex-col lg:flex-row gap-20 justify-between lg:items-end px-10 relative">
              <XMarkIcon
                className="w-5 h-5 lg:w-6 lg:h-6 text-white font-bold cursor-pointer absolute top-6 right-3 lg:top-4 lg:right-5"
                onClick={toggleNotice}
              />
              <div className="text-white h-full flex flex-col justify-center lg:items-start items-center gap-7">
                <div className="">
                  <h1 className=" font-extrabold text-xl lg:text-2xl mb-2 mt-5 lg:mt-0">
                    NBA Conference Countdown
                  </h1>
                  <p className="text-sm">
                    Be an early bird, be the first to secure a seat in this
                    annual conference you don’t want to miss
                  </p>
                </div>
                <div className="w-full lg:w-60">
                  <Button
                    type="button"
                    variant="white"
                    dimension="lg"
                    onClick={handleConferenceNav}
                  >
                    <HandMoneyIcon />{" "}
                    <p className="pl-3 font-semibold text-primary-500">
                      Conference Dashboard
                    </p>
                  </Button>
                </div>
              </div>
              <ConferenceWomanIcon />
            </div>
          )}

          <div className="flex flex-col lg:flex-row justify-center gap-4 ">
            <div className="flex flex-col justify-between w-full h-full border rounded">
              <div className="flex justify-start items-center">
                <div className="m-7 p-2 w-12 h-12 bg-primary-500 flex justify-center items-center rounded-sm text-white">
                  <DashboardCardIcon />
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-500">Total Payment</p>
                  <h1 className="font-bold text-xl">
                    {`₦${
                      adminDashboardDetails?.totalPayment?.totalAmount
                        ? adminDashboardDetails?.totalPayment?.totalAmount.toLocaleString()
                        : "0.00"
                    }`}
                  </h1>
                </div>
              </div>
              <div className="h-12 w-full rounded-br rounded-bl bg-[#E5F4E6] flex justify-start items-center pl-3">
                <p>
                  {adminDashboardDetails?.totalPayment?.totalCount
                    ? `${
                        adminDashboardDetails?.totalPayment?.totalCount.toLocaleString() +
                        " Payment"
                      }`
                    : "0 Payment"}
                </p>
              </div>
            </div>

            <div className="flex flex-col  justify-between w-full h-full border rounded">
              <div className="flex justify-start items-center">
                <div className="m-7 p-2 w-12 h-12 bg-[#01BEBD] flex justify-center items-center rounded-sm text-white">
                  <DashboardHammerIcon />
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-500">Stamp & Seal</p>
                  <h1 className="font-bold text-xl">
                    {`₦${
                      adminDashboardDetails?.stampAndSeal?.totalAmount
                        ? adminDashboardDetails?.stampAndSeal?.totalAmount.toLocaleString()
                        : "0.00"
                    }`}
                  </h1>
                </div>
              </div>
              <div className="h-12 w-full rounded-br rounded-bl bg-[#E6F9F9] flex justify-start items-center pl-3">
                <p>
                  {adminDashboardDetails?.stampAndSeal?.totalCount
                    ? `${
                        adminDashboardDetails?.stampAndSeal?.totalCount.toLocaleString() +
                        " Payment"
                      }`
                    : "0 Payment"}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between w-full h-full border rounded">
              <div className="flex justify-start items-center">
                <div className="m-7 p-2 w-12 h-12 bg-[#F1CD00] flex justify-center items-center rounded-sm text-white">
                  <DashboardCardIcon />
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-500">BPF</p>
                  <h1 className="font-bold text-xl">
                    {`₦${
                      adminDashboardDetails?.bpf?.totalAmount
                        ? adminDashboardDetails?.bpf?.totalAmount.toLocaleString()
                        : "0.00"
                    }`}
                  </h1>
                </div>
              </div>
              <div className="h-12 w-full rounded-br rounded-bl bg-[#FEFBE9] flex justify-start items-center pl-3">
                <p>
                  {adminDashboardDetails?.bpf?.totalCount
                    ? `${
                        adminDashboardDetails?.bpf?.totalCount.toLocaleString() +
                        " Payment"
                      }`
                    : "0 Payment"}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between w-full h-full border rounded">
              <div className="flex justify-start items-center">
                <div className="m-7 p-2 w-12 h-12 bg-[red] flex justify-center items-center rounded-sm text-white">
                  <DashboardCardIcon />
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-500">Branch Dues</p>
                  <h1 className="font-bold text-xl">
                    {`₦${
                      adminDashboardDetails?.branch?.totalAmount
                        ? adminDashboardDetails?.branch?.totalAmount.toLocaleString()
                        : "0.00"
                    }`}
                  </h1>
                </div>
              </div>
              <div className="h-12 w-full rounded-br rounded-bl bg-[lightcoral] flex justify-start items-center pl-3">
                <p>
                  {adminDashboardDetails?.branch?.totalCount
                    ? `${
                        adminDashboardDetails?.branch?.totalCount.toLocaleString() +
                        " Payment"
                      }`
                    : "0 Payment"}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t-1 border-gray-100 font-bold text-xl w-full mt-7 pt-5 pb-1 text-left">
            User
          </div>
          <div className="flex w-full h-fit flex-col lg:flex-row justify-center gap-4 border-b-1 border-gray-100 pb-7 mb-3">
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> Total Users</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-green-500 h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {`${
                  adminDashboardDetails?.users?.totalUsers
                    ? adminDashboardDetails?.users?.totalUsers.toLocaleString()
                    : "0"
                }`}
              </h1>
            </div>

            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> SAN</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-[#01BEBD] h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {`${
                  adminDashboardDetails?.users?.sanCount
                    ? adminDashboardDetails?.users?.sanCount.toLocaleString()
                    : "0"
                }`}
              </h1>
            </div>
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> BENCHERS</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-[#F1CD00] h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {`${
                  adminDashboardDetails?.users?.benchersCount
                    ? adminDashboardDetails?.users?.benchersCount.toLocaleString()
                    : "0"
                }`}
              </h1>
            </div>
            <div className="flex flex-col justify-center items-start gap-1.5 p-3 w-full h-full border rounded-lg">
              <p className="text-sm text-gray-500"> LEGAL PRACTITIONER</p>
              <div className="w-full bg-gray-300 h-1.5 rounded-lg">
                <div className="w-3/4 bg-[#5A2391] h-1.5 rounded-lg"></div>
              </div>
              <h1 className="font-bold text-lg">
                {`${
                  adminDashboardDetails?.users?.legalPractitionersCount
                    ? adminDashboardDetails?.users?.legalPractitionersCount.toLocaleString()
                    : "0"
                }`}
              </h1>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-5">
            <div className="w-full flex flex-col justify-end items-end min-h-full lg:w-3/5 border rounded-lg p-4 lg:p-5 ">
              <div className="w-full  flex flex-row justify-between items-center px-2 mb-3">
                <p className="font-bold ">Transactions Summary</p>
                <div className="w-24">
                  <select
                    // dimension="lg"
                    className="text-green-600 font-medium focus:outline-none ring-0"
                    onChange={(e) => setCurrentYear(e.currentTarget.value)}
                    defaultValue={currentYear}
                  >
                    {Array(2)
                      .fill(0)
                      .map((_, idx) => {
                        let year = new Date().getFullYear() - idx;
                        return (
                          <option key={`y-${year}`} className="" value={year}>
                            {year}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
              <LineChartOne chartValue={ChartVal} ChartName={ChartName} />
            </div>

            <div className="w-full flex flex-col justify-end items-end min-h-full lg:w-2/5 rounded-lg p-4 lg:p-5">
              <div className="w-full h-full flex flex-row justify-start items-start px-2 mb-3">
                <p className="font-bold ">Gender distribution</p>
              </div>
              <BarChart
                femaleVal={
                  adminDashboardDetails?.genderDistribution?.find(
                    (g) => g.gender === "F"
                  )?.count || 0
                }
                maleVale={
                  adminDashboardDetails?.genderDistribution?.find(
                    (g) => g.gender === "M"
                  )?.count || 0
                }
              />
            </div>
          </div>
        </div>
      </>
    );
  }
);

AdminDashboard.displayName = "AdminDashboard";

export default AdminDashboard;
