import {
  BPFPaymentInvoiceProps,
  StampAndSealPaymentProp,
  StampItems,
  StampProp,
  IUploadStampDocument,
} from "@/api/interfaces/payment";
import {
  generateInvoicePreview,
  getStampItems,
  initializeStampPayment,
  uploadStampAndSealDoc,
  submitBranchFeeProof,
} from "@/api/payment";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import AuthContext from "@/context/auth-context";
import PhotoContext from "@/context/photo-context";
import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { FunctionalComponent, Fragment } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import {
  blobToBase64,
  checkCategory,
  isWithinDateRange,
} from "@/utils/functions/string-functions";
import FlutterwaveAPI from "@/components/flutterwave/flutterwave-api";
import {
  ArrowSmallLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import PageLoader from "@/components/ui/page-loader";
import { verifySignUpSCNApi } from "@/api/auth";
import Input from "@/components/ui/input";
import { ISignUp } from "@/api/interfaces/auth";
import { ChangeEvent } from "preact/compat";
import { debounce } from "lodash";
import RadioButton from "@/components/ui/radio-button";
import Checkbox from "@/components/ui/checkbox";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { FileUploader } from "react-drag-drop-files";
import FileIcon from "@/assets/icons/file-icon";
import MultiUploadIcon from "@/assets/icons/multi-upload-icon";
import EtrasactAPIStamp from "@/components/etrasact/etrasact-api_stamp"; // new import
import { getBranches } from "@/api/branch"; // Correct import
import { logger } from "@/utils/logger";
import { PaymentGatewayModal } from "@/components/ui/payment-gateway-modal";

interface IStamAndSealPayment {
  funcModalIsOpen: () => void;
  modalIsOpen: boolean;
  refresh?(): void;
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

interface SCNListProps {
  id: number;
  scn: string;
  category: string;
}

const StampAndSealPayment: FunctionalComponent<IStamAndSealPayment> = ({
  modalIsOpen,
  funcModalIsOpen,
  refresh,
}) => {
  const [steps, setSteps] = useState({
    step1: true,
    step2: false,
    step3: false,
    checkout: false,
  });
  const [file, setFile] = useState<any>(null);
  const [selectedGateway, setSelectedGateway] = useState<
    "FLUTTERWAVE" | "PAYSTACK"
  >("FLUTTERWAVE");

  // Stamp Payment State (Step 3 -> Moved to Step 1 context)
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "MANUAL">(
    "ONLINE",
  );
  const [paymentLink, setPaymentLink] = useState<string>(""); // Store payment link
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false); // Manual loading state
  const [manualFile, setManualFile] = useState<any>(null); // Stamp Receipt
  const [manualUploadedFile, setManualUploadedFile] = useState<File | null>(
    null,
  );
  const [manualUploadError, setManualUploadError] = useState<string>("");

  // Branch Dues State (Step 1)
  const [branchPaymentMethod, setBranchPaymentMethod] = useState<
    "ONLINE" | "MANUAL"
  >("ONLINE");
  const [branchFile, setBranchFile] = useState<any>(null); // Branch Receipt
  const [branchUploadedFile, setBranchUploadedFile] = useState<File | null>(
    null,
  );
  const [branchUploadError, setBranchUploadError] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  // const [scnSearchInfo, setScnSearchInfo] = useState<ISignUp[]>();
  // const [scnList, setScnList] = useState<SCNListProps[]>();
  // const [paymentYear, setPaymentYear] = useState<number>(); // Removed: Stamp & Seal is for current year only
  const [packItem, setPackItem] = useState<string>("");

  const { response: branchList } = useFetcher<any, any>(getBranches); // Fetch branches

  // const [yearValue, setYearValue] = useState<string>();
  const [paymentResponse, setPaymentResponse] = useState<verifyResProps>();
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);

  const { user } = AuthContext.useContainer();
  const { setPhotoInfo } = PhotoContext.useContainer();
  const navigate = useNavigate();
  const { makeRequest, isLoading } = useRequest<any>(initializeStampPayment);
  const submitProofRequest = useRequest(submitBranchFeeProof);

  const { response: fetchedStampData } = useFetcher<any, StampItems[]>(
    getStampItems,
  );

  // Debug: Log what API returns
  logger.debug("Stamp Items API Response", {
    data: fetchedStampData,
    isArray: Array.isArray(fetchedStampData),
    length: fetchedStampData?.length,
  });

  // Testing if API is returning data - fallback commented out temporarily
  // const StampData = (fetchedStampData && Array.isArray(fetchedStampData) && fetchedStampData.length > 0)
  //   ? fetchedStampData
  //   : [
  //       { code: "PACK_24", description: "24 Packs", amount: 4000, id: 1, quantity: 24 },
  //       { code: "PACK_48", description: "48 Packs", amount: 8000, id: 2, quantity: 48 },
  //       { code: "PACK_96", description: "96 Packs", amount: 16000, id: 3, quantity: 96 },
  //       { code: "PACK_192", description: "192 Packs", amount: 32000, id: 4, quantity: 192 }
  //     ];
  const StampData = fetchedStampData || [];

  const fileTypes = ["JPEG", "PNG", "JPG"];

  const handleChangeBranchFile = (file: any) => {
    blobToBase64(file[0], setBranchFile);
    setBranchUploadedFile(file[0]);
    setBranchUploadError("");
  };

  const handleChangeManualFile = (file: any) => {
    // Stamp File
    blobToBase64(file[0], setManualFile);
    setManualUploadedFile(file[0]);
    setManualUploadError("");
  };

  const formik = useFormik({
    initialValues: {
      stamp: "",
      packs: "", // Added packs to formik initialValues
    },
    onSubmit(values, formikHelpers) {},
  });

  const handleSubmit = async (e: any, online: boolean) => {
    e.preventDefault();
    const seal_type = packItem;
    const is_government = formik.values.stamp === "public";
    const is_free = false;
    const payment_gateway =
      selectedGateway === "FLUTTERWAVE" ? "FLUTTERWAVE" : "PAYSTACK";
    const attachment = manualFile; // Stamp Attachment
    const redirect_url = window.location.origin + "/transaction";
    const request_type = formik.values.stamp.toUpperCase();

    const payload = {
      seal_type,
      is_government,
      is_free,
      payment_gateway,
      attachment,
      redirect_url,
      request_type,
    };

    if (online) {
      initPayment(payload);
    } else {
      // Manual payment initialization if needed, or if the API handles it same way
      initPayment(payload);
    }
  };

  async function initPayment(body: any) {
    logger.debug("Stamp Payment Payload", body);
    const [response, _err] = await makeRequest(body);

    if (!_err) {
      logger.debug("Stamp Payment Response", response);

      const orderId = response?.data?.order_id || response?.order_id;
      // Handle Manual Upload if needed (though backend might handle it differently)
      if (orderId && manualFile && paymentMethod === "MANUAL") {
        try {
          const uploadPayload: IUploadStampDocument = {
            orderId: orderId,
            attachment: manualFile, // base64 string
            type: formik.values.stamp, // public/private
            payment_id:
              response?.reference || response?.data?.reference || "pending",
          };
          logger.debug("Uploading attachment...", uploadPayload);
          const [uploadRes, uploadErr] =
            await uploadStampAndSealDoc(uploadPayload);

          if (uploadErr) {
            logger.error("Attachment upload failed", uploadErr);
            NotifyError(
              "Failed to upload attachment. Please contact support if this persists.",
            );
          } else {
            logger.debug("Attachment uploaded successfully", uploadRes);
            NotifySuccess("Payment proof submitted successfully!");
            // Close modal or reset
            funcModalIsOpen();
            setPackItem("");
          }
          return; // Done for manual
        } catch (e) {
          logger.error("Error uploading attachment", e);
        }
      }

      // For Online Payment
      const authUrl = response?.payment_link || response?.data?.payment_link;

      if (authUrl) {
        // Instead of auto redirect, show button
        setPaymentLink(authUrl);
        setPaymentResponse(response); // Store response for display info if needed
        setSteps((prev: any) => ({
          ...prev,
          step1: false,
          step2: true, // Use step2 for "Proceed to Payment"
          step3: false,
          checkout: false,
        }));
      } else {
        if (paymentMethod === "ONLINE") {
          logger.error("No authorization URL in response", response);
          NotifyError(
            "Payment initialization failed: No payment link received",
          );
        }
      }
    } else if (_err && _err?.data) {
      logger.error("Stamp Payment Error Data", _err.data);
      NotifyError(
        _err?.data?.info ||
          _err?.data?.message ||
          "Payment initialization failed",
      );
      return;
    } else {
      logger.error("Stamp Payment Error", _err);
      NotifyError(_err?.info || "Payment initialization failed");
      return;
    }
  }

  // async function getStampItems(scn: string) {
  //   const [response, _err] = await getStamItemRequest.makeRequest({
  //     scn: scn,
  //   });
  //   if (!_err) {
  //     // setScnSearchInfo(response);
  //   } else if (_err && _err?.data) {
  //     NotifyError(_err?.data?.info);
  //     return;
  //   } else {
  //     NotifyError(_err?.info);
  //     return;
  //   }
  // }

  const handleChange = (e: string) => {
    setPackItem(e.replace(/\s+/g, ""));
  };

  return (
    <>
      <Modal
        isOpen={successModal}
        showCloseIcon={successModal}
        onClose={() => setSuccessModal(!successModal)}
      >
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="p-4 mt-10 w-fit rounded-full bg-primary-500 bg-opacity-[12%]">
            <CheckCircleIcon className="text-primary-500 w-10 h-10" />
          </div>
          <div className="flex flex-col items-center py-3 gap-1">
            <h1 className="text-3xl text-primary-500 font-bold">
              Payment Success!
            </h1>
            <p className="text-sm">Your payment has been successfully done.</p>
          </div>
          <div className="p-4 w-full rounded-xl bg-primary-500 bg-opacity-[5%] grid grid-cols-2 gap-3 text-black">
            <p className="text-left text-xs">Amount</p>
            <p className="text-right text-sm">
              &nbsp;&#8358;{paymentResponse?.amount.toLocaleString()}
            </p>
            <p className="text-left text-xs">Payment Status</p>
            <p className="text-right text-sm font-semibold text-primary-500">
              {paymentResponse?.message}
            </p>
            <div className="w-full h-[1px] bg-gray-300 col-span-2 my-1"></div>
            <p className="text-left text-xs">Ref Number</p>
            <p className="text-right text-xs font-semibold">
              {paymentResponse?.reference}
            </p>
            <p className="text-left text-xs">Payer</p>
            <p className="text-right text-xs font-semibold">
              {paymentResponse?.name}
            </p>
            <p className="text-left text-xs">Payment Method</p>
            <p className="text-right text-xs font-semibold">Card payment</p>
            <p className="text-left text-xs">Payment Time</p>
            <p className="text-right text-xs font-semibold">
              {paymentResponse?.payment_date}
            </p>
          </div>
          <div className="mt-10 w-full flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSuccessModal(!successModal)}
              dimension="lg"
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                const branchObj = branchList?.find(
                  (b: any) =>
                    b.code == selectedBranch || b.id == selectedBranch,
                );
                const branchName =
                  branchObj?.name || (user as any)?.branch || "N/A";

                const receiptData: any = {
                  recipient_name: user?.first_name + " " + user?.last_name,
                  email: user?.email || "",
                  amount: paymentResponse?.amount || 0,
                  reference: paymentResponse?.reference || "",
                  created_at:
                    paymentResponse?.payment_date || new Date().toISOString(),
                  type: "STAMP_SEAL", // Or dynamic if BPF is handled here
                  recipient_scn: user?.scn || "",
                  branch: branchName,
                  year_of_call: user?.year_of_call || 0,
                  year: new Date().getFullYear(),
                  status: "Successful",
                  payment_type: "Stamp & Seal",
                  payer_name: user?.first_name + " " + user?.last_name,
                };

                setPhotoInfo(receiptData);
                navigate("/payment/stampreceipt");
              }}
              dimension="lg"
            >
              Download Receipt
            </Button>
          </div>
        </div>
      </Modal>
      {steps.step1 && (
        <Modal
          isOpen={modalIsOpen}
          showCloseIcon={modalIsOpen}
          onClose={() => {
            funcModalIsOpen();
            setPackItem("");
          }}
          dimensions="lg"
        >
          <div>
            <h1 className="font-bold text-xl mb-6 text-center">
              Stamp and Seal Payment
            </h1>

            <div className="flex flex-col gap-5">
              {/* Payment Method Toggle */}
              <div className="flex gap-4 border-b pb-2">
                <button
                  type="button"
                  className={classNames(
                    "pb-2 px-4 text-sm font-medium transition-colors",
                    {
                      "border-b-2 border-primary-500 text-primary-500":
                        branchPaymentMethod === "MANUAL",
                      "text-gray-500 hover:text-gray-700":
                        branchPaymentMethod !== "MANUAL",
                    },
                  )}
                  onClick={() => setBranchPaymentMethod("MANUAL")}
                >
                  Upload Branch Dues Receipt
                </button>
                <button
                  type="button"
                  className={classNames(
                    "pb-2 px-4 text-sm font-medium transition-colors",
                    {
                      "border-b-2 border-primary-500 text-primary-500":
                        branchPaymentMethod === "ONLINE",
                      "text-gray-500 hover:text-gray-700":
                        branchPaymentMethod !== "ONLINE",
                    },
                  )}
                  onClick={() => setBranchPaymentMethod("ONLINE")}
                >
                  Pay Online
                </button>
              </div>

              {/* Content */}
              {branchPaymentMethod === "ONLINE" ? null : (
                <div className="flex flex-col gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
                    <p>
                      <strong>Note:</strong> If you paid branch dues manually,
                      you have to upload the receipt first, you can then proceed
                      to pay for Stamp & Seal online.
                    </p>
                  </div>

                  {/* File Uploader */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Upload Branch Dues Receipt{" "}
                      <span className="text-red-500">*</span>
                    </h4>
                    <div
                      className={classNames(
                        "relative w-full h-[5.5rem] border bg-cover bg-center bg-no-repeat border-primary-500 rounded-lg border-dashed ",
                        { "h-[3.5rem] border-0 bg-gray-100": branchFile },
                        { "bg-green-50": !branchFile },
                      )}
                    >
                      {branchFile && (
                        <>
                          <div
                            className="absolute -top-2 -right-2"
                            role="button"
                            onClick={() => {
                              setBranchFile(null);
                              setBranchUploadedFile(null);
                            }}
                          >
                            <XMarkIcon className="w-6 h-6 p-1 bg-red-600 text-white rounded-full" />
                          </div>
                          <div className="w-full h-full p-4 flex justify-between items-center">
                            <div className="flex items-center gap-4 ">
                              <FileIcon />
                              <p className="text-xs">
                                {branchUploadedFile && branchUploadedFile.name}
                              </p>
                            </div>
                            <p className="text-xs">
                              {branchUploadedFile &&
                                (branchUploadedFile.size / 1024).toFixed(2) +
                                  "KB"}
                            </p>
                          </div>
                        </>
                      )}
                      {!branchFile && (
                        <FileUploader
                          multiple={true}
                          handleChange={handleChangeBranchFile}
                          name="branchFile"
                          types={fileTypes}
                          classes={{ backgroundColor: "red" }}
                          onTypeError={(err: any) => setBranchUploadError(err)}
                          onSizeError={(err: string) =>
                            setBranchUploadError(
                              "File size is too large, max 1MB",
                            )
                          }
                          maxSize={1}
                        >
                          <div className="flex flex-col justify-center items-center w-full h-full cursor-pointer">
                            <div className="flex justify-evenly items-center w-full ">
                              <div className="">
                                <MultiUploadIcon />
                              </div>
                              <div className="hidden md:block">
                                <h1 className="text-sm font-medium text-gray-800 mb-2">
                                  Click here to upload receipt
                                </h1>
                                <p className="text-gray-600 text-xs w-full text-center mb-1">
                                  Supported formats: JPEG, PNG, JPG
                                </p>
                              </div>
                              <div className="uppercase h-11 inline-flex items-center justify-center border-[1px] lg:px-5 lg:py-1 p-2 text-xs border-primary-500 text-primary-500 rounded-3xl">
                                Select file
                              </div>
                            </div>
                            {branchUploadError && (
                              <p className="text-red-500 text-xs w-full text-center ">
                                {branchUploadError}
                              </p>
                            )}
                          </div>
                        </FileUploader>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {branchPaymentMethod === "ONLINE" && (
                <div className="">
                  <h3 className="text-sm font-bold mb-4">
                    SELECT STAMP DETAILS
                  </h3>
                  <div className="flex flex-col gap-4">
                    {/* Packs Selection */}
                    <div>
                      <Select
                        label="Number of packs"
                        id="pack_combined"
                        dimension="lg"
                        variant="primary"
                        type="text"
                        value={packItem}
                        onChange={(e) => handleChange(e.currentTarget.value)}
                      >
                        <option value="" selected disabled>
                          Select
                        </option>
                        {Array.isArray(StampData) &&
                          StampData.map((el: StampItems, idx: number) => (
                            <option value={el.code}>
                              {el.description.toLocaleUpperCase()}
                            </option>
                          ))}
                      </Select>
                    </div>

                    {/* Stamp Type Selection */}
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Type of stamp
                      </div>
                      <div className="flex gap-10">
                        <RadioButton
                          label="Public"
                          id="public_combined"
                          variant="primary"
                          dimension="md"
                          {...formik.getFieldProps("stamp")}
                          type="radio"
                          value="public"
                          checked={formik.values.stamp === "public"}
                          autoComplete="stamp"
                        />

                        <RadioButton
                          label="Private"
                          id="private_combined"
                          variant="primary"
                          dimension="md"
                          {...formik.getFieldProps("stamp")}
                          type="radio"
                          value="private"
                          checked={formik.values.stamp === "private"}
                          autoComplete="stamp"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 mb-5 w-full flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  funcModalIsOpen();
                  setPackItem("");
                  setBranchFile(null);
                }}
                className="text-black text-sm font-medium hover:text-red-500"
              >
                Cancel
              </button>
              <div className="w-1/2">
                <Button
                  variant="primary"
                  dimension="lg"
                  type="button"
                  isLoading={isUploadingProof || isLoading}
                  disabled={
                    (branchPaymentMethod === "MANUAL" && !branchFile) ||
                    (branchPaymentMethod === "ONLINE" &&
                      (!packItem || !formik.values.stamp))
                  }
                  onClick={async (e) => {
                    if (branchPaymentMethod === "MANUAL") {
                      if (!branchFile) {
                        NotifyError("Please upload branch payment proof.");
                        return;
                      }

                      const formData = new FormData();
                      formData.append(
                        "payment_proof",
                        branchUploadedFile as File,
                      );

                      setIsUploadingProof(true);
                      const [res, err] = await submitBranchFeeProof(formData);
                      setIsUploadingProof(false);

                      if (!err) {
                        NotifySuccess(
                          res?.message ||
                            res?.data?.message ||
                            "Branch fee payment submitted successfully. Proceed to order for stamp and seal online.",
                        );
                        if (refresh) refresh();
                        funcModalIsOpen();
                        setBranchFile(null);
                        setBranchUploadedFile(null);
                      } else {
                        NotifyError(
                          err?.data?.message ||
                            err?.message ||
                            "Failed to submit payment proof.",
                        );
                      }
                      return;
                    }

                    // Online Flow
                    handleSubmit(e, true);
                  }}
                >
                  {branchPaymentMethod === "MANUAL" ? "Upload" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Step 2: "Proceed to Payment" view (was consolidated, now reused) */}
      {steps.step2 && (
        <Modal
          isOpen={modalIsOpen}
          showCloseIcon={modalIsOpen}
          onClose={() => {
            funcModalIsOpen();
            setSteps((prev: any) => ({
              ...prev,
              step1: true,
              step2: false,
              step3: false,
              checkout: false,
            }));
            setPackItem("");
          }}
          dimensions="lg"
        >
          <div className="w-full h-full flex flex-col justify-center items-center py-6">
            <h2 className="text-2xl font-bold text-primary-500 mb-4">
              Payment Initialized
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-sm">
              Your order has been created successfully. Please proceed to make
              payment.
            </p>

            {/* Optional details */}
            {(paymentResponse as any)?.amount && (
              <div className="mb-8 font-semibold text-lg">
                Amount: &#8358;
                {(paymentResponse as any)?.amount?.toLocaleString()}
              </div>
            )}

            <div className="w-full flex justify-center">
              <Button
                variant="primary"
                dimension="lg"
                type="button"
                onClick={() => {
                  if (paymentLink) {
                    setGatewayModalOpen(true);
                  } else {
                    NotifyError("Payment link is invalid or missing");
                  }
                }}
                className="w-full md:w-2/3 bg-primary-500 p-4 text-white rounded-full"
              >
                Proceed to Make Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}
      <PaymentGatewayModal
        isOpen={gatewayModalOpen}
        onClose={() => setGatewayModalOpen(false)}
        paymentUrl={paymentLink}
      />
    </>
  );
};
export default StampAndSealPayment;
