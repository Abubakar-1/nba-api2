import PageTitle from "@/components/ui/page-title";
import RegistrationProgressBar from "@/components/ui/registration-progress-bar";
import { useEffect, useState } from "preact/hooks";
import Register from "@/components/conference/register";
import Preview from "@/components/conference/preview";
import Complete from "@/components/conference/complete";
import { IConferencePaymentDetails } from "@/api/interfaces/conference";
const Conference = () => {
  const [stage, changeStage] = useState<number>(1);
  const [formValue, setFormValue] = useState<any>();
  const [paymentInfo, setPaymentInfo] = useState<IConferencePaymentDetails>();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [stage]);
  return (
    <div className="px-4 mb-5">
      <PageTitle title="Conference" />
      <div className="flex -mt-4 ">
        <div className="hidden mt-7 lg:block w-1/4">
          <RegistrationProgressBar stage={stage} />
        </div>
        {stage === 1 && (
          <Register changeStage={changeStage} setFormValue={setFormValue} />
        )}
        {stage === 2 && (
          <Preview
            // setRefNo={seRefNo}
            changeStage={changeStage}
            formValue={formValue}
            setPaymentInfo={setPaymentInfo}
          />
        )}
        {stage === 3 && <Complete paymentInfo={paymentInfo} />}
      </div>
    </div>
  );
};

export default Conference;
