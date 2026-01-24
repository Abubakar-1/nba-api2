import { IMyStampRequest } from "@/api/interfaces/stamp-seal-request";
import classNames from "classnames";
import { FunctionalComponent, Fragment } from "preact";
import { Modal } from "./modal";
import AuthContext from "@/context/auth-context";
interface Props {
  data: IMyStampRequest | null;
  state: boolean;
  toggleModal: any;
}
const StampSealDetails: FunctionalComponent<Props> = ({
  data,
  state,
  toggleModal,
}) => {
  const { user } = AuthContext.useContainer();
  return (
    <>
      <Modal
        showCloseIcon={state}
        dimensions="lg"
        isOpen={state}
        onClose={() => toggleModal()}
      >
        <>
          <h1 className="font-bold text-lg lg:text-2xl">
            Stamp and seal detail
          </h1>

          {data && (
            <div className="pt-5 w-full text-black">
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-medium">Name:</p>
                <p
                  title={`${user?.first_name || ""} ${
                    user?.last_name || ""
                  }`.trim()}
                  className="max-w-[15rem] truncate"
                >
                  {`${user?.first_name || ""} ${
                    user?.last_name || ""
                  }`.trim() || "N/A"}
                </p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Enrollment Number:</p>
                <p className="font-medium">{user?.scn}</p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Packs:</p>
                <p className="font-medium">{data.type || data.seal_type}</p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Type:</p>
                <p className="font-medium">{data.request_type}</p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Amount:</p>
                <p className="font-medium">
                  {data.free ? "FREE" : "₦" + data.amount.toLocaleString()}
                </p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Free stamp and seal:</p>
                <p className="font-medium">{data.free ? "Yes" : "No"}</p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Remark:</p>
                <p className="font-medium">{data.remark}</p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Status:</p>
                {/* <p className="font-medium">{data.approved}</p> */}
                <p
                  className={`py-2 px-3 w-fit ${classNames({
                    "bg-yellow-100 text-yellow-500":
                      data.remark_status.toUpperCase() === "",
                    "bg-green-100 text-primary-500 ":
                      data.remark_status.toUpperCase() === "APPROVED",
                    "bg-red-100 text-red-500 ":
                      data.remark_status.toUpperCase() === "REJECTED",
                  })} rounded-3xl uppercase`}
                >
                  {!data.remark_status ? "PENDING" : data.remark_status}
                </p>
              </div>
              <div className="w-full flex items-center justify-center mt-10">
                <button
                  type="button"
                  className="py-3 px-10  text-center text-white bg-primary-500 font-bold w-full lg:w-fit rounded-3xl"
                  onClick={() => {
                    toggleModal();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      </Modal>
    </>
  );
};
export default StampSealDetails;
