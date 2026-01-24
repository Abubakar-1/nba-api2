import { getAdminVerifiedNINDetails } from "@/api/lawyers";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError } from "@/components/toast/toast";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import Button from "@/components/ui/button";
import { UserCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useParams, useNavigate } from "react-router-dom";

const VerifiedLawyerDetail: FunctionalComponent = () => {
  const { nbaId } = useParams<{ nbaId: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>();
  const viewDetailsRequest = useRequest(getAdminVerifiedNINDetails);

  const getDetails = async () => {
    if (!nbaId) {
      NotifyError("NBA ID is required");
      navigate("/verifiedlawyers");
      return;
    }

    const [response, _err] = await viewDetailsRequest.makeRequest({
      id: nbaId,
    });
    if (!_err) {
      setDetails(response);
    } else if (_err && _err?.data) {
      NotifyError(
        _err?.data?.message || _err?.data?.info || "Failed to fetch details"
      );
      return;
    } else {
      NotifyError(_err?.info || "Failed to fetch details");
      return;
    }
  };

  useEffect(() => {
    getDetails();
  }, [nbaId]);

  return (
    <div className="px-4 mb-5">
      <PageTitle title="Verified Lawyer Details" />

      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mt-7 mb-6">
        <button
          onClick={() => navigate("/verifiedlawyers")}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-bold text-xl lg:text-2xl">
          Verified Lawyer Details
        </h1>
      </div>

      {viewDetailsRequest.isLoading ? (
        <div className="w-full h-96 flex justify-center items-center">
          <PageLoader isOutlined={viewDetailsRequest.isLoading} />
        </div>
      ) : details ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
          {/* Profile Picture */}
          <div className="flex justify-center items-center mb-8 py-4">
            {details.image ? (
              <img
                src={details.image}
                className="h-40 w-40 rounded-full object-cover border-4 border-primary-100"
                alt="Profile"
              />
            ) : (
              <UserCircleIcon className="text-gray-300 h-40 w-40 rounded-full" />
            )}
          </div>

          {/* NBA Information */}
          <div className="mb-8">
            <h2 className="font-bold text-lg mb-4 text-primary-500 border-b pb-2">
              NBA Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">NBA ID</p>
                <p className="text-sm font-semibold text-gray-900">
                  {details.nba_id || "N/A"}
                </p>
              </div>

              <div className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Full Name (NBA)</p>
                <p className="text-sm font-semibold text-gray-900">
                  {details.fullname || "N/A"}
                </p>
              </div>

              <div className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">
                  Enrollment Number (SCN)
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {details.scn || "N/A"}
                </p>
              </div>

              <div className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Year of Call</p>
                <p className="text-sm font-semibold text-gray-900">
                  {details.year_of_call || "N/A"}
                </p>
              </div>

              <div className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Created At</p>
                <p className="text-sm font-semibold text-gray-900">
                  {details.created_at
                    ? new Date(details.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Government/NIN Information */}
          <div className="mb-8">
            <h2 className="font-bold text-lg mb-4 text-primary-500 border-b pb-2">
              Government/NIN Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Full Name (Govt)</p>
                <p className="text-sm font-semibold text-gray-900">
                  {details.govt_name ||
                    `${details.g_lname || ""} ${details.g_fname || ""} ${
                      details.g_mname || ""
                    }`.trim() ||
                    "N/A"}
                </p>
              </div>

              <div className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Phone (Govt)</p>
                <p className="text-sm font-semibold text-gray-900">
                  {details.g_phone || "N/A"}
                </p>
              </div>

              <div className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">
                  Date of Birth (Govt)
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {details.g_dob || "N/A"}
                </p>
              </div>

              <div className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Gender</p>
                <p className="text-sm font-semibold text-gray-900">
                  {details.gender || "N/A"}
                </p>
              </div>

              <div className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">VNIN</p>
                <p className="text-sm font-semibold text-gray-900">
                  {details.vnin || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          {details.address && (
            <div className="mb-6">
              <h2 className="font-bold text-lg mb-4 text-primary-500 border-b pb-2">
                Address
              </h2>
              <p className="text-sm text-gray-900">{details.address}</p>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 flex justify-end">
            <Button
              variant="outline"
              dimension="lg"
              onClick={() => navigate("/verifiedlawyers")}
            >
              Back to List
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No details found</p>
          <Button
            variant="primary"
            dimension="lg"
            onClick={() => navigate("/verifiedlawyers")}
            className="mt-4"
          >
            Back to List
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerifiedLawyerDetail;
