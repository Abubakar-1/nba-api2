import { FunctionalComponent } from "preact";
import { useState, useCallback, memo } from "preact/compat";
import { slide as Menu } from "react-burger-menu";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid";
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import AuthContext from "@/context/auth-context";

interface MenuItem {
  name: string;
  path: string;
  icon: any;
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/branch/admin/home", icon: HomeIcon },
  { name: "Members", path: "/branch/admin/members", icon: UsersIcon },
  {
    name: "Transactions",
    path: "/branch/admin/transactions",
    icon: BriefcaseIcon,
  },
  {
    name: "Branch Profile",
    path: "/branch/admin/profile",
    icon: BuildingOfficeIcon,
  },
  { name: "Settings", path: "/branch/admin/settings", icon: Cog6ToothIcon },
];

interface Props {
  isOpen: boolean;
  handleIsOpen: () => void;
  handleStateChange: (state: any) => void;
}

const BranchAdminMobileMenu: FunctionalComponent<Props> = ({
  isOpen,
  handleIsOpen,
  handleStateChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = AuthContext.useContainer();

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
      handleIsOpen();
    },
    [navigate, handleIsOpen]
  );

  return (
    <div className="lg:hidden">
      {/* Hamburger Button */}
      <button
        onClick={handleIsOpen}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-6 h-6 text-gray-700" />
      </button>

      {/* Slide Menu */}
      <Menu
        right
        isOpen={isOpen}
        onStateChange={handleStateChange}
        customBurgerIcon={false}
        customCrossIcon={false}
        className="w-full"
        width={"280px"}
      >
        <div className="relative min-h-screen pt-6 px-6 text-gray-200 font-medium bg-[#009009]">
          {/* Close Button */}
          <button
            onClick={handleIsOpen}
            className="absolute top-4 right-4 p-2 text-white hover:bg-green-700 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* User Info */}
          <div className="mb-7 pl-1 pt-8">
            <h4 className="text-lg text-white">
              {user?.last_name + " " + user?.first_name}
            </h4>
            <p className="text-xs text-green-200 font-semibold">Branch Admin</p>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col justify-start items-start gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-green-700 text-white"
                      : "text-green-100 hover:bg-green-700/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}

            {/* Divider */}
            <div className="w-full border-t border-green-600 my-4"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-green-100 hover:bg-green-700/50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </Menu>
    </div>
  );
};

export default memo(BranchAdminMobileMenu);
