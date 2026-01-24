import { FunctionalComponent } from "preact";
import { useState, useCallback, useRef, useEffect, memo } from "preact/compat";
import { useNavigate } from "react-router-dom";
import AuthContext from "@/context/auth-context";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

interface Props {
  userName?: string;
  userInitial?: string;
  userScn?: string;
  setIsSupportModalOpen?: (value: boolean) => void;
}

const BranchAdminProfileDropdown: FunctionalComponent<Props> = ({
  userName = "John Doe",
  userInitial = "J",
  userScn = "SCN2400000",
  setIsSupportModalOpen,
}) => {
  const navigate = useNavigate();
  const { logout } = AuthContext.useContainer();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleBranchProfile = useCallback(() => {
    setIsOpen(false);
    navigate("/branch/admin/profile");
  }, [navigate]);

  const handleContactSupport = useCallback(() => {
    setIsOpen(false);
    if (setIsSupportModalOpen) {
      setIsSupportModalOpen(true);
    }
  }, [setIsSupportModalOpen]);

  const handleLogout = useCallback(() => {
    setIsOpen(false);
    logout();
    navigate("/login");
  }, [logout, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
          {userInitial}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                {userInitial}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {userName}
                </p>
                <p className="text-xs text-gray-500">{userScn}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Branch Profile */}
            <button
              onClick={handleBranchProfile}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <UserCircleIcon className="w-5 h-5 text-gray-500" />
              <span>Branch Profile</span>
            </button>

            {/* Contact Support */}
            <button
              onClick={handleContactSupport}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <PhoneIcon className="w-5 h-5 text-gray-500" />
              <span>Contact Support</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-gray-200"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(BranchAdminProfileDropdown);
