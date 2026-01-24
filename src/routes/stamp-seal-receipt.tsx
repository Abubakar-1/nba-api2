import coa from "../assets/images/coa.svg";
import nbaLogo from "../assets/images/nba_logo.png";
import receipt_bg from "../assets/images/receipt_bg.jpg";
import receipt from "../assets/images/bpf_receipt1.jpg";
import stamp_back from "../assets/images/stamp_back.jpg";

import { FunctionalComponent, Ref } from "preact";
import PhotoContext from "@/context/photo-context";
import AuthContext from "@/context/auth-context";
import { useEffect, useRef, useMemo } from "preact/hooks";
import { useReactToPrint } from "react-to-print";
import React from "preact/compat";
import { useNavigate } from "react-router-dom";
import { ITransactionDetails } from "@/api/interfaces/transaction";
import Button from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";

const StampReceipt: FunctionalComponent = () => {
  const navigate = useNavigate();
  const { photoInfo } = PhotoContext.useContainer();
  const { user } = AuthContext.useContainer();

  // Enrich receipt data with user profile fallback
  const enrichedData = photoInfo;

  const componentRef = useRef(null);

  const pageStyle = `
    @page {
      size: 210mm 297mm;
      margin: 0;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${enrichedData?.recipient_name}-receipt`,
    pageStyle: pageStyle,
  });

  useEffect(() => {
    !photoInfo && navigate(-1);
  }, []);

  return (
    <div className="px-4">
      <PageTitle title="Stamp and Seal Receipt" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">
        Transaction Receipt
      </h1>

      <div className="px-4">
        <div className="w-full flex justify-end items-center">
          <div className="w-full sm:w-3/5 md:w-2/5 lg:w-2/6 2xl:w-1/6 flex justify-between gap-3 py-4 mb-5">
            <div className="w-1/2">
              <Button
                variant="outline"
                dimension="lg"
                type="button"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
            </div>
            <div className="w-1/2">
              <Button
                variant="primary"
                dimension="lg"
                type="button"
                onClick={handlePrint}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
        {enrichedData && <ReceiptCard ref={componentRef} data={enrichedData} />}
      </div>
    </div>
  );
};

interface Props {
  data: ITransactionDetails;
}
const ReceiptCard = React.forwardRef(
  ({ data }: Props, ref: Ref<HTMLDivElement> | undefined) => {
    return (
      <div
        ref={ref}
        className="relative w-full flex justify-center items-center mb-7"
      >
        <div
          className="w-[210mm] h-[297mm] bg-contain bg-no-repeat bg-center px-16 pt-2 border border-gray-200"
          style={{
            backgroundImage: `url(${stamp_back})`,
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}
        >
          <div className=" flex flex-col justify-center items-center w-full mb-12">
            <img alt="coat of arm" src={nbaLogo} className="h-28" />
            <h1 className="text-black text-xl lg:text-2xl font-bold font-display mt-1.5 ">
              NATIONAL SECRETARIAT
            </h1>
            <h3 className="text-black text-sm -mt-1 font-bold font-display">
              NBA House, Plot 1101 Mohammadu,
            </h3>
            <h3 className="text-black text-sm -mt-1 font-bold font-display">
              Buhari Way, Centeral Business District,
            </h3>
            <h3 className="text-black text-sm -mt-1 font-bold font-display">
              Abuja, F.C.T Nigeria
            </h3>
          </div>
          <div className="w-full flex justify-between items-center">
            <div></div>
            <div>
              <p className="text-black text-sm font-medium font-display leading-6">
                Payment date:{" "}
                <span className="pl-1 font-medium text-gray-800">
                  {data.created_at}
                </span>
                <br />
                Payment Reference:
                <br />
              </p>
              <p className="w-52 h-7 my-1 pl-1 text-sm text-gray-700 bg-[#7EA771] bg-opacity-25 font-display font-medium inline-flex items-center">
                {data.reference}
              </p>
            </div>
          </div>
          <div className="w-full text-center font-display text-[1.7rem] text-gray-600 font-extrabold -mt-2.5 mb-2">
            PAYMENT RECEIPT
          </div>
          <div className="grid grid-col-7 w-full h-fit pb-5">
            <div className="p-1.5 h-7 text-sm text-[#636861] font-display font-bold text-left col-span-7 bg mb-1 border-white bg-[#7EA771] bg-opacity-25">
              PAYER INFORMATION
            </div>
            <div className=" p-1.5 h-7 text-sm text-black font-display font-normal text-left col-span-1 bg mb-1 border-white bg-[#7EA771] bg-opacity-25">
              Name
            </div>
            <div className=" p-1.5 h-7 text-sm mb-1 border-white text-[#636861] font-display font-normal text-left col-span-6 bg bg-[#F0DE6B] bg-opacity-25">
              {data.recipient_name}
            </div>
            <div className=" p-1.5 h-7 text-sm text-black font-display font-normal text-left col-span-1 bg mb-1 border-white bg-[#7EA771] bg-opacity-25">
              Payee Branch
            </div>
            <div className=" p-1.5 h-7 text-sm mb-1 border-white text-[#636861] font-display font-normal text-left col-span-6 bg bg-[#F0DE6B] bg-opacity-25">
              {data.branch}
            </div>
            <div className=" p-1.5 h-7 text-sm text-black font-display font-normal text-left col-span-1 bg mb-1 border-white bg-[#7EA771] bg-opacity-25">
              Enrollment No.
            </div>
            <div className=" p-1.5 h-7 text-sm mb-1 border-white text-[#636861] font-display font-normal text-left col-span-6 bg bg-[#F0DE6B] bg-opacity-25">
              {data.recipient_scn}
            </div>
            <div className=" p-1.5 h-7 text-sm text-black font-display font-normal text-left col-span-1 bg mb-1 border-white bg-[#7EA771] bg-opacity-25">
              Email
            </div>
            <div className=" p-1.5 h-7 text-sm mb-1 border-white text-[#636861] font-display font-normal text-left col-span-6 bg bg-[#F0DE6B] bg-opacity-25">
              {data.email}
            </div>
            <div className=" p-1.5 h-7 text-sm text-black font-display font-normal text-left col-span-1 bg mb-1 border-white bg-[#7EA771] bg-opacity-25">
              Year of Call
            </div>
            <div className=" p-1.5 h-7 text-sm mb-1 border-white text-[#636861] font-display font-normal text-left col-span-6 bg bg-[#F0DE6B] bg-opacity-25">
              {data.year_of_call}
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-medium text-left col-span-7 mt-1 mb-2 border-white bg-[#7EA771] bg-opacity-25">
              PAYMENT DETAILS
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-medium text-left col-span-1 border-white bg-[#F0DE6B] bg-opacity-25">
              <p>
                PAYMENT <br />
                DATE
              </p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-medium text-left col-span-1 border-white bg-[#F0DE6B] bg-opacity-25">
              <p>
                PAYMENT <br />
                REF.
              </p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-medium text-left col-span-1 border-white bg-[#F0DE6B] bg-opacity-25">
              <p>
                PAYMENT <br />
                DESCRIPTION
              </p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-medium text-left col-span-1 border-white bg-[#F0DE6B] bg-opacity-25">
              <p>
                AMOUNT <br />₦
              </p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-medium text-left col-span-1 border-white bg-[#F0DE6B] bg-opacity-25">
              <p>
                CHARGES <br />₦
              </p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-medium text-left col-span-1 border-white bg-[#F0DE6B] bg-opacity-25">
              <p>
                VAT <br />₦
              </p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-medium text-left col-span-1 border-white bg-[#F0DE6B] bg-opacity-25">
              <p>
                TOTAL <br />₦
              </p>
            </div>

            <div className=" p-1.5 text-sm text-[#636861] font-display font-normal text-left col-span-1 border-white bg-[#7EA771] bg-opacity-25">
              <p>{data.created_at}</p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-normal text-left col-span-1 border-white bg-[#7EA771] bg-opacity-25">
              <p>{data.reference}</p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-normal text-left col-span-1 border-white bg-[#7EA771] bg-opacity-25">
              <p>
                {data.type?.toLocaleUpperCase() === "BPF"
                  ? "Bar Practicing Fee"
                  : "Stamp and Seal Fee"}
              </p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-normal text-left col-span-1 border-white bg-[#7EA771] bg-opacity-25">
              <p>{data.amount?.toLocaleString()}</p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-normal text-left col-span-1 border-white bg-[#7EA771] bg-opacity-25">
              <p>0.00</p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-normal text-left col-span-1 border-white bg-[#7EA771] bg-opacity-25">
              <p>0.00</p>
            </div>
            <div className=" p-1.5 text-sm text-[#636861] font-display font-normal text-left col-span-1 border-white bg-[#7EA771] bg-opacity-25">
              <p>{data.amount?.toLocaleString()}</p>
            </div>

            <div className="p-1.5 h-7 mt-16 mb-7 text-sm text-[#636861] font-display font-bold text-left col-span-7 border-t-[6px] border-b-[8px] border-none bg-[#E1EBDD]">
              PAYMENT CHANNEL INFORMATION
            </div>

            <p className="bg-[#F0DE6B] bg-opacity-25 pl-2 p-1.5 col-span-1 text-sm text-[#636861] font-display font-bold text-left">
              TRANSITION
            </p>
            <p className="bg-[#F0DE6B] bg-opacity-25 p-1.5 col-span-1 text-sm text-[#636861] font-display font-bold text-left">
              STATUS
            </p>
            <p className="bg-[#F0DE6B] bg-opacity-25 p-1.5 col-span-1 text-sm text-[#636861] font-display font-bold text-left">
              PAYMENT TYPE
            </p>
            <p className="bg-[#F0DE6B] bg-opacity-25 p-1.5 col-span-2 text-sm text-[#636861] font-display font-bold text-left">
              PAYMENT YEAR
            </p>
            <p className="bg-[#F0DE6B] bg-opacity-25 p-1.5 col-span-2 text-sm text-[#636861] font-display font-bold text-left">
              BILLING METHOD
            </p>

            <p className="bg-[#7EA771] bg-opacity-25 p-2 col-span-1 text-sm text-[#636861] font-display font-normal text-left">
              NBA Portal
            </p>
            <p className="bg-[#7EA771] bg-opacity-25 p-2 col-span-1 text-sm text-[#636861] font-display font-normal text-left">
              Successful
            </p>
            <p className="bg-[#7EA771] bg-opacity-25 p-2 col-span-1 text-sm text-[#636861] font-display font-normal text-left">
              {data.type}
            </p>
            <p className="bg-[#7EA771] bg-opacity-25 p-2 col-span-2 text-sm text-[#636861] font-display font-normal text-left">
              {data.year || " "}
            </p>
            <p className="bg-[#7EA771] bg-opacity-25 p-2 col-span-2 text-sm text-[#636861] font-display font-normal text-left">
              {data.payment_gateway || ""}
            </p>
          </div>
        </div>
        <p className="absolute bottom-1 w-full text-center text-black font-display font-bold">
          nigerianbar.org.ng info@nigerianbar.org.ng +234-800-33-111
        </p>
      </div>
    );
  },
);

export default StampReceipt;
