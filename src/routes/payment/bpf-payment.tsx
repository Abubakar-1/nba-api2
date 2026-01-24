import {
  BPFPaymentInvoiceProps,
  BPFPaymentProp,
  BPFPaymentResProps,
} from "@/api/interfaces/payment";
import {
  generateInvoicePreview,
  paymentInvoice,
  verifyPayment,
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
import { checkCategory } from "@/utils/functions/string-functions";
import EtrasactAPI from "../../components/etrasact/etrasact-api_bpfconfirmation";
import { useVerifyPaymentMutation } from "@/components/hooks/use-transactions-query";
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
import { Link, NavLink, useNavigate } from "react-router-dom";
import { el } from "date-fns/locale";
import { logger } from "@/utils/logger";

import { PaymentGatewayModal } from "@/components/ui/payment-gateway-modal";

interface IBPFPayment {
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

const BPFPayment: FunctionalComponent<IBPFPayment> = ({
  modalIsOpen,
  funcModalIsOpen,
  refresh,
}) => {
  const [steps, setSteps] = useState({
    step1: true,
    step2: false,
    checkout: false,
  });

  const [selectIndex, setSelectIndex] = useState<number>();
  const [selectedGateway, setSelectedGateway] = useState<
    "FLUTTERWAV" | "eTranzact"
  >("FLUTTERWAV");

  const [groupYear, setGroupYear] = useState<string>();
  const [paymentRes, setPaymentRes] = useState<BPFPaymentResProps>();
  const [invoiceRes, setInvoiceRes] = useState<BPFPaymentInvoiceProps>();
  const [scnSearchInfo, setScnSearchInfo] = useState<ISignUp[]>();
  const [scnList, setScnList] = useState<SCNListProps[]>();

  const [scnValue, setScnValue] = useState<string>();
  // const [selected, setSelected] = useState<boolean>();

  const [paymentResponse, setPaymentResponse] = useState<verifyResProps>();
  const [successModal, setSuccessModal] = useState<boolean>(false);

  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const { user } = AuthContext.useContainer();
  const { setPhotoInfo } = PhotoContext.useContainer();
  const navigate = useNavigate();
  const { makeRequest, isLoading } = useRequest<BPFPaymentProp>(paymentInvoice);

  const verifyScnRequest = useRequest<{ scn: string }>(verifySignUpSCNApi);

  const generateInvoiceRequest = useRequest<BPFPaymentProp>(
    generateInvoicePreview,
  );
  const verifyPaymentRequest = useRequest(verifyPayment);

  async function funcPreviewInvoice(body: any) {
    logger.debug("BPF Preview Payload", body);
    const [response, _err] = await makeRequest(body);
    if (!_err) {
      logger.debug("BPF Preview Response", response);

      if (!response?.amount) {
        NotifyError("Invalid response from server");
      } else {
        // Adapt new API response to expected state
        setPaymentRes({
          ok: true,
          total_payment: response.amount,
          invoice_recipients: [], // No longer returned
          year: new Date().getFullYear(),
        } as any);

        // Store the payment link for the checkout step
        setInvoiceRes({
          ...response,
          total_payment: response.amount,
          reference: response.reference,
          public_key: "", // Not used in redirect flow
          customer_email: user?.email || "",
          customer_name: `${user?.first_name} ${user?.last_name}`,
          callback_url: body.redirect_url,
        } as any);

        logger.debug("BPF Step Transition", { step: "step2" });
        setSteps((prev: any) => ({
          ...prev,
          step1: false,
          step2: true,
          checkout: false,
        }));
      }
    } else if (_err && _err?.data) {
      logger.error("BPF Preview Error Data", _err.data);
      if (_err.statusCode === 409 || _err.data.statusCode === 409) {
        NotifyError(
          _err?.data?.message ||
            "You have a pending payment. Please cancel it to continue.",
        );
        // Add a way to cancel
        setConflictError(true);
      } else {
        NotifyError(
          _err?.data?.info || _err?.data?.message || "An error occurred",
        );
      }
      return;
    } else {
      logger.error("BPF Preview Error", _err);
      NotifyError(_err?.info || _err?.message || "An error occurred");
      return;
    }
  }

  const [conflictError, setConflictError] = useState(false);

  async function funcGenerateInvoice(body: any) {
    // Step skipped as Preview/Initialize already generated the link
    setSteps((prev: any) => ({
      ...prev,
      step1: false,
      step2: true, // Keep it step2, but with checkout true
      checkout: true,
    }));
  }

  // async function funcVerifyPayment(val: string) {
  //   const [response, _err] = await verifyPaymentRequest.makeRequest({
  //     ref: val,
  //   });
  //   setPaymentResponse(response);
  //   if (!_err) {
  //     setSuccessModal(true);
  //   } else if (_err && _err?.data) {
  //     NotifyError(_err?.data?.info);
  //     return;
  //   } else {
  //     NotifyError(_err?.info);
  //     return;
  //   }
  // }
  /* import useVerifyPaymentMutation at top of file, doing it in separate edit if needed, but here we assume it's available or we add it next */
  const verifyMutation = useVerifyPaymentMutation();

  const funcVerifyPayment = useCallback(
    async (val: string) => {
      try {
        const response = await verifyMutation.mutateAsync({
          ref: val,
        });
        setPaymentResponse(response);
        if (refresh) refresh();
        setSuccessModal(true);
      } catch (_err: any) {
        if (_err && _err?.data) {
          // NotifyError(_err?.data?.info);
          if (refresh) refresh();
          NotifySuccess(
            "Payment Confirmed! Kindly verify payment status on transaction page",
          );

          return;
        } else {
          NotifyError(_err?.info);
          return;
        }
      }
    },
    [verifyMutation, refresh],
  );

  const handleSubmit = (e: any, preview: boolean) => {
    e.preventDefault();
    if (!user?.id || isNaN(Number(user?.id))) {
      alert("User ID is missing or invalid. Please re-login.");
      return;
    }
    // Payload matching new Swagger Schema
    const payload: any = {
      payment_gateway:
        selectedGateway === "FLUTTERWAV" ? "flutterwave" : "etranzact",
      redirect_url: window.location.origin + "/transaction",
    };
    // Always call funcPreviewInvoice as it now initializes the payment and provides the link
    funcPreviewInvoice(payload);
  };

  const handleSubmitGroup = (e: any, preview: boolean) => {
    e.preventDefault();
    // Group payment likely not supported on this endpoint yet, but trying with same payload
    const payload: any = {
      payment_gateway:
        selectedGateway === "FLUTTERWAV" ? "flutterwave" : "etranzact",
      redirect_url: window.location.origin + "/transaction",
    };

    // Always call funcPreviewInvoice as it now initializes the payment and provides the link
    funcPreviewInvoice(payload);
  };

  const completePayment = async (ref: string, status: boolean) => {
    setSteps((prev: any) => ({
      ...prev,
      step1: true,
      step2: false,
      checkout: false,
    }));

    funcModalIsOpen();
    setTimeout(() => {
      status && funcVerifyPayment(ref);
      setGroupYear("");
      setScnList(undefined);
    }, 3000);
  };

  async function verifyUser(scn: string) {
    const [response, _err] = await verifyScnRequest.makeRequest({
      scn: scn,
    });
    if (!_err) {
      setScnSearchInfo(response);
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  const handleSearch = debounce((e: string) => {
    e.length > 2 && verifyUser(e);
  }, 500);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    !groupYear && setGroupYear(new Date().getFullYear() + "");

    setScnValue((e.target as HTMLInputElement).value.replace(/\s+/g, ""));
    handleSearch((e.target as HTMLInputElement).value.replace(/\s+/g, ""));
    // setSelected(false);
  };

  const removeScn = (id: number) => {
    const filterScnList = scnList?.filter((el) => el.id !== id);
    setScnList(filterScnList);
  };

  const handleArrList = (e: any, el: ISignUp) => {
    if (
      scnList &&
      !scnList.some((item) => {
        return (
          item.id === el.id &&
          item.scn === el.scn &&
          item.category === checkCategory(el?.is_san, el?.is_honorable_bencher)
        );
      })
    ) {
      setScnList([
        ...scnList,
        {
          id: el?.id,
          scn: el?.scn,
          category: checkCategory(el?.is_san, el?.is_honorable_bencher),
        },
      ]);
    } else if (!scnList) {
      setScnList([
        {
          id: el?.id,
          scn: el?.scn,
          category: checkCategory(el?.is_san, el?.is_honorable_bencher),
        },
      ]);
    }
    setScnValue("");
    setScnSearchInfo(undefined);

    e.preventDefault();
  };

  return (
    <>
      <PaymentGatewayModal
        isOpen={gatewayModalOpen}
        onClose={() => setGatewayModalOpen(false)}
        paymentUrl={paymentUrl}
      />
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
              {paymentResponse?.payer_name}
            </p>
            <p className="text-left text-xs">Payment Method</p>
            <p className="text-right text-xs font-semibold">Card payment</p>
            <p className="text-left text-xs">Payment Time</p>
            <p className="text-right text-xs font-semibold">
              {paymentResponse?.payment_date}
            </p>
          </div>
          <div className="mt-10 w-full">
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
                  const receiptData: any = {
                    recipient_name: paymentResponse?.payer_name,
                    email:
                      paymentResponse?.payer_email ||
                      paymentResponse?.email ||
                      "",
                    amount: paymentResponse?.amount || 0,
                    reference: paymentResponse?.reference || "",
                    created_at:
                      paymentResponse?.payment_date || new Date().toISOString(),
                    type: "BPF",
                    recipient_scn: paymentResponse?.scn || "",
                    branch: (paymentRes as any)?.branch || "N/A", // user context branch
                    year_of_call: paymentResponse?.year_of_call || 0,
                    year: new Date().getFullYear(),
                    status: "Successful",
                    payment_type: "BPF",
                    payer_name: paymentResponse?.payer_name,
                  };

                  setPhotoInfo(receiptData);
                  navigate("/payment/bpfreceipt");
                }}
                dimension="lg"
              >
                Download Receipt
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      {steps.step1 && (
        <Modal
          isOpen={modalIsOpen}
          showCloseIcon={modalIsOpen}
          onClose={() => {
            funcModalIsOpen();
            setGroupYear("");
            setScnList(undefined);
            setSelectIndex(undefined);
          }}
          dimensions="lg"
        >
          <div>
            <h1 className="font-bold text-xl mb-3">BPF Payment</h1>
            <Tab.Group defaultIndex={selectIndex}>
              <div className="md:flex justify-between items-center text-sm ">
                <Tab.List class="lg:w-auto w-full flex-1 flex  border-b-[1px] border-gray-300">
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        '"pr-10 pb-2 border-b-[0.2rem]"',
                        selected
                          ? "border-b-[0.2rem] py-2  text-black border-primary-500 focus:outline-none"
                          : "text-gray-500 py-2 ",
                      )
                    }
                  >
                    <p className="pr-2 text-lg font-medium">
                      &nbsp; Individual
                    </p>
                  </Tab>
                  {/*<Tab
                    className={({ selected }) =>
                      classNames(
                        '"pl-20 pb-2 text-sm  border-b-[0.2rem]"',
                        selected
                          ? "border-b-[0.2rem] py-2  text-black border-primary-500 focus:outline-none"
                          : "text-gray-500 py-2 "
                      )
                    }
                  >
                    <p className="pr-2 text-lg font-medium"> &nbsp; Group</p>
                  </Tab>*/}
                </Tab.List>
              </div>

              <Tab.Panels>
                <Tab.Panel>
                  <form onSubmit={(e: any) => handleSubmit(e, true)}>
                    <div className="my-4 py-2.5 px-2 w-full bg-primary-100 rounded text-sm grid grid-cols-2 justify-between">
                      <p>Payer</p>
                      <p className="font-bold text-primary-500 text-right">
                        {user?.first_name + " " + user?.last_name}
                      </p>
                    </div>

                    <div className="mt-5 mb-5 w-full px-0.5">
                      <p className="text-sm px-1.5">Year</p>
                      <Input
                        variant="primary"
                        dimension="lg"
                        value={new Date().getFullYear()}
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="w-full text-gray-600  text-xs font-medium rounded  bg-yellow-500 bg-opacity-10 p-3 mt-3">
                      <span className="text-red-500 font-bold">Note:</span> To
                      ensure your transaction is processed accurately, please
                      update your profile category before making payment. Click{" "}
                      <Link to="/profile" className="text-blue-600">
                        Here
                      </Link>{" "}
                      to go to your profile.
                    </div>
                    <div className="mt-7 mb-5 w-full">
                      <Button
                        variant="primary"
                        dimension="lg"
                        type="submit"
                        isLoading={isLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </form>
                  <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
                    <button
                      type="button"
                      onClick={funcModalIsOpen}
                      className="text-black"
                    >
                      Cancel
                    </button>
                  </div>
                </Tab.Panel>
                {/*<Tab.Panel>
                  <div className="py-2">
                    <form onSubmit={(e: any) => handleSubmitGroup(e, true)}>
                      <div className="mt-5 w-full">
                        <Input
                          label="Year"
                          id="year"
                          dimension="lg"
                          variant="primary"
                          value={new Date().getFullYear()}
                          type="text"
                          autoComplete="state"
                          readOnly
                          disabled
                        />
                      </div>
                      <div className="mt-5 mb-5 w-full">
                        <div className="mt-5 mb-5 w-full">
                          <Input
                            label="Enrollment Number"
                            id="center"
                            dimension="lg"
                            variant={
                              scnList && scnList.length > 0
                                ? "primary"
                                : "danger"
                            }
                            value={scnValue}
                            placeholder="Enter Enrollment Number"
                            type="text"
                            autoComplete="SCN-Number"
                            onChange={handleChange}
                            rightSlot={() => {
                              return isLoading ? (
                                <PageLoader isOutlined={isLoading} />
                              ) : (
                                <></>
                              );
                            }}
                          />
                        </div>

                        {scnSearchInfo &&
                          scnSearchInfo?.length > 0 &&
                          scnSearchInfo.map((el, idx: number) => (
                            <div className="flex gap-5 mb-3 w-full border-b-[1px]">
                              <button
                                className=" border-gray-300 pb-3 text-xs text-left lg:text-sm text-gray-500 hover:text-primary-500 w-full"
                                onClick={(e) => handleArrList(e, el)}
                              >
                                {el.last_name +
                                  " " +
                                  el.first_name +
                                  " - " +
                                  el.scn}
                              </button>
                            </div>
                          ))}
                      </div>
                      <div className="mt-5 w-full justify-left items-center max-h-20 overflow-scroll grid grid-cols-3 gap-3">
                        {scnList &&
                          scnList.map((el, idx) => (
                            <div className="rounded bg-gray-100 w-32 p-1.5 inline-flex justify-between items-center h-fit">
                              {el.scn + "  "}{" "}
                              <XMarkIcon
                                className="text-red-500 h-5 w-5 hover:cursor-pointer"
                                onClick={() => removeScn(el.id)}
                              />
                            </div>
                          ))}
                      </div>
                      <div className="w-full text-gray-600 text-xs font-medium rounded  bg-yellow-500 bg-opacity-10 p-3 mt-5">
                        <span className="text-red-500 font-bold">Note:</span>{" "}
                        Participation in group payments is limited to lawyers
                        who have completed their sign-up process. We strongly
                        urge all lawyers to finish their sign-up process before
                        making payments.
                      </div>
                      <div className="mt-7 mb-5 w-full">
                        <Button
                          variant="primary"
                          dimension="lg"
                          type="submit"
                          isLoading={isLoading}
                          disabled={
                            !scnList || scnList.length === 0 ? true : false
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </form>
                    <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          funcModalIsOpen();
                          setGroupYear("");
                          setScnList(undefined);
                          setSelectIndex(undefined);
                        }}
                        className="text-black"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Tab.Panel>*/}
              </Tab.Panels>
            </Tab.Group>
          </div>
        </Modal>
      )}
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
              checkout: false,
            }));
            setGroupYear("");
            setScnList(undefined);
            setSelectIndex(undefined);
          }}
          dimensions="lg"
        >
          <div>
            <h1 className="font-bold text-xl mb-3">BPF Payment</h1>
            <Tab.Group>
              <div className="md:flex justify-between items-center text-sm ">
                <Tab.List class="lg:w-auto w-full flex-1 flex  border-b-[1px] border-gray-300">
                  {!groupYear && (
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          '"pr-10 pb-2 border-b-[0.2rem]"',
                          selected
                            ? "border-b-[0.2rem] py-2  text-black border-primary-500 focus:outline-none"
                            : "text-gray-500 py-2 ",
                        )
                      }
                    >
                      <p className="pr-2 text-lg font-medium">
                        {" "}
                        &nbsp; Individual
                      </p>
                    </Tab>
                  )}
                  {/*{groupYear && (
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          '"pl-20 pb-2 text-sm  border-b-[0.2rem]"',
                          selected
                            ? "border-b-[0.2rem] py-2  text-black border-primary-500 focus:outline-none"
                            : "text-gray-500 py-2 "
                        )
                      }
                    >
                      <p className="pr-2 text-lg font-medium"> &nbsp; Group</p>
                    </Tab>
                  )}*/}
                </Tab.List>
              </div>

              <Tab.Panels>
                {!groupYear && (
                  <Tab.Panel>
                    <div className="my-4 py-2.5 px-2 w-full bg-primary-100 rounded text-sm flex justify-between">
                      <p>Payment year</p>
                      <p className="font-bold text-primary-500">
                        {new Date().getFullYear()}
                      </p>
                    </div>
                    <div className="mt-5 mb-5 w-full py-7 flex flex-col justify-center items-center rounded border">
                      <p>Total Amount</p>
                      <h1 className="font-bold text-4xl">
                        &#8358;{paymentRes?.total_payment.toLocaleString()}
                      </h1>
                    </div>

                    {!steps.checkout && (
                      <div className="mt-7 mb-5 w-full">
                        <Button
                          variant="primary"
                          dimension="lg"
                          type="button"
                          onClick={(e: any) => funcGenerateInvoice(null)}
                          isLoading={generateInvoiceRequest.isLoading}
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    )}

                    {steps.checkout && (
                      <>
                        <div className="flex flex-col gap-2 mb-6">
                          <div className="flex gap-4">
                            {/* <Button
                              type="button"
                              dimension="md" // or "sm", "lg", depending on design
                              variant={
                                selectedGateway === "FLUTTERWAV"
                                  ? "primary"
                                  : "secondary"
                              }
                              onClick={() => setSelectedGateway("FLUTTERWAV")}
                            >
                              Use Flutterwave
                            </Button> */}
                            {/*    <Button
      type="button"
      dimension="md" // or "sm", "lg", depending on design
      variant={selectedGateway === "eTranzact" ? "primary" : "secondary"}
      onClick={() => setSelectedGateway("eTranzact")}
    >
      Use eTranzact
    </Button>*/}
                          </div>
                          <p className="text-sm text-gray-600">
                            Selected Gateway:{" "}
                            <span className="font-semibold text-primary-500">
                              {selectedGateway === "FLUTTERWAV"
                                ? "Flutterwave"
                                : "eTranzact"}
                            </span>
                          </p>
                        </div>

                        <div className=" mb-5 w-full border-b-[1px] border-gray-300 max-h-28 overflow-y-scroll">
                          {paymentRes &&
                            paymentRes.invoice_recipients.map((el, idx) => (
                              <div className="flex w-full py-3 px-2 text-gray-500 font-semibold justify-between items-center text-sm border-t-[1px] border-gray-300">
                                <p>{el.scn}</p>
                                <p>{el.name}</p>
                                <p className="text-black">
                                  &#8358;{el.amount_due}
                                </p>
                              </div>
                            ))}
                        </div>

                        <div className="mt-7 mb-5">
                          <div className="mt-7 mb-5">
                            <div className="flex flex-col gap-3">
                              {selectedGateway === "FLUTTERWAV" && (
                                <Button
                                  variant="primary"
                                  dimension="lg"
                                  type="button"
                                  onClick={() => {
                                    if ((invoiceRes as any)?.payment_link) {
                                      setPaymentUrl(
                                        (invoiceRes as any).payment_link,
                                      );
                                      setGatewayModalOpen(true);
                                    } else {
                                      NotifyError("Payment link not found");
                                    }
                                  }}
                                >
                                  Proceed to Payment
                                </Button>
                              )}

                              {selectedGateway === "eTranzact" && (
                                <EtrasactAPI
                                  tx_ref={invoiceRes?.reference!}
                                  amount={invoiceRes?.total_payment!}
                                  email={invoiceRes?.customer_email + ""}
                                  name={invoiceRes?.customer_name + ""}
                                  completePayment={completePayment}
                                  label="Pay with eTranzact"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
                      {!steps.checkout ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSteps((prev: any) => ({
                              ...prev,
                              step1: true,
                              step2: false,
                              checkout: false,
                            }));
                          }}
                          className="text-black"
                        >
                          Back
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            funcModalIsOpen();
                            setSteps((prev: any) => ({
                              ...prev,
                              step1: true,
                              step2: false,
                              checkout: false,
                            }));
                          }}
                          className="text-black"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </Tab.Panel>
                )}
                {/*{groupYear && (
                  <Tab.Panel>
                    <div className="my-4 py-2.5 px-2 w-full bg-primary-100 rounded text-sm flex justify-between">
                      <p>Payment year</p>
                      <p className="font-bold text-primary-500">
                        {new Date().getFullYear()}
                      </p>
                    </div>
                    <div className="mt-5 mb-5 w-full py-7 flex flex-col justify-center items-center rounded border">
                      <p>Total Amount</p>
                      <h1 className="font-bold text-4xl">
                        &#8358;{paymentRes?.total_payment.toLocaleString()}
                      </h1>
                    </div>
                    {!steps.checkout && (
                      <div className="mt-7 mb-5 w-full">
                        <Button
                          variant="primary"
                          dimension="lg"
                          type="button"
                          onClick={(e: any) => funcGenerateInvoice(null)}
                          isLoading={generateInvoiceRequest.isLoading}
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    )}

                    {steps.checkout && (
                      <>
                        <div className="flex flex-col gap-2 mb-6">
                          <div className="flex gap-4">
                            <Button
                              type="button"
                              dimension="md" // or "sm", "lg", depending on design
                              variant={
                                selectedGateway === "FLUTTERWAV"
                                  ? "primary"
                                  : "secondary"
                              }
                              onClick={() => setSelectedGateway("FLUTTERWAV")}
                            >
                              Use Flutterwave
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">
                            Selected Gateway:{" "}
                            <span className="font-semibold text-primary-500">
                              {selectedGateway === "FLUTTERWAV"
                                ? "Flutterwave"
                                : "eTranzact"}
                            </span>
                          </p>
                        </div>
                        <div className=" mb-5 w-full border-b-[1px] border-gray-300 max-h-28 overflow-y-scroll">
                          {paymentRes?.invoice_recipients.map((el, idx) => (
                            <div className="flex w-full py-3 px-2 text-gray-500 font-semibold justify-between items-center text-sm border-t-[1px] border-gray-300">
                              <p>{el.scn}</p>
                              <p>{el.name}</p>
                              <p className="text-black pr-2">
                                &#8358;{el.amount_due}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-7 mb-5">
                          <div className="mt-7 mb-5">
                            <div className="flex flex-col gap-3">
                              {selectedGateway === "FLUTTERWAV" && (
                                <Button
                                  variant="primary"
                                  dimension="lg"
                                  type="button"
                                  onClick={() => {
                                      if ((invoiceRes as any)?.payment_link) {
                                          window.location.href = (invoiceRes as any).payment_link;
                                      } else {
                                          NotifyError("Payment link not found");
                                      }
                                  }}
                                >
                                  Proceed to Payment
                                </Button>
                              )}

                              {selectedGateway === "eTranzact" && (
                                <EtrasactAPI
                                  tx_ref={invoiceRes?.reference!}
                                  amount={invoiceRes?.total_payment!}
                                  email={invoiceRes?.customer_email + ""}
                                  name={invoiceRes?.customer_name + ""}
                                  completePayment={completePayment}
                                  label="Pay with eTranzact"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
                      {!steps.checkout ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSteps((prev: any) => ({
                              ...prev,
                              step1: true,
                              step2: false,
                              checkout: false,
                            }));
                            setSelectIndex(1);
                          }}
                          className="text-black"
                        >
                          Back
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            funcModalIsOpen();
                            setSteps((prev: any) => ({
                              ...prev,
                              step1: true,
                              step2: false,
                              checkout: false,
                            }));
                            setGroupYear("");
                            setScnList(undefined);
                            setSelectIndex(undefined);
                          }}
                          className="text-black"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </Tab.Panel>
                )}*/}
              </Tab.Panels>
            </Tab.Group>
          </div>
        </Modal>
      )}
    </>
  );
};
export default BPFPayment;
