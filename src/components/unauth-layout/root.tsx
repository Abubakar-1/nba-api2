import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/solid";
import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { Outlet } from "react-router-dom";
import LoginSplitScreen from "../login/login-split-screen";
const Root = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <Fragment>
      <div className="flex lg:flex-row flex-col w-full h-screen items-center justify-start">
        <LoginSplitScreen />
        <div className="w-full  overflow-y-scroll h-full">
          <Outlet />
        </div>
      </div>
    </Fragment>
  );
};

export default Root;
