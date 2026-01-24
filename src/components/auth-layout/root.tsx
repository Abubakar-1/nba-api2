import AuthContext from "@/context/auth-context";
import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { Outlet } from "react-router-dom";
import ConferenceLink from "../ui/conference-link";
import UserSupport from "../ui/user-support";
import Header from "./header";
import Sidebar from "./sidebar";
const Root = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const { user, conferenceStatus } = AuthContext.useContainer();
  return (
    <Fragment>
      <Header
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        setIsSupportModalOpen={setIsSupportModalOpen}
      />
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className="flex-1 bg-white pt-28 overflow-y-scroll min-h-screen lg:px-5">
        <Outlet />
        {!(
          (user?.roles || []).includes("SUPER_ADMIN") ||
          (user?.roles || []).includes("ADMIN")
        ) && (
          <UserSupport
            isSupportModalOpen={isSupportModalOpen}
            setIsOpenModal={setIsSupportModalOpen}
          />
        )}
        {
          !(
            (user?.roles || []).includes("SUPER_ADMIN") ||
            (user?.roles || []).includes("ADMIN")
          )
        }
        {/*  && !conferenceStatus?.entry?.is_paid && <ConferenceLink />} */}
      </div>
    </Fragment>
  );
};

export default Root;
