import { getAdminDashboard } from "@/api/dashboard";
import { IAdminDashboard, IDashboardProps } from "@/api/interfaces/dashboard";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { useAdminDashboardQuery } from "@/components/hooks/use-dashboard-query";
import { logger } from "@/utils/logger";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import { useFormik } from "formik";
import { useState } from "preact/hooks";
import { memo } from "preact/compat";
import AdminDashboardComponent from "../components/dashboard/admin-dashboard";

const AdminDashboard = memo(() => {
  const [currentYear, setCurrentYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const requestParams = useFormik({
    initialValues: {
      year: currentYear,
    },
    onSubmit(values, formikHelpers) { },
  });

  // React Query hook for admin dashboard
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useAdminDashboardQuery(currentYear);

  // Map response to match old structure
  const response = dashboardData;

  return (
    <div className="px-4 mb-5">
      <PageTitle title="Admin Dashboard" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">Dashboard</h1>

      {isLoading && (
        <div className="w-full h-64 flex justify-center items-center">
          <PageLoader isOutlined={true} />
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg my-4 flex flex-col items-center">
          <p className="font-medium mb-2">Failed to load admin dashboard</p>
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
        <AdminDashboardComponent
          adminDashboardDetails={dashboardData}
          currentYear={currentYear}
          setCurrentYear={setCurrentYear}
        />
      )}

      {!isLoading && !error && !dashboardData && (
        <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-lg">
          No admin data available for {currentYear}.
        </div>
      )}
    </div>
  );
});

export default AdminDashboard;
