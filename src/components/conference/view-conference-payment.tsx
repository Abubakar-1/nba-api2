import { viewConferencePayment } from "@/api/conference";
import { IConferencePaymentDetails } from "@/api/interfaces/conference";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { FunctionalComponent, Ref } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { Fragment } from "preact";
import nbaLogo from "../../assets/images/nba_logo.png";
import { useReactToPrint } from "react-to-print";
import React from "preact/compat";
import PageLoader from "../ui/page-loader";

interface Props {
  state: boolean;
  refresh?(): void;
  handleModalClose: any;
  refNo?: string;
}
const ViewConferencePayment: FunctionalComponent<Props> = ({
  state,
  refresh,
  refNo,
  handleModalClose,
}) => {
  const [paymentInfo, setPaymentInfo] = useState<IConferencePaymentDetails>();

  const viewPaymentRequest = useRequest<{ val: string }>(viewConferencePayment);

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${paymentInfo?.payer_name}-conference-receipt`,
  });

  async function getPaymentDetails() {
    const [response, _err] = await viewPaymentRequest.makeRequest({
      val: refNo + "",
    });
    if (!_err) {
      setPaymentInfo(response);
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  useEffect(() => {
    refNo && getPaymentDetails();
  }, [refNo]);
  return (
    <>
      <Modal
        isOpen={state}
        showCloseIcon={state}
        onClose={() => handleModalClose()}
        dimensions="lg"
      >
        {viewPaymentRequest.isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <PageLoader isOutlined={viewPaymentRequest.isLoading} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-5 text-sm">
              <h1 className="col-span-2 font-bold text-lg lg:text-2xl">
                Conference details
              </h1>
              {paymentInfo?.category !== "NON_LAWYER" && (
                <div className="flex flex-col justify-center items-start gap-1">
                  <p className="text-gray-500 font-medium">Conference ID</p>
                  <p className="font-bold">
                    {paymentInfo?.branch + " - " + paymentInfo?.reg_number}
                  </p>
                </div>
              )}
              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Email</p>
                <p
                  title={paymentInfo?.payer_email}
                  className="font-bold max-w-[12rem] truncate"
                >
                  {paymentInfo?.payer_email}
                </p>
              </div>
              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Phone Number</p>
                <p className="font-bold">{paymentInfo?.phone} </p>
              </div>

              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Name</p>
                <p className="font-bold"> {paymentInfo?.payer_name}</p>
              </div>
              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Category</p>
                <p className="font-bold"> {paymentInfo?.category}</p>
              </div>

              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Enrollment Number</p>
                <p className="font-bold"> {paymentInfo?.scn}</p>
              </div>
              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Branch</p>
                <p className="font-bold"> {paymentInfo?.branch}</p>
              </div>

              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Organization</p>
                <p className="font-bold"> {paymentInfo?.organization}</p>
              </div>
              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Designation</p>
                <p className="font-bold"> {paymentInfo?.designation}</p>
              </div>

              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Payment Rate</p>
                <p className="font-bold">{paymentInfo?.payment_rate}</p>
              </div>
              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Reference</p>
                <p className="font-bold">{paymentInfo?.reference}</p>
              </div>

              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Participation</p>
                <p className="font-bold"> {paymentInfo?.participation}</p>
              </div>
              <div className="flex flex-col justify-center items-start gap-1">
                <p className="text-gray-500 font-medium">Year</p>
                <p className="font-bold"> 2025</p>
                {/* <p className="font-bold"> {paymentInfo?.year}</p> */}
              </div>

              <div className="col-span-2 mt-4">
                {paymentInfo?.paid ? (
                  <Button
                    variant="primary"
                    dimension="lg"
                    onClick={handlePrint}
                  >
                    Download slip
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    dimension="lg"
                    onClick={() => handleModalClose()}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
            <div className="hidden">
              {paymentInfo && (
                <ReceiptCard ref={componentRef} data={paymentInfo} />
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};
interface ICardProps {
  data: IConferencePaymentDetails;
}
const ReceiptCard = React.forwardRef(
  ({ data }: ICardProps, ref: Ref<HTMLDivElement> | undefined) => {
    return (
      <div
        ref={ref}
        className="w-full flex flex-col justify-center items-center mb-7"
      >
        <div className="w-[210mm] h-[297mm] flex flex-col justify-center items-start">
          <>
            <div className="w-4/6  px-10 flex flex-row justify-between items-center">
              <div className="w-full flex flex-col gap-1 items-start justify-center">
                <p className="font-semibold">Reciept</p>
                <p className="text-tiny text-gray-600">{data?.payment_date}</p>
              </div>
              <img className="h-20" src={nbaLogo} alt="logo" />
            </div>
            <div className="px-10 mt-4 mb-8 text-2xl lg:text-4xl font-bold text-primary-500">
              ₦{data?.amount.toLocaleString()}
            </div>

            <div className="px-10 w-full flex flex-col items-start justify-center mb-5">
              <p className="text-tiny text-gray-600">Payment Status</p>
              <p className="font-semibold text-primary-500">{data?.status}</p>
            </div>
            {data?.category !== "NON_LAWYER" && (
              <div className="px-10 w-full flex flex-col items-start justify-center mb-5">
                <p className="text-tiny text-gray-600">Conference ID</p>
                <p className="font-semibold uppercase">
                  {data?.branch + " - " + data?.reg_number}
                </p>
              </div>
            )}
            <div className="px-10 w-full flex flex-col items-start justify-center mb-5">
              <p className="text-tiny text-gray-600">Ref Number</p>
              <p className="font-semibold">{data?.reference}</p>
            </div>

            <div className="px-10 w-full flex flex-col items-start justify-center mb-5">
              <p className="text-tiny text-gray-600">Payer</p>
              <p className="font-semibold">{data?.payer_name}</p>
            </div>

            <div className="px-10 w-full flex flex-col items-start justify-center mb-5">
              <p className="text-tiny text-gray-600">Enrollment Number</p>
              <p className="font-semibold">{data?.scn}</p>
            </div>

            <div className="px-10 w-full flex flex-col items-start justify-center mb-5">
              <p className="text-tiny text-gray-600">Branch</p>
              <p className="font-semibold">{data?.branch}</p>
            </div>

            <div className="px-10 w-full flex flex-col items-start justify-center mb-5">
              <p className="text-tiny text-gray-600">Merchant</p>
              <p className="font-semibold">Nigerian Bar Association</p>
            </div>

            <div className="px-10 w-full flex flex-col items-start justify-center mb-10">
              <p className="text-tiny text-gray-600">Remark</p>
              <p className="font-semibold">
                {/* Nigerian Bar Association {data?.year} Annual General Conference */}
                Nigerian Bar Association 2025 Annual General Conference
              </p>
            </div>
            <div className="w-4/6 bg-primary-400 bg-opacity-5 px-10 py-16 flex flex-row justify-between items-center text-xl lg:text-2xl font-extrabold">
              <p className="">
                NBA <span className="text-primary-500">2025</span> Annual
                General Conference
              </p>
              <img
                src={`data:image/png;base64,${data?.barcode}`}
                alt="Barcode"
              />
            </div>
          </>
        </div>
        <div className="w-[210mm] h-[217mm] flex justify-end">
          <div className="w-3/5 mt-4">
            {/* second page */}
            <div className="w-full h-60 mb-8">
              <div className="flex justify-between items-start">
                <img className="h-20 pl-5" src={nbaLogo} alt="logo" />
                <div className="conference-receipt-logo"></div>
              </div>
              <p className=" pl-5 font-extrabold text-3xl mt-5 text-primary-600">
                {data?.title} <br />
                {(data?.payer_name || "").split(" ")[0]}
                <br />
                {(data?.payer_name || "").split(" ").slice(1).join(" ")}
              </p>
            </div>
            <div className="h-64 w-full bg-primary-500 flex justify-between items-end p-7">
              <img
                src={`data:image/png;base64,${data?.barcode}`}
                alt="Barcode"
              />
              {data?.category !== "NON_LAWYER" && (
                <div className="flex flex-col justify-end items-end">
                  <p className="text-tiny font-medium text-white">
                    Conference ID
                  </p>
                  <p className="font-extrabold text-xl text-white uppercase">
                    {data?.branch + " - " + data?.reg_number}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default ViewConferencePayment;
