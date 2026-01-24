import { FunctionalComponent } from "preact";
import notFound from "../../assets/icons/not-found.svg";

interface IEmptyProps {
  image?: string;
  description?: string;
  message?: any;
}

const PageNotFound: FunctionalComponent<IEmptyProps> = ({
  image = notFound,
  description = "Site Under Maintenance",
  message = "updating system...",
}) => {
  return (
    <div className="w-full flex flex-col justify-center items-center rounded h-full bg-white">
      <div className="flex justify-center ">
        <img src={image} alt="not-found" className="w-40 h-40 mb-5 " />
      </div>
      <div className="flex justify-center items-center">
        <h1 className="text-gray-700 font-semibold text-base md:text-lg lg:text-2xl pb-3">
          {description}
        </h1>
      </div>
      <div className="text-center">
        <p className="px-2 md:px-32 pb-8 text-gray-600 font-normal text-sm md:text-base">
          {message}
        </p>
      </div>
    </div>
  );
};

export default PageNotFound;
