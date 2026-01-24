import { FunctionalComponent } from "preact";
import { useMemo, memo, useState } from "preact/compat";
import AuthContext from "@/context/auth-context";
import {
  BanknotesIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { getBranchDashboard } from "@/api/branch";
import LineChartOne from "@/components/chart/line-chart";
import BarChart from "@/components/chart/bar-chart";
import ConferenceWomanIcon from "@/assets/icons/conference-woman-icon";
import HandMoneyIcon from "@/assets/icons/hand-money-icon";
import Button from "@/components/ui/button";

const BranchAdminDashboardHome: FunctionalComponent = () => {
  const { user } = AuthContext.useContainer();
  const [showBanner, setShowBanner] = useState(true);
  const [currentYear, setCurrentYear] = useState(
    new Date().getFullYear().toString()
  );

  // Memoize fetch params to prevent infinite render loop
  const fetchParams = useMemo(
    () => ({ year: currentYear, branchName: user?.branch || "" }),
    [currentYear, user?.branch]
  );

  // Fetch dashboard data
  const dashboardRequest = useFetcher<any, any>(
    getBranchDashboard,
    fetchParams
  );

  const dashboardData = useMemo(() => {
    return dashboardRequest.response || {};
  }, [dashboardRequest.response]);

  console.log("dashboardData", dashboardData);

  // Chart data from API or defaults
  const { chartValues, chartNames } = useMemo(() => {
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

    if (dashboardData?.transactionsSummary) {
      const sortedMonthData = dashboardData.transactionsSummary.sort(
        (a: any, b: any) =>
          monthsOrder.indexOf(a.month.toLowerCase()) -
          monthsOrder.indexOf(b.month.toLowerCase())
      );

      return {
        chartValues: sortedMonthData.map((data: any) => data.totalAmount),
        chartNames: sortedMonthData.map((data: any) => data.month),
      };
    }

    return {
      chartValues: [
        400000000, 350000000, 780000000, 100000000, 50000000, 30000000,
        20000000, 10000000, 15000000, 10000000, 8000000, 5000000,
      ],
      chartNames: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    };
  }, [dashboardData]);

  // Gender data
  const genderData = useMemo(() => {
    return {
      male: dashboardData?.genderDistribution?.male || 0,
      female: dashboardData?.genderDistribution?.female || 0,
    };
  }, [dashboardData]);

  const isLoading = dashboardRequest.isLoading;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
            Loading...
          </div>
        )}
      </div>

      {/* NBA Conference Countdown Banner */}
      {showBanner && (
        <div className="lg:h-52 w-full bg-primary-500 rounded-xl flex flex-col lg:flex-row gap-20 justify-between lg:items-end px-10 relative">
          <XMarkIcon
            className="w-5 h-5 lg:w-6 lg:h-6 text-white font-bold cursor-pointer absolute top-6 right-3 lg:top-4 lg:right-5"
            onClick={() => setShowBanner(false)}
          />
          <div className="text-white h-full flex flex-col justify-center lg:items-start items-center gap-7">
            <div className="">
              <h1 className="font-extrabold text-xl lg:text-2xl mb-2 mt-5 lg:mt-0">
                NBA Conference Countdown
              </h1>
              <p className="text-sm">
                Be an early bird, be the first to secure a seat in this annual
                conference you don't want to miss
              </p>
            </div>
            <div className="w-full lg:w-60">
              <Button type="button" variant="white" dimension="lg">
                <HandMoneyIcon />{" "}
                <p className="pl-3 font-semibold">Dashboard</p>
              </Button>
            </div>
          </div>
          <ConferenceWomanIcon />
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Branch Dues */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BanknotesIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Branch Dues</p>
              <p className="text-xl font-bold text-gray-900">
                {(
                  dashboardData?.totalBranchDues?.totalAmount || 0
                ).toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {(
                  dashboardData?.totalBranchDues?.totalPayments || 0
                ).toLocaleString()}{" "}
                Payments
              </p>
            </div>
          </div>
        </div>

        {/* Branch Members */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserGroupIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Branch Members</p>
              <p className="text-xl font-bold text-gray-900">
                {(
                  dashboardData?.branchMembers?.totalMembers || 0
                ).toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {(
                  dashboardData?.branchMembers?.totalPayments || 0
                ).toLocaleString()}{" "}
                Payments
              </p>
            </div>
          </div>
        </div>

        {/* Branch Name */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BuildingOfficeIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Branch Name</p>
              <p className="text-xl font-bold text-gray-900">
                {dashboardData?.branchInfo?.branchName ||
                  user?.branch_name ||
                  ""}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {dashboardData?.branchInfo?.location ||
                  user?.branch_address ||
                  ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Stats Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-gray-900 font-semibold mb-5">User</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="border-r border-gray-100 pr-4 last:border-r-0">
            <p className="text-gray-500 text-xs mb-2">Total Users</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: "80%" }}
              ></div>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {(
                dashboardData?.userCategories?.totalUsers || 0
              ).toLocaleString()}
            </p>
          </div>

          {/* SAN */}
          <div className="border-r border-gray-100 pr-4 last:border-r-0">
            <p className="text-gray-500 text-xs mb-2">SAN</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div
                className="bg-[#01BEBD] h-1.5 rounded-full"
                style={{ width: "40%" }}
              ></div>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {(dashboardData?.userCategories?.san || 0).toLocaleString()}
            </p>
          </div>

          {/* Benchers */}
          <div className="border-r border-gray-100 pr-4 last:border-r-0">
            <p className="text-gray-500 text-xs mb-2">BENCHERS</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div
                className="bg-[#F1CD00] h-1.5 rounded-full"
                style={{ width: "25%" }}
              ></div>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {(dashboardData?.userCategories?.benchers || 0).toLocaleString()}
            </p>
          </div>

          {/* Legal Practitioner */}
          <div>
            <p className="text-gray-500 text-xs mb-2">LEGAL PRACTITIONER</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div
                className="bg-[#5A2391] h-1.5 rounded-full"
                style={{ width: "60%" }}
              ></div>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {(
                dashboardData?.userCategories?.legalPractitioners || 0
              ).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Transaction Summary Chart */}
        <div className="w-full lg:w-3/5 border rounded-lg p-4 lg:p-5">
          <div className="w-full flex flex-row justify-between items-center px-2 mb-3">
            <p className="font-bold">Transactions Summary</p>
            <div className="w-24">
              <select
                className="text-green-600 font-medium focus:outline-none ring-0"
                onChange={(e) => setCurrentYear(e.currentTarget.value)}
                defaultValue={currentYear}
              >
                {Array(2)
                  .fill(0)
                  .map((_, idx) => {
                    let year = new Date().getFullYear() - idx;
                    return (
                      <option key={`y-${year}`} value={year}>
                        {year}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
          <LineChartOne chartValue={chartValues} ChartName={chartNames} />
        </div>

        {/* Gender Distribution Chart */}
        <div className="w-full lg:w-2/5 rounded-lg p-4 lg:p-5">
          <div className="w-full flex flex-row justify-start items-start px-2 mb-3">
            <p className="font-bold">Gender distribution</p>
          </div>
          <BarChart femaleVal={genderData.female} maleVale={genderData.male} />
        </div>
      </div>
    </div>
  );
};

export default memo(BranchAdminDashboardHome);
