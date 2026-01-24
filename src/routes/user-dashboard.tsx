import { getUserDashboard } from "@/api/dashboard";
import {
  IDashboardProps,
  IDashboardResponse,
} from "@/api/interfaces/dashboard";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { useUserDashboardQuery } from "@/components/hooks/use-dashboard-query";
import { logger } from "@/utils/logger";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import { useFormik } from "formik";
import { memo } from "preact/compat";
import UserDashboardComponent from "../components/dashboard/user-dashboard";

const UserDashboard = memo(() => {
  const requestParams = useFormik({
    initialValues: {
      year: new Date().getFullYear().toString(),
    },
    onSubmit(values, formikHelpers) { },
  });

  // React Query hook for user dashboard
  const { data: dashboardData, isLoading, error } = useUserDashboardQuery();

  // Map response to match old structure
  const response = dashboardData;

  return (
    <div className="px-4 mb-5">
      <PageTitle title="User Dashboard" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">Dashboard</h1>

      {isLoading && (
        <div className="w-full h-64 flex justify-center items-center">
          <PageLoader isOutlined={true} />
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg my-4 flex flex-col items-center">
          <p className="font-medium mb-2">Failed to load dashboard data</p>
          <p className="text-sm mb-4">{(error as any)?.message || "An unexpected error occurred"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && dashboardData && (
        <UserDashboardComponent dashboardDetails={dashboardData} />
      )}

      {!isLoading && !error && !dashboardData && (
        <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-lg">
          No dashboard data available at this time.
        </div>
      )}
    </div>
  );
});

export default UserDashboard;
