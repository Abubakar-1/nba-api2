import {
  BacklogPaymentProp,
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
import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { FunctionalComponent, Fragment } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import {
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
import { PaymentGatewayModal } from "@/components/ui/payment-gateway-modal";

interface IBacklogPayment {
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

const Backlog: FunctionalComponent<IBacklogPayment> = ({
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

  const [groupYear, setGroupYear] = useState<string>();
  const [paymentRes, setPaymentRes] = useState<BPFPaymentResProps>();
  const [invoiceRes, setInvoiceRes] = useState<BPFPaymentInvoiceProps>();
  // const [scnSearchInfo, setScnSearchInfo] = useState<ISignUp[]>();
  // const [scnList, setScnList] = useState<SCNListProps[]>();
  const [yearList, setYearList] = useState<string[]>();

  const [yearValue, setYearValue] = useState<string>();

  const [paymentResponse, setPaymentResponse] = useState<verifyResProps>();
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const { user } = AuthContext.useContainer();
  const { makeRequest, isLoading } =
    useRequest<BacklogPaymentProp>(paymentInvoice);

  const verifyScnRequest = useRequest<{ scn: string }>(verifySignUpSCNApi);

  const generateInvoiceRequest = useRequest<BacklogPaymentProp>(
    generateInvoicePreview,
  );
  const verifyPaymentRequest = useRequest(verifyPayment);

  interface resProps {
    amountDue: number;
    ok: boolean;
    message: string;
    year: number;
  }
  async function funcPreviewInvoice(body: any) {
    const [response, _err] = await makeRequest(body);
    if (!_err) {
      if (!response?.amount) {
        NotifyError("Invalid response from server");
      } else {
        setPaymentRes({
          ok: true,
          total_payment: response.amount,
          backlog: response.backlog || [],
          year: new Date().getFullYear(),
        } as any);

        // Store common info for checkout
        setInvoiceRes({
          ...response,
          total_payment: response.amount,
          reference: response.reference,
          customer_email: user?.email || "",
          customer_name: `${user?.first_name} ${user?.last_name}`,
          callback_url: body.redirect_url,
        } as any);

        setSteps((prev: any) => ({
          ...prev,
          step1: false,
          step2: true,
          checkout: false,
        }));
      }
    } else if (_err && _err?.data) {
      NotifyError(
        _err?.data?.message || _err?.data?.info || "An error occurred",
      );
      return;
    } else {
      NotifyError(_err?.info || "An error occurred");
      return;
    }
  }

  async function funcGenerateInvoice(body: any) {
    // With new API, preview already initialized or we just transition to checkout
    setSteps((prev: any) => ({
      ...prev,
      step1: false,
      step2: true,
      checkout: true,
    }));
  }

  const funcVerifyPayment = useCallback(
    async (val: string) => {
      const [response, _err] = await verifyPaymentRequest.makeRequest({
        ref: val,
      });
      setPaymentResponse(response);
      if (!_err) {
        if (refresh) refresh();
        setSuccessModal(true);
      } else if (_err && _err?.data) {
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
    },
    [verifyPaymentRequest.makeRequest],
  );

  const handleSubmit = (e: any, preview: boolean) => {
    e.preventDefault();
    if (!user?.id) {
      NotifyError("User identity session not found. Please re-login.");
      return;
    }

    const payload: any = {
      backlog: yearList ?? [],
      payment_gateway: "flutterwave",
      redirect_url: window.location.origin + "/transaction",
    };

    // Both preview and generate now use the same initialization logic on api2
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
      // setScnList(undefined);
    }, 3000);
  };

  async function verifyUser(scn: string) {
    const [response, _err] = await verifyScnRequest.makeRequest({
      scn: scn,
    });
    if (!_err) {
      // setScnSearchInfo(response);
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
    setYearValue((e.target as HTMLInputElement).value.replace(/\s+/g, ""));
    // handleSearch((e.target as HTMLInputElement).value.replace(/\s+/g, ""));
    // setSelected(false);
  };

  const removeYear = (year: string) => {
    const filterYearList = yearList?.filter((el) => el !== year);
    setYearList(filterYearList);
  };

  const handleArrList = (e: any, el: string) => {
    if (
      yearList &&
      !yearList.some((item) => {
        return item === el;
      })
    ) {
      isWithinDateRange(el) && setYearList([...yearList, el]);
    } else if (!yearList) {
      isWithinDateRange(el) && setYearList([el]);
    }
    setYearValue("");

    e.preventDefault();
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
          <div className="mt-10 w-full">
            <Button
              type="button"
              variant="primary"
              onClick={() => setSuccessModal(!successModal)}
              dimension="lg"
            >
              Close
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
            setYearList(undefined);
          }}
          dimensions="lg"
        >
          <div>
            <h1 className="font-bold text-xl mb-3">Backlog Payment</h1>
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
                </Tab.List>
              </div>

              <Tab.Panels>
                <Tab.Panel>
                  <form onSubmit={(e: any) => handleSubmit(e, true)}>
                    <div className="my-4 py-2.5 px-2 w-full bg-primary-100 rounded text-sm grid grid-cols-2 justify-between">
                      <p>Payer</p>
                      <p className="font-bold text-primary-500 text-right">
                        {user?.last_name + " " + user?.first_name}
                      </p>
                    </div>

                    <div className="mt-5 mb-5 w-full px-0.5 flex gap-3 justify-center items-center">
                      <div className="w-full">
                        <Input
                          label="Year"
                          id="center"
                          dimension="lg"
                          variant="primary"
                          value={yearValue}
                          placeholder="Enter backlog year"
                          type="text"
                          autoComplete="backlog-year"
                          onChange={handleChange}
                        />
                      </div>
                      <div className="w-20 mt-5">
                        <Button
                          className={`border-primary-500 border rounded-3xl py-2 px-4  ${classNames(
                            {
                              "bg-primary-500 text-white": yearValue,
                            },
                          )}`}
                          type="button"
                          variant={!yearValue ? "outline" : "primary"}
                          dimension="md"
                          // disabled={!yearValue}
                          onClick={(e) => handleArrList(e, yearValue + "")}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    <div className="mt-5 w-full justify-left items-center max-h-20 overflow-scroll grid grid-cols-3 gap-3">
                      {yearList &&
                        yearList.map((el, idx) => (
                          <div className="rounded bg-gray-100 w-32 p-1.5 inline-flex justify-between items-center h-fit">
                            {el + "  "}{" "}
                            <XMarkIcon
                              className="text-red-500 h-5 w-5 hover:cursor-pointer"
                              onClick={() => removeYear(el)}
                            />
                          </div>
                        ))}
                    </div>
                    <div className="mt-7 mb-5 w-full">
                      <Button
                        variant="primary"
                        dimension="lg"
                        type="submit"
                        isLoading={isLoading}
                        disabled={!(yearList && yearList.length > 0)}
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
                        ("");
                        setYearList(undefined);
                      }}
                      className="text-black"
                    >
                      Cancel
                    </button>
                  </div>
                </Tab.Panel>
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
            setYearList(undefined);
          }}
          dimensions="lg"
        >
          <div>
            <h1 className="font-bold text-xl mb-3">Backlog Payment</h1>
            <Tab.Group>
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
                </Tab.List>
              </div>

              <Tab.Panels>
                <Tab.Panel>
                  <div className="my-4 py-2.5 px-2 w-full bg-primary-100 rounded text-sm flex justify-between">
                    <p>Payment year</p>
                    <p className="font-bold text-primary-500">
                      {new Date().getFullYear()}
                    </p>
                  </div>
                  {!steps.checkout && (
                    <>
                      <div className="mt-5 mb-5 w-full py-7 flex flex-col justify-center items-center rounded border">
                        <p>Total Amount</p>
                        <h1 className="font-bold text-4xl">
                          &#8358;{paymentRes?.total_payment.toLocaleString()}
                        </h1>
                      </div>

                      <div className="mt-7 mb-5 w-full">
                        <Button
                          variant="primary"
                          dimension="lg"
                          type="button"
                          onClick={(e: any) => handleSubmit(e, false)}
                          isLoading={generateInvoiceRequest.isLoading}
                        >
                          Preview
                        </Button>
                      </div>
                    </>
                  )}

                  {steps.checkout && (
                    <>
                      <div className="mt-5 mb-5 w-full py-7 flex flex-col justify-center items-center rounded border">
                        <p>Total Amount</p>
                        <h1 className="font-bold text-4xl">
                          &#8358;{invoiceRes?.total_payment.toLocaleString()}
                        </h1>
                      </div>

                      <div className=" mb-5 w-full border-b-[1px] border-gray-300 max-h-28 overflow-y-scroll">
                        {paymentRes?.backlog &&
                          paymentRes.backlog.map((el, idx) => (
                            <div className="flex w-full py-3 px-2 text-gray-500 font-semibold justify-evenly items-center text-sm border-t-[1px] border-gray-300">
                              <p>Year: {el.year}</p>
                              <p>
                                Amount: &#8358;{el.amountDue.toLocaleString()}
                              </p>
                            </div>
                          ))}
                      </div>

                      <div className="mt-7 mb-5">
                        <Button
                          variant="primary"
                          dimension="lg"
                          type="button"
                          onClick={() => {
                            const paymentLink =
                              (invoiceRes as any)?.payment_link ||
                              (invoiceRes as any)?.authorization_url;
                            if (paymentLink) {
                              setPaymentUrl(paymentLink);
                              setGatewayModalOpen(true);
                            } else if (invoiceRes?.reference) {
                              // Fallback to manual component if no link but we have ref
                              // Wait, the component might not work without pk
                              NotifyError(
                                "Payment link not found. Please try again.",
                              );
                            }
                          }}
                        >
                          Proceed to Payment
                        </Button>
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
                          setYearList(undefined);
                        }}
                        className="text-black"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </Modal>
      )}
      <PaymentGatewayModal
        isOpen={gatewayModalOpen}
        onClose={() => setGatewayModalOpen(false)}
        paymentUrl={paymentUrl}
      />
    </>
  );
};
export default Backlog;
