// import man from "@/assets/svg/man.svg";
import press from "@/assets/svg/frontpress.svg";
import logo from "@/assets/svg/logo.svg";

import {
  ChatBubbleBottomCenterIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
const LoginSplitScreen = () => {
  return (
    <div className="hidden lg:block  text-white bg-primary-100 lg:bg-primary-100 min-h-full w-3/5">
      <div className="h-screen pt-[18%] pb-[50px] flex flex-col justify-between items-center ">
        <img loading="eager" src={logo} className="w-[250px]" />
        <img src={press} className="h-[400.55px]" />
        <h4 className="text-2xl font-bold text-black text-center">
          NBA Annual General Conference 2026 <br />{" "}
          <span className="font-normal">Are you ready?</span> Port Harcourt
          <span className="font-normal"> is waiting!</span>
        </h4>
      </div>
    </div>
  );
};

export default LoginSplitScreen;
