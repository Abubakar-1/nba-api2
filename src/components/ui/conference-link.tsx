import ConferenceCircleIcon from "@/assets/icons/conference-circle-icon";
import { useNavigate } from "react-router-dom";
import Button from "./button";

const ConferenceLink = () => {
  const navigate = useNavigate();
  return (
    <div className="hidden lg:block relative z-[70]">
      <div className="fixed left-2 bottom-5 lg:bottom-16 lg:left-[1.1rem] w-fit">
        <div className="w-full flex flex-col justify-center items-center">
          <ConferenceCircleIcon />
          <h4 className="text-gray-900 font-medium mt-3">NBA Conference</h4>
          <p className="text-gray-500 text-sm mb-4">
            Be the first to secure a spot.
          </p>
          <Button
            variant="primary"
            dimension="xl"
            onClick={() => navigate("/reg/conference")}
          >
            <p className="font-semibold px-16">Register</p>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ConferenceLink;
