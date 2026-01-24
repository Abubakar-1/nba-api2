import {
  getPaymentPreview,
  initiateConference,
  makePayment,
  updateConference,
  verifyConferencePayment,
} from "@/api/conference";
import { IConferencePayment } from "@/api/interfaces/conference";
import AuthContext from "@/context/auth-context";
import classNames from "classnames";
import { FunctionalComponent } from "preact";
import { useCallback, useState } from "preact/hooks";
import { Fragment } from "preact";
import FlutterwaveAPI from "../flutterwave/flutterwave-api";
import { useRequest } from "../hooks/use-request";
import { NotifyError, NotifySuccess } from "../toast/toast";
import Button from "../ui/button";
import PageLoader from "../ui/page-loader";
interface IProps {
  changeStage: any;
  formValue: any;
  // setRefNo: any;
  setPaymentInfo: any;
}

interface verifyResProps {
  name: string;
  amount: number;
  message: string;
  payment_date: string;
  reference: string;
  status: string;
  transaction_id: string;
}
const Preview: FunctionalComponent<IProps> = ({
  changeStage,
  formValue,
  // setRefNo,
  setPaymentInfo,
}) => {
  const initiateConferenceRequest = useRequest<any>(initiateConference);
  const updateConferenceInfo = useRequest<any>(updateConference);
  const getPaymentPreviewRequest = useRequest<any>(getPaymentPreview);
  const makePaymentRequest = useRequest<any>(makePayment);
  const verifyPaymentRequest = useRequest(verifyConferencePayment);
  const [verifyIsLoading, setVerifyIsLoading] = useState<boolean>(false);

  const { conferenceStatus, updateConferenceDetails } =
    AuthContext.useContainer();

  const [isPaymentPreview, setIsPaymentPreview] = useState<boolean>(false);
  const [isPayment, setIsPayment] = useState<boolean>(false);
  const [invoiceRes, setInvoiceRes] = useState<IConferencePayment>();
  const [isInfoSaved, setIsInfoSaved] = useState<boolean>(false);

  const submitConferenceRequest = async (body: any) => {
    const [_res, _err] = await initiateConferenceRequest.makeRequest(body);

    if (!_err) {
      NotifySuccess("Registered successfully");
      updateConferenceDetails();
      setIsInfoSaved(true);
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  };

  const updateConferenceRequest = async (body: any) => {
    const payload = {
      body,
      id: conferenceStatus.entry?.id,
    };
    const [_res, _err] = await updateConferenceInfo.makeRequest(payload);
    if (!_err) {
      // goto payment
      NotifySuccess("Updated successfully");
      setIsInfoSaved(true);
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  };

  const getPaymentPreviewInfo = async () => {
    const [_res, _err] = await getPaymentPreviewRequest.makeRequest({});
    if (!_err) {
      // goto payment
      _res?.ok === false
        ? NotifyError(_res?.message)
        : setIsPaymentPreview(true);
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      setIsPaymentPreview(false);
      return;
    } else {
      NotifyError(_err?.info);
      setIsPaymentPreview(false);

      return;
    }
  };

  const makeConferencePayment = async () => {
    // Construct the payment payload with ONLY required fields
    const paymentPayload = {
      year: new Date().getFullYear(), // Current year
      type: formValue?.category || "LAWYER", // Use category as type
      participation: (formValue?.participation?.toLowerCase() || "physical") as
        | "physical"
        | "virtual",
      payment_rate: (formValue?.payment_rate || "regular") as
        | "early_bird"
        | "regular"
        | "late",
      quantity: parseInt(formValue?.quantity) || 1,
      payment_gateway: (formValue?.payment_gateway || "FLUTTERWAVE") as
        | "PAYSTACK"
        | "FLUTTERWAVE",
    };

    console.log("=== PAYMENT PAYLOAD ===");
    console.log("Form Values:", formValue);
    console.log("Payment Payload:", paymentPayload);
    console.log("Payload Keys:", Object.keys(paymentPayload));
    console.log("======================");

    const [_res, _err] = await makePaymentRequest.makeRequest(paymentPayload);
    if (!_err) {
      // goto flutterwave
      setInvoiceRes(_res);
      _res?.paid ? completePayment(_res?.reference, true) : setIsPayment(true);
    } else if (_err && _err?.data) {
      console.error("Payment Error:", _err);
      const errorMessage = Array.isArray(_err?.data?.message)
        ? _err.data.message.join(", ")
        : _err?.data?.info ||
          _err?.data?.message ||
          "Payment initialization failed";
      NotifyError(errorMessage);
      setIsPayment(false);
      return;
    } else {
      NotifyError(_err?.info || "Payment initialization failed");
      setIsPayment(false);

      return;
    }
  };

  const funcVerifyPayment = useCallback(
    async (val: string) => {
      const [response, _err] = await verifyPaymentRequest.makeRequest({
        ref: val,
      });
      if (!_err) {
        setPaymentInfo(response);
        changeStage(3);
        setVerifyIsLoading(false);
      } else if (_err && _err?.data) {
        NotifyError(_err?.data?.info);
        setVerifyIsLoading(false);
        return;
      } else {
        NotifyError(_err?.info);
        return;
      }
    },
    [verifyPaymentRequest.makeRequest]
  );
  const completePayment = async (ref: string, status: boolean) => {
    setVerifyIsLoading(true);
    setTimeout(() => {
      status ? funcVerifyPayment(ref) : setVerifyIsLoading(false);
    }, 3000);
  };
  return (
    <>
      <div className="w-full min-h-screen lg:border-l lg:px-10 ">
        <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-5">
          Preview Details
        </h1>
        {verifyIsLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <PageLoader isOutlined={verifyIsLoading} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-5">
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="font-bold text-black"> {formValue?.email}</p>
                </div>
              </div>
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">
                    Phone Number
                  </p>
                  <p className="font-bold text-black"> {formValue?.phone}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-5">
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">Title</p>
                  <p className="font-bold text-black">{formValue?.title}</p>
                </div>
              </div>
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">Name</p>
                  <p className="font-bold text-black">
                    {" "}
                    {formValue?.first_name +
                      " " +
                      formValue?.last_name +
                      " " +
                      formValue?.middle_name}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-5">
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">Category</p>
                  <p className="font-bold text-black"> {formValue?.category}</p>
                </div>
              </div>
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">
                    Organization
                  </p>
                  <p className="font-bold text-black">
                    {" "}
                    {formValue?.organization}
                  </p>
                </div>
              </div>
              {/* <div className="col-span-1 ">
            <div className="flex flex-col justify-cener items-start gap-1">
              <p className="text-sm text-gray-500 font-medium">Branch</p>
              <p className="font-bold text-black">{conferenceStatus?.branch}</p>
            </div>
          </div> */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-5">
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">
                    Travelling with Toddler
                  </p>
                  <p className="font-bold text-black">
                    {formValue?.has_toddler ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">
                    Above the age of 70?
                  </p>
                  <p className="font-bold text-black">
                    {formValue?.is_over_70 ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-5">
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">
                    Physical Disability
                  </p>
                  <p className="font-bold text-black">
                    {" "}
                    {formValue?.disability}
                  </p>
                </div>
              </div>
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">
                    How will you participate
                  </p>
                  <p className="font-bold text-black">
                    {formValue?.participation}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-7">
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">
                    Organization
                  </p>
                  <p className="font-bold text-black">
                    {" "}
                    {formValue?.organization}
                  </p>
                </div>
              </div>
              <div className="col-span-1 ">
                <div className="flex flex-col justify-cener items-start gap-1">
                  <p className="text-sm text-gray-500 font-medium">Address</p>
                  <p className="font-bold text-black">{formValue?.address}</p>
                </div>
              </div>
            </div>
            {isPaymentPreview && (
              <>
                <p className="text-gray-500 font-medium mb-3">
                  Payment ({getPaymentPreviewRequest.response?.payment_rate})
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-7 rounded-xl bg-green-50 border-[1px] border-primary-500 border-dashed h-32">
                  <div className="col-span-2 flex flex-col justify-center items-start gap-1 w-full px-4 lg:px-6">
                    <h1 className="font-extrabold text-2xl lg:text-4xl text-primary-500">
                      {"₦" +
                        getPaymentPreviewRequest.response?.total_payment?.toLocaleString() +
                        " "}
                    </h1>
                    <p className="px-3 py-2 rounded-lg bg-primary-500 bg-opacity-80 text-tiny font-bold text-white w-full">
                      Pay
                      {" ₦" +
                        getPaymentPreviewRequest.response?.total_payment?.toLocaleString() +
                        " "}
                      as
                      {" " +
                        getPaymentPreviewRequest.response?.payment_rate?.toUpperCase() +
                        " "}
                      in your category
                    </p>
                  </div>
                </div>
              </>
            )}
            {!isPaymentPreview && (
              <div className="h-[0.1rem] w-full mb-7 bg-gray-300"></div>
            )}
            <div className="flex gap-5 mb-5 justify-end items-center">
              <div
                className={classNames(
                  "grid grid-cols-1 w-full gap-4 lg:mr-16",
                  { "lg:grid-cols-5 ": isPayment },
                  { "lg:grid-cols-4 ": !isPayment }
                )}
              >
                <div className="col-span-1 lg:col-span-2 w-full lg:w-36">
                  <Button
                    variant="outline"
                    dimension="lg"
                    type="button"
                    onClick={() => changeStage(1)}
                  >
                    Back
                  </Button>
                </div>
                <div className="col-span-1 lg:col-span-1 flex justify-end items-center ">
                  {!isInfoSaved && (
                    <>
                      <div className="w-full lg:w-36">
                        <Button
                          variant="primary"
                          dimension="lg"
                          type="button"
                          isLoading={
                            initiateConferenceRequest.isLoading ||
                            updateConferenceInfo.isLoading
                          }
                          onClick={() =>
                            conferenceStatus.status
                              ? updateConferenceRequest(formValue)
                              : submitConferenceRequest(formValue)
                          }
                        >
                          {conferenceStatus.status ? "Next" : "Save"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                {isInfoSaved && (
                  <>
                    {!isPaymentPreview ? (
                      <div className="col-span-1 w-full lg:w-40">
                        <Button
                          variant="primary"
                          dimension="lg"
                          type="button"
                          isLoading={getPaymentPreviewRequest.isLoading}
                          onClick={() => getPaymentPreviewInfo()}
                        >
                          Preview Payment
                        </Button>
                      </div>
                    ) : isPayment ? (
                      <div className="col-span-1 lg:col-span-2">
                        <FlutterwaveAPI
                          tx_ref={invoiceRes?.reference!}
                          pk={invoiceRes?.public_key + ""}
                          amount={invoiceRes?.total_payment!}
                          email={invoiceRes?.customer_email + ""}
                          phone={invoiceRes?.phone_number + ""}
                          name={invoiceRes?.customer_name + ""}
                          completePayment={completePayment}
                          label="Pay with FlutterWave"
                        />
                      </div>
                    ) : (
                      <div className="col-span-1 w-full lg:w-40">
                        <Button
                          variant="primary"
                          dimension="lg"
                          type="button"
                          isLoading={makePaymentRequest.isLoading}
                          onClick={() => makeConferencePayment()}
                        >
                          Make Payment
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
export default Preview;
