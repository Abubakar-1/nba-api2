import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { useState } from "preact/hooks";

// ============================================
// NEW SIGNUP FLOW COMPONENTS
// ============================================
import EnterSCN from "./enter-scn";
import RegisterDetails from "./register-details";
import VerifyEmail from "./verify-email";
import CreatePasswordNew from "./create-password-new";

// ============================================
// OLD SIGNUP FLOW COMPONENTS (COMMENTED OUT)
// ============================================
// import CreatePassword from "./create-password";
// import SignUpAccount from "./sign-up-account";
// import UpdateBio from "./update-bio";
// import VerifyAccount from "./verify-account";
// import VerifyBio from "./verify-bio";

const SignUp: FunctionalComponent = () => {
  // ============================================
  // NEW SIGNUP FLOW STATE
  // ============================================
  const [currentStep, setCurrentStep] = useState<
    "enterSCN" | "register" | "verifyEmail" | "createPassword"
  >("enterSCN");
  const [scn, setSCN] = useState("");
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState<any>(null);

  const funcResetStep = (val: string) => {
    if (val === "Enter SCN") {
      setCurrentStep("enterSCN");
    } else if (val === "Register") {
      setCurrentStep("register");
    } else if (val === "Verify Email") {
      setCurrentStep("verifyEmail");
    } else if (val === "Create Password") {
      setCurrentStep("createPassword");
    }
  };

  return (
    <>
      {/* Step 1: Enter SCN */}
      {currentStep === "enterSCN" && (
        <EnterSCN
          onNext={(scnValue, userDataValue) => {
            setSCN(scnValue);
            setUserData(userDataValue);
            setCurrentStep("register");
          }}
          activatePage={funcResetStep}
        />
      )}

      {/* Step 2: Register with Details */}
      {currentStep === "register" && (
        <RegisterDetails
          scn={scn}
          userData={userData}
          onNext={(emailValue) => {
            setEmail(emailValue);
            setCurrentStep("verifyEmail");
          }}
          onBack={() => setCurrentStep("enterSCN")}
          activatePage={funcResetStep}
        />
      )}

      {/* Step 3: Verify Email OTP */}
      {currentStep === "verifyEmail" && (
        <VerifyEmail
          email={email}
          onNext={() => setCurrentStep("createPassword")}
          onBack={() => setCurrentStep("register")}
          activatePage={funcResetStep}
        />
      )}

      {/* Step 4: Create Password */}
      {currentStep === "createPassword" && (
        <CreatePasswordNew
          email={email}
          onBack={() => setCurrentStep("verifyEmail")}
          activatePage={funcResetStep}
        />
      )}
    </>
  );

  // ============================================
  // OLD SIGNUP FLOW CODE (COMMENTED OUT)
  // ============================================
  /*
  const navigate = useNavigate();
  const [resetSignUpState, setResetSignUpState] = useState({
    signUp: true,
    confirm: false,
    updateBio: false,
    verifyAccount: false,
    verifyBio: false,
    createPassword: false,
    email: "",
  });

  const funcResetStep = (val: string) => {
    if (val === "SCN & Year") {
      setResetSignUpState((prev) => ({
        ...prev,
        signUp: true,
        confirm: false,
        updateBio: false,
        verifyAccount: false,
        verifyBio: false,
        createPassword: false,
      }));
    } else if (val === "Verify Bio") {
      setResetSignUpState((prev) => ({
        ...prev,
        signUp: false,
        confirm: false,
        updateBio: false,
        verifyAccount: false,
        verifyBio: true,
        createPassword: false,
      }));
    } else if (val === "Update Bio") {
      setResetSignUpState((prev) => ({
        ...prev,
        signUp: false,
        confirm: false,
        updateBio: true,
        verifyAccount: false,
        verifyBio: false,
        createPassword: false,
      }));
    } else if (val === "Verify Account") {
      setResetSignUpState((prev) => ({
        ...prev,
        signUp: false,
        confirm: false,
        updateBio: false,
        verifyAccount: true,
        verifyBio: false,
        createPassword: false,
      }));
    } else if (val === "Create Password") {
      setResetSignUpState((prev) => ({
        ...prev,
        signUp: false,
        confirm: false,
        updateBio: false,
        verifyAccount: false,
        verifyBio: false,
        createPassword: true,
      }));
    }
  };

  return (
    <>
      {resetSignUpState.signUp && (
        <SignUpAccount
          onClick={() =>
            setResetSignUpState((prev) => ({
              ...prev,
              signUp: false,
              confirm: false,
              updateBio: false,
              verifyBio: true,
              verifyAccount: false,
              createPassword: false,
            }))
          }
          activatePage={funcResetStep}
        />
      )}
      {resetSignUpState.verifyBio && (
        <VerifyBio
          onClick={() =>
            setResetSignUpState((prev) => ({
              ...prev,
              signUp: false,
              confirm: false,
              updateBio: true,
              verifyBio: false,
              verifyAccount: false,
              createPassword: false,
            }))
          }
          activatePage={funcResetStep}
          previousPage={() =>
            setResetSignUpState((prev) => ({
              ...prev,
              signUp: true,
              confirm: false,
              updateBio: false,
              verifyBio: false,
              verifyAccount: false,
              createPassword: false,
            }))
          }
        />
      )}
      {resetSignUpState.updateBio && (
        <UpdateBio
          onClick={() =>
            setResetSignUpState((prev) => ({
              ...prev,
              signUp: false,
              confirm: false,
              updateBio: false,
              verifyBio: false,
              verifyAccount: true,
              createPassword: false,
            }))
          }
          activatePage={funcResetStep}
          previousPage={() =>
            setResetSignUpState((prev) => ({
              ...prev,
              signUp: false,
              confirm: false,
              updateBio: false,
              verifyBio: true,
              verifyAccount: false,
              createPassword: false,
            }))
          }
        />
      )}

      {resetSignUpState.verifyAccount && (
        <VerifyAccount
          onClick={() =>
            setResetSignUpState((prev) => ({
              ...prev,
              signUp: false,
              confirm: false,
              updateBio: false,
              verifyBio: false,
              verifyAccount: false,
              createPassword: true,
            }))
          }
          activatePage={funcResetStep}
          previousPage={() =>
            setResetSignUpState((prev) => ({
              ...prev,
              signUp: false,
              confirm: false,
              updateBio: true,
              verifyBio: false,
              verifyAccount: false,
              createPassword: false,
            }))
          }
        />
      )}
      {resetSignUpState.createPassword && (
        <CreatePassword
          onClick={() => navigate("/login")}
          activatePage={funcResetStep}
        />
      )}
    </>
  );
  */
};

export default SignUp;
