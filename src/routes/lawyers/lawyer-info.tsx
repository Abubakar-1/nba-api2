import { ILawyer } from "@/api/interfaces/lawyers";
import { getAdminLawyerDetails } from "@/api/lawyers";
import { useRequest } from "@/components/hooks/use-request";
import { Fragment } from "preact";
import { NotifyError } from "@/components/toast/toast";
import { Modal } from "@/components/ui/modal";
import PageLoader from "@/components/ui/page-loader";
import { checkCategory } from "@/utils/functions/string-functions";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";

interface UploadProps {
  id: number;
  state: boolean;
  handleModalClose: any;
}
const LawyerInfo: FunctionalComponent<UploadProps> = ({
  state,
  handleModalClose,
  id = 0,
}) => {
  const [details, setDetails] = useState<ILawyer>();
  const viewLawyerRequest = useRequest<{ id: number }>(getAdminLawyerDetails);

  const getStatus = async () => {
    const payload = { id };
    const [response, _err] = await viewLawyerRequest.makeRequest(payload);
    if (!_err) {
      setDetails(response);
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  };

  useEffect(() => {
    state && getStatus();
  }, [state]);
  return (
    <>
      <>
        <Modal
          isOpen={state}
          showCloseIcon={state}
          onClose={() => handleModalClose()}
          dimensions="xl"
        >
          {viewLawyerRequest.isLoading ? (
            <div className="w-full h-full flex justify-center items-center">
              <PageLoader isOutlined={viewLawyerRequest.isLoading} />
            </div>
          ) : details ? (
            <>
              <h1 className="font-bold text-lg lg:text-2xl">Lawyer details</h1>
              <div className="flex justify-center items-center mb-3 py-4">
                {details.passport ? (
                  <img src={details.passport} className="h-40 rounded-full" />
                ) : (
                  <UserCircleIcon className="text-gray-300 h-40 rounded-full" />
                )}
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 ">Name:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {details.last_name +
                    " " +
                    details.first_name +
                    " " +
                    details.middle_name}{" "}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 ">Enrollment Number:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {details.scn}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 ">Area of practise:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {details.area_of_practice}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 ">Category:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {checkCategory(details.is_san, details.is_honorable_bencher)}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 ">Email:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {details.email}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 ">Mobile:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {details.phone}
                </p>
              </div>

              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 ">Year of Call:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {details.year_of_call}
                </p>
              </div>

              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 ">Branch:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {details.branch}
                </p>
              </div>

              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 ">State:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {details.state_name}
                </p>
              </div>

              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 ">Gender:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {details.gender?.toLocaleUpperCase() === "M"
                    ? "Male"
                    : "Female"}
                </p>
              </div>

              <div className="grid grid-cols-2 py-3 border-y-1 mb-5 border-gray-300">
                <p className="w-full text-sm pl-1 ">Address:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {details.address}
                </p>
              </div>
            </>
          ) : null}
        </Modal>
      </>
    </>
  );
};
export default LawyerInfo;
