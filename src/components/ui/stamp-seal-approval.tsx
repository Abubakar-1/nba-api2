import {
  IApprovalProps,
  IStampSealRequest,
  IUserStampRequestDetail,
} from "@/api/interfaces/stamp-seal-request";
import StampSealApprovalIcon from "@/assets/icons/stamp-seal-approval-icon";
import { FunctionalComponent, Fragment } from "preact";
import { Modal } from "./modal";
import { NotifyError, NotifySuccess } from "../toast/toast";
import { downloadImage } from "@/utils/functions/string-functions";
import { useRequest } from "../hooks/use-request";
import {
  verifyAdminStampSealOrder,
  getAdminStampSealOrder,
  StampSealRequestAttachmentRequest,
} from "@/api/stamp-seal-request";
import { API_CONFIG } from "@/api/config";
import { useEffect, useState } from "preact/hooks";
import PageLoader from "./page-loader";
import { useFetcher } from "../hooks/use-fetcher";
interface Props {
  data: IStampSealRequest | null;
  state: boolean;
  refresh?(): void;
  toggleModal: any;
}
const StampSealApproval: FunctionalComponent<Props> = ({
  data,
  state,
  toggleModal,
  refresh,
}) => {
  const [approveStatus, setApprovalStatus] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);
  const [approvalModalIsOpen, setApprovalModalIsOpen] =
    useState<boolean>(false);
  const [viewAttachment, setViewAttachment] = useState<boolean>(false);
  const [remark, setRemark] = useState<string>("");
  const [requestAttachment, setRequestAttachment] = useState<string>("");

  const approveStampSeal = useRequest(verifyAdminStampSealOrder);
  const stampRequestAttachment = useRequest<{ id: number }>(
    StampSealRequestAttachmentRequest,
  );
  const [userStampRequestDetail, setUserStampRequestDetail] =
    useState<IUserStampRequestDetail | null>();

  // const userStampRequest = useRequest<{ id: number }>(getAdminStampSealOrder);

  // We define a local interface for the submit body to match what we pass
  async function submit(body: {
    id: number;
    remark: string;
    remark_status: string;
  }) {
    const [response, _err] = await approveStampSeal.makeRequest(body);
    if (!_err) {
      NotifySuccess("status updated successfully");
      if (refresh) refresh();
      setRemark("");
      setApprovalModalIsOpen(false);
      window.location.reload();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  // Removed getUserStampDetail as we use data prop directly

  async function getAttachment(id: number) {
    const [response, _err] = await stampRequestAttachment.makeRequest({ id });
    if (!_err) {
      setRequestAttachment(response);
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  useEffect(() => {
    if (data) {
      // @ts-ignore - casting data to match IUserStampRequestDetail as they are compatible for our needs
      setUserStampRequestDetail(data as unknown as IUserStampRequestDetail);

      if (data.attachment) {
        setRequestAttachment(data.attachment);
      } else if (data.branch_payment_payload?.payment_proof) {
        setRequestAttachment(data.branch_payment_payload.payment_proof);
      } else {
        // fallback if really needed, but user implies data is there.
        // keeping getAttachment as backup if strictly needed, but let's try direct first.
        getAttachment(data.id);
      }
    }
  }, [data]);

  return (
    <>
      <Modal
        showCloseIcon={state}
        dimensions="lg"
        isOpen={state}
        onClose={() => toggleModal()}
      >
        {false ? (
          <div className="w-full h-full flex justify-center items-center">
            <PageLoader isOutlined={true} />
          </div>
        ) : (
          <>
            <h1 className="font-bold text-lg lg:text-2xl"> Admin Approval</h1>
            <p className="text-gray-500 text-sm mt-3">
              By approving this request, lawyers stamp and seal will be made
              valid
            </p>

            <div className="pt-5 w-full text-black">
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Name:</p>
                <p className="font-medium capitalize">
                  {userStampRequestDetail?.payer_name}
                </p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Enrollment Number:</p>
                <p className="font-medium uppercase">
                  {userStampRequestDetail?.scn}
                </p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Packs:</p>
                <p className="font-medium capitalize">
                  {userStampRequestDetail?.seal_type}
                </p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Type:</p>
                <p className="font-medium capitalize">
                  {userStampRequestDetail?.request_type}
                </p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Branch:</p>
                <p className="font-medium capitalize">
                  {userStampRequestDetail?.branch}
                </p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Amount:</p>
                <p className="font-medium capitalize">
                  &#8358;{userStampRequestDetail?.amount.toLocaleString()}
                </p>
              </div>
              {/* <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Has Paid BPF:</p>
                <p className="font-medium capitalize">
                  {userStampRequestDetail?.hasPaidBPF ? "Yes" : "No"}
                </p>
              </div> */}
              {/* <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Payment Date:</p>
                <p className="font-medium capitalize">
                  {userStampRequestDetail?.attachment_date.toLocaleString()}
                </p>
              </div> */}
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Application Date:</p>
                <p className="font-medium capitalize">
                  {userStampRequestDetail?.created_at.toLocaleString()}
                </p>
              </div>
              <div className="py-2.5 w-full text-sm flex justify-between items-center border-b-[1px] border-b-gray-200">
                <p className="font-light">Free Stamp And Seal Eligibility:</p>
                <p className="font-medium capitalize">
                  {userStampRequestDetail?.free ? "Yes" : "No"}
                </p>
              </div>
              <div className="py-2.5 w-full text-sm flex flex-col justify-center items-start">
                <p className="pb-2.5">File</p>
                <div className="p-3 w-full flex justify-between items-start bg-blue-600 bg-opacity-10 rounded">
                  <div className=" flex items-center gap-3 text-gray-500">
                    <StampSealApprovalIcon /> <p>attachment</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const extension = requestAttachment.startsWith("data:")
                          ? (requestAttachment.split("/")[1]?.split(";")[0] ??
                            "jpg")
                          : "jpg";
                        downloadImage(
                          requestAttachment,
                          extension,
                          data?.recipient + " attachment",
                        );
                      }}
                      type="button"
                      className="text-blue-500 font-bold"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => setViewAttachment(true)}
                      type="button"
                      className="text-blue-500 font-bold"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="p-3 mt-7 bg-primary-500 inline-flex items-center justify-center text-white w-full rounded-3xl"
                onClick={() => {
                  toggleModal();
                  setApprovalStatus("APPROVED");
                  setRemark("APPROVED");
                  setApprovalModalIsOpen(true);
                }}
              >
                Approve
              </button>
              <button
                type="button"
                className="p-3 mt-3 inline-flex items-center justify-center text-black font-bold w-full rounded-3xl"
                onClick={() => {
                  toggleModal();
                  setApprovalStatus("REJECTED");
                  setRemark("REJECTED: UPLOAD CURRENT BRANCH DUES RECEIPT");
                  setApprovalModalIsOpen(true);
                }}
              >
                Reject
              </button>
              <div className="mt-4 w-full flex justify-center items-center text-red-500 text-sm">
                Note:
                <p className="text-black">&nbsp; This action is irreversible</p>
              </div>
            </div>
          </>
        )}
      </Modal>
      <Modal
        showCloseIcon={approvalModalIsOpen}
        dimensions="lg"
        isOpen={approvalModalIsOpen}
        onClose={() => setApprovalModalIsOpen(false)}
      >
        <>
          <h1 className="font-bold text-lg lg:text-2xl capitalize">
            {approveStatus === "APPROVED" ? "Approve " : "Reject "} request
          </h1>
          <p className="text-gray-500 text-sm mt-3">
            {approveStatus === "APPROVED"
              ? " "
              : "By rejecting this request, user will have to make another request for approval"}
          </p>
          <p className="mt-6 text-sm text-gray-600">
            Reason for{" "}
            {approveStatus === "APPROVED" ? "approving " : "Rejecting"}
          </p>
          <textarea
            className="w-full h-40 my-3 border p-1 text-sm"
            onChange={(e) => setRemark(e.currentTarget.value)}
            defaultValue={remark}
          ></textarea>
          <button
            type="button"
            className="p-3 mt-3 bg-primary-500 inline-flex items-center justify-center text-white w-full rounded-3xl disabled:cursor-not-allowed disabled:bg-opacity-90"
            disabled={approveStampSeal.isLoading}
            onClick={() => {
              approveStatus === "APPROVED"
                ? submit({
                    id: data?.id!,
                    remark: remark,
                    remark_status: "APPROVED",
                  })
                : approveStatus === "REJECTED" && remark
                  ? submit({
                      id: data?.id!,
                      remark: remark,
                      remark_status: "REJECTED",
                    })
                  : NotifyError("Remark cannot be empty!");
            }}
          >
            {approveStampSeal.isLoading ? "Loading..." : "Confirm"}
          </button>
          <button
            type="button"
            className="p-3 mt-3 inline-flex items-center justify-center text-black font-bold w-full rounded-3xl"
            disabled={approveStampSeal.isLoading}
            onClick={() => {
              toggleModal();
              setApprovalModalIsOpen(false);
            }}
          >
            Back
          </button>
          <div className="mt-4 w-full flex justify-center items-center text-red-500 text-sm">
            Note:
            <p className="text-black">
              &nbsp; An email will be sent to this Lawyer with the reason
              stated.
            </p>
          </div>
        </>
      </Modal>
      <Modal
        showCloseIcon={viewAttachment}
        dimensions="screen"
        isOpen={viewAttachment}
        onClose={() => {
          setViewAttachment(false);
        }}
      >
        {stampRequestAttachment.isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <PageLoader isOutlined={stampRequestAttachment.isLoading} />
          </div>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <img src={requestAttachment} alt="attachment" loading="lazy" />
          </div>
        )}
      </Modal>
    </>
  );
};
export default StampSealApproval;
