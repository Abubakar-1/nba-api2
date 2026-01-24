import { FunctionalComponent } from "preact";
import { useNavigate, useLocation } from "react-router-dom";
import { useCallback, memo } from "preact/compat";
import AuthContext from "@/context/auth-context";
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

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

const BranchAdminSidebar: FunctionalComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = AuthContext.useContainer();

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const isActive = useCallback(
    (path: string) => {
      return location.pathname === path;
    },
    [location.pathname]
  );

  return (
    <aside className="h-screen hidden lg:flex min-w-64 sticky flex-col py-5 w-[17rem] top-0 pt-[7.7rem] left-0 bg-[#009009] text-white ease-in duration-200 delay-75 overflow-hidden">
      {/* Navigation Menu */}
      <nav className="flex-1 py-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 mx-4 px-5 py-[0.9rem] rounded-lg transition-all duration-200 relative group ${
                    active ? "bg-green-700" : "hover:bg-green-700/50"
                  }`}
                  style={{ width: "calc(100% - 2rem)" }}
                >
                  <Icon
                    className={`w-6 h-6 transition-transform duration-200 ${
                      active ? "scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  <span className="font-medium text-[13.5px] font-['Urbanist']">
                    {item.name}
                  </span>
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="px-4 py-6 border-t border-green-700 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-[0.9rem] rounded-lg hover:bg-green-700 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6" />
          <span className="font-medium text-[13.5px] font-['Urbanist']">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default memo(BranchAdminSidebar);
