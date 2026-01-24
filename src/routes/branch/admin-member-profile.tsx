import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import AuthContext from "@/context/auth-context";
import { formatCreatedAtDate } from "@/utils/functions/string-functions";

// Helper to generate avatar color based on index
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-red-500",
    "bg-green-500",
    "bg-gray-800",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

// Helper to get initials from name
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
};

const BranchAdminMemberProfile: FunctionalComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user } = AuthContext.useContainer();

  // Get member data from navigation state or fetch from API
  const [member, setMember] = useState<any>(location.state?.member || null);
  const [isLoading, setIsLoading] = useState(!location.state?.member);

  useEffect(() => {
    // If no member data in state, fetch from API
    if (!member && id) {
      setIsLoading(true);
      // TODO: Implement API call to fetch member by ID
      // For now, showing placeholder
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [id, member]);

  const handleBack = () => {
    navigate("/branch/admin/members");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Member not found</p>
        <button
          onClick={handleBack}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Back to Members
        </button>
      </div>
    );
  }

  const fullName = `${member.first_name || ""} ${
    member.last_name || ""
  }`.trim();
  const initials = getInitials(member.first_name, member.last_name);
  const avatarColor = getAvatarColor(member.first_name || "A");

  return (
    <div>
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold">Member Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header Section with Avatar */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold ${avatarColor} border-4 border-white shadow-lg`}
            >
              {initials}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">{fullName}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-green-50">
                <span className="flex items-center gap-1 text-sm">
                  <IdentificationIcon className="w-4 h-4" />
                  {member.scn || member.enrollment_number || "N/A"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member.is_active || member.enabled
                      ? "bg-green-400 text-green-900"
                      : "bg-red-400 text-red-900"
                  }`}
                >
                  {member.is_active || member.enabled ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <EnvelopeIcon className="w-5 h-5 text-green-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Email Address</p>
                <p className="text-sm font-medium text-gray-900 break-all">
                  {member.email || "Not provided"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.phone_number || member.phone || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IdentificationIcon className="w-5 h-5 text-green-600" />
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Year of Call</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.year_of_call || "Not provided"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Branch</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.branch_name || user?.branch_name || "Not provided"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Enrollment Number</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.enrollment_number || member.scn || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-green-600" />
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Date Registered</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.created_at
                    ? formatCreatedAtDate(member.created_at)
                    : "Not available"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Gender</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {member.gender || "Not provided"}
                </p>
              </div>
              {member.address && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    Address
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {member.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
              Send Message
            </button>
            <button className="flex-1 px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors">
              Edit Profile
            </button>
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchAdminMemberProfile;
