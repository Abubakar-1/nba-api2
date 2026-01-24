import AuthContext from "@/context/auth-context";
import { Fragment } from "preact";
import { useState } from "preact/hooks";
import logoCircle from "@/assets/images/nba_logo.png";
import { BellIcon } from "@heroicons/react/24/solid";
import NotificationDropdown from "../ui/notification-dropdown";
import BranchAdminProfileDropdown from "./branch-admin-profile-dropdown";
import BranchAdminMobileMenu from "./branch-admin-mobile-menu";

interface Props {
  sidebarOpen: boolean;
  toggleSidebar: any;
}

const BranchAdminHeader = ({ sidebarOpen, toggleSidebar }: Props) => {
  const { user } = AuthContext.useContainer();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <Fragment>
      <div className="fixed flex bg-white h-20 items-center z-[60] justify-between top-0 py-3 left-0 px-4 lg:px-8 w-full border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <div className="block lg:hidden">
            <BranchAdminMobileMenu />
          </div>

          <div className="flex items-center gap-3">
            <img
              src={logoCircle}
              className="w-10 h-10 lg:w-12 lg:h-12"
              alt="NBA Logo"
            />
            <div className="hidden sm:block">
              <h2 className="font-bold text-lg text-gray-800">NIGERIAN BAR</h2>
              <p className="text-xs text-gray-800">ASSOCIATION</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <h2 className="text-gray-600 text-sm hidden md:block">
            Hello, {user?.first_name || "John"}!
          </h2>

          {/* Notification Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <BellIcon className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            </button>
            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>

          {/* Profile Dropdown */}
          <BranchAdminProfileDropdown
            userName={`${user?.first_name || "John"} ${user?.last_name || "Doe"}
            }`}
            userInitial={user?.first_name?.[0] || "J"}
            userScn={user?.scn || "SCN2400000"}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default BranchAdminHeader;
