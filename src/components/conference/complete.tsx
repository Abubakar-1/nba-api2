import { IConferencePaymentDetails } from "@/api/interfaces/conference";
import ConferenceSlipIcon from "@/assets/icons/conference-slip-icon";
import { CheckBadgeIcon, CheckIcon } from "@heroicons/react/24/solid";
import { FunctionalComponent, Ref } from "preact";
import { Fragment } from "preact";
import { Link } from "react-router-dom";
import Button from "../ui/button";
import nbaLogo from "../../assets/images/nba_logo.png";
import React, { useRef } from "preact/compat";
import { useReactToPrint } from "react-to-print";

interface Props {
  paymentInfo: IConferencePaymentDetails | undefined;
}
const Complete: FunctionalComponent<Props> = ({ paymentInfo }) => {
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${paymentInfo?.payer_name}-conference-receipt`,
  });
  return (
    <>
      <div className="w-full min-h-screen lg:border-l lg:px-10 ">
        <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-5">
          Payment Details
        </h1>
        <div className="w-full min-h-screen pt-7 ">
          <CheckBadgeIcon className="h-20  text-primary-500" />
          <h1 className="font-bold text-xl lg:text-2xl mt-5 mb-1">
            Payment Made Successfully
          </h1>
          <p className="text-gray-500 font-medium">
            Your Attendance Slip has been successfully generated
          </p>
          <div className="mt-7 h-[4.5rem] w-full lg:w-2/5 rounded-xl border border-[#85CD00] flex justify-between items-center p-4">
            <div className="flex justify-center items-start gap-3">
              <ConferenceSlipIcon />
              <div className="flex flex-col">
                <p className="font-semibold">Conference Reciept.pdf</p>
                <p className="text-gray-500 text-sm">200 KB</p>
              </div>
            </div>
            <CheckIcon className=" -mt-6 h-5 p-1 bg-primary-500 text-white rounded-full" />
          </div>
          <div className="flex flex-col gap-5 lg:gap-3 lg:flex-row justify-between items-center lg:w-2/5 mt-7">
            <button
              type="button"
              onClick={() => (window.location.href = "/dashboard")}
              className="text-center w-full lg:w-1/2 text-sm font-bold rounded-3xl bg-gray-100 hover:bg-gray-200 py-[0.8rem] px-5  mt-1"
            >
              Go to Dashboard
            </button>
            <div className="col-span-1 w-full lg:w-1/2">
              <Button
                variant="primary"
                dimension="lg"
                type="button"
                onClick={handlePrint}
              >
                <p className="font-bold"> Download slip</p>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden">
        {paymentInfo && <ReceiptCard ref={componentRef} data={paymentInfo} />}
      </div>
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
                Nigerian Bar Association {data?.year} Annual General Conference
              </p>
            </div>
            <div className="w-4/6 bg-primary-400 bg-opacity-5 px-10 py-16 flex flex-row justify-between items-center text-xl lg:text-2xl font-extrabold">
              <p className="">
                NBA <span className="text-primary-500">{data?.year}</span>{" "}
                Annual General Conference
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
                {data?.payer_name?.split(" ")[0]}
                <br />
                {data?.payer_name?.split(" ").slice(1).join(" ")}
              </p>
            </div>
            <div className="h-64 w-full bg-primary-500 flex flex-start items-center p-7">
              <img
                src={`data:image/png;base64,${data?.barcode}`}
                alt="Barcode"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
export default Complete;
