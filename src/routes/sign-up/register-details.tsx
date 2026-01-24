import { FunctionalComponent } from "preact";
import { useState, useEffect } from "preact/hooks";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Checkbox from "@/components/ui/checkbox";
import LoginStepBar from "@/components/ui/login-step-bar";
import LoginStepCheck from "@/components/ui/login-step-check";
import { registerUserApi, getAuthBranches } from "@/api/auth";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Support from "@/components/ui/support";
import PageTitle from "@/components/ui/page-title";

interface IRegisterDetailsProps {
  scn: string;
  userData: any;
  onNext: (email: string) => void;
  onBack: () => void;
  activatePage: (page: string) => void;
}

const RegisterDetails: FunctionalComponent<IRegisterDetailsProps> = ({
  scn,
  userData,
  onNext,
  onBack,
  activatePage,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    exam_no: userData?.user?.exam_no || "",
    first_name: userData?.user?.first_name || "",
    last_name: userData?.user?.last_name || "",
    middle_name: userData?.user?.middle_name || "",
    gender: userData?.user?.gender || "",
    phone: userData?.user?.phone || "",
    email: userData?.user?.email || "",
    branch: userData?.user?.branch || "",
    date_of_call: userData?.user?.date_of_call || "",
    year_of_call: userData?.user?.year_of_call?.toString() || "",
    area_of_practice: userData?.user?.area_of_practice || "",
  });

  const signUpStepArray = [
    { name: "Enter SCN", state: true },
    { name: "Register", state: true },
    { name: "Verify Email", state: false },
    { name: "Create Password", state: false },
  ];

  useEffect(() => {
    // Fetch branches
    const fetchBranches = async () => {
      const [response, error] = await getAuthBranches();
      if (!error && response) {
        // Handle both possible response structures
        if (response.data) {
          setBranches(response.data);
        } else if (Array.isArray(response)) {
          setBranches(response);
        }
      }
    };
    fetchBranches();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Check if user agreed to terms
    if (!agreed) {
      NotifyError("Please confirm that the information provided is accurate");
      return;
    }

    // Validation - only check email field
    if (!formData.email) {
      NotifyError("Please enter an email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      NotifyError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Only send SCN and email
      const requestBody: any = {
        // scn,
        email: formData.email,
      };

      const [response, error] = await registerUserApi(requestBody);

      if (error) {
        NotifyError(
          error?.data?.message ||
            error?.message ||
            error.message[0] ||
            "Registration failed",
        );
        setIsLoading(false);
        return;
      }

      NotifySuccess("Registration successful! Please verify your email.");
      onNext(formData.email);
    } catch (err: any) {
      NotifyError(err?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-w-full min-h-screen p-4 lg:px-[10%] lg:pt-[5%] 2xl:px-[15%] flex flex-col justify-start items-start">
      <PageTitle title="Sign Up - Register" />

      {/* Progress Steps */}
      <div className="h-fit w-full flex justify-evenly items-center mb-10 lg:-ml-4">
        {signUpStepArray.map((el, id) => (
          <div
            key={id}
            className={`hidden md:flex justify-evenly items-center w-full ${
              el.name === "Create Password" && "!justify-start"
            }`}
          >
            <LoginStepCheck
              state={el.state}
              value={el.name}
              onClick={() => el.state && activatePage(el.name)}
            />
            {el.name !== "Create Password" && <LoginStepBar state={el.state} />}
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-10">
        <Link
          to="/signup"
          className="w-24 text-left text-black font-semibold border-b-[0.19rem] border-primary-500 focus:outline-none py-2"
        >
          &nbsp; Sign Up
        </Link>
        <Link
          to="/login"
          className="pl-2 w-24 text-left text-gray-500 border-gray-300 border-b-[0.1rem] py-2"
        >
          &nbsp; Login
        </Link>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full lg:w-3/4 mb-3 flex flex-col items-start"
      >
        <h1 className="font-bold mb-2 text-2xl text-gray-800">
          {/* Complete your registration */}
          Preview your information
        </h1>

        <p className="text-gray-500 mb-5 font-light text-sm text-left">
          Please enter your email address and select the checkbox then click on
          the "Next" button to complete your registration.
        </p>

        <div className="w-full space-y-4">
          {/* SCN (Read-only) */}
          <Input
            label="SCN"
            id="scn"
            dimension="lg"
            variant="primary"
            value={scn}
            type="text"
            disabled
          />

          {/* Exam Number (Read-only) */}
          {/* <Input
            label="Exam Number"
            id="exam_no"
            dimension="lg"
            variant="primary"
            value={formData.exam_no}
            placeholder="e.g., EXM/2023/001"
            type="text"
            disabled
          /> */}

          {/* Email */}
          <Input
            label="Email Address *"
            id="email"
            dimension="lg"
            variant="primary"
            value={formData.email}
            placeholder="your.email@example.com"
            type="email"
            onChange={(e) =>
              handleChange("email", (e.target as HTMLInputElement).value)
            }
          />

          {/* First Name (Read-only) */}
          <Input
            label="First Name"
            id="first_name"
            dimension="lg"
            variant="primary"
            value={formData.first_name}
            placeholder="First name"
            type="text"
            disabled
          />

          {/* Last Name (Read-only) */}
          <Input
            label="Last Name"
            id="last_name"
            dimension="lg"
            variant="primary"
            value={formData.last_name}
            placeholder="Last name"
            type="text"
            disabled
          />

          {/* Middle Name (Read-only) */}
          <Input
            label="Middle Name"
            id="middle_name"
            dimension="lg"
            variant="primary"
            value={formData.middle_name}
            placeholder="Middle name"
            type="text"
            disabled
          />

          {/* Gender */}
          {/* <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <Select
              dimension="lg"
              value={formData.gender}
              onChange={(e) =>
                handleChange("gender", (e.target as HTMLSelectElement).value)
              }
              disabled
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </Select>
          </div> */}

          {/* Phone */}
          <Input
            label="Phone Number"
            id="phone"
            dimension="lg"
            variant="primary"
            value={formData.phone}
            placeholder="+2348012345678"
            type="tel"
            onChange={(e) =>
              handleChange("phone", (e.target as HTMLInputElement).value)
            }
            disabled
          />

          {/* Branch */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch
            </label>
            <Select
              dimension="lg"
              value={formData.branch}
              onChange={(e) =>
                handleChange("branch", (e.target as HTMLSelectElement).value)
              }
              disabled
            >
              <option value="">Select Branch</option>
              {branches.map((branch: any) => (
                <option key={branch.code} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Year of Call */}
          {/* <Input
            label="Year of Call"
            id="year_of_call"
            dimension="lg"
            variant="primary"
            value={formData.year_of_call}
            placeholder="e.g., 2015"
            type="text"
            maxLength={4}
            onChange={(e) => {
              const value = (e.target as HTMLInputElement).value.replace(
                /\D/g,
                "",
              );
              handleChange("year_of_call", value);
            }}
            disabled
          /> */}

          {/* Legal Practice Area */}
          {/* <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legal Practice Area
            </label>
            <Select
              dimension="lg"
              value={formData.area_of_practice}
              onChange={(e) =>
                handleChange(
                  "area_of_practice",
                  (e.target as HTMLSelectElement).value,
                )
              }
              disabled
            >
              <option value="">Select Practice Area</option>
              <option value="CORPORATE_AND_COMMERCIAL_LAW">
                Corporate and Commercial Law
              </option>
              <option value="CRIMINAL_LAW">Criminal Law</option>
              <option value="FAMILY_LAW">Family Law</option>
              <option value="LABOUR_AND_EMPLOYMENT_LAW">
                Labour and Employment Law
              </option>
              <option value="TAX_LAW">Tax Law</option>
              <option value="IMMIGRATION_LAW">Immigration Law</option>
              <option value="INTELLECTUAL_PROPERTY_LAW">
                Intellectual Property Law
              </option>
              <option value="BANKING_AND_FINANCE_LAW">
                Banking and Finance Law
              </option>
              <option value="DISPUTE_RESOLUTION">Dispute Resolution</option>
              <option value="CONSTITUTIONAL_LAW">Constitutional Law</option>
              <option value="ENVIRONMENTAL_LAW">Environmental Law</option>
              <option value="ENERGY_AND_NATURAL_RESOURCES_LAW">
                Energy and Natural Resources Law
              </option>
              <option value="MARITIME_AND_ADMIRALTY_LAW">
                Maritime and Admiralty Law
              </option>
              <option value="INSURANCE_LAW">Insurance Law</option>
              <option value="ARBITRATION_AND_ALTERNATIVE_DISPUTE_RESOLUTION">
                Arbitration and Alternative Dispute Resolution
              </option>
              <option value="HEALTH_LAW">Health Law</option>
              <option value="TELECOMMUNICATIONS_LAW">
                Telecommunications Law
              </option>
              <option value="TECHNOLOGY_AND_START_UP_LAW">
                Technology and Start-up Law
              </option>
              <option value="AVIATION_LAW">Aviation Law</option>
              <option value="ENTERTAINMENT_LAW">Entertainment Law</option>
              <option value="SPORTS_LAW">Sports Law</option>
              <option value="MEDIA_LAW">Media Law</option>
              <option value="INTERNATIONAL_LAW">International Law</option>
              <option value="HUMAN_RIGHTS_LAW">Human Rights Law</option>
              <option value="COMPETITION_LAW">Competition Law</option>
              <option value="CONSTRUCTION_LAW">Construction Law</option>
              <option value="PUBLIC_PROCUREMENT_LAW">
                Public Procurement Law
              </option>
              <option value="TRUSTS_AND_ESTATES_LAW">
                Trusts and Estates Law
              </option>
              <option value="SECURITIES_LAW">Securities Law</option>
              <option value="EDUCATION_LAW">Education Law</option>
              <option value="PROPERTY_AND_REAL_ESTATE_LAW">
                Property and Real Estate Law
              </option>
              <option value="JUDICIAL_OFFICER">Judicial Officer</option>
              <option value="CIVIL_SERVICE">Civil Service</option>
              <option value="OTHERS">Others</option>
            </Select>
          </div> */}

          {/* Agreement Checkbox */}
          <div className="mt-5 mb-5 w-full flex gap-3">
            <Checkbox
              dimension="md"
              variant="primary"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
            />
            <p className="text-gray-500 text-xs -mt-1">
              By ticking this box, I confirm that the information I have
              provided is both accurate and mine. I acknowledge that any errors
              or inaccuracies in the information provided are my responsibility
              and may have consequences in the future.
            </p>
          </div>
        </div>

        <div className="mt-7 w-full flex gap-4">
          <Button
            type="button"
            dimension="lg"
            variant="outline"
            onClick={onBack}
            className="flex-1 border-1 border-[black] rounded-full"
          >
            Back
          </Button>
          <Button
            type="submit"
            dimension="lg"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
            className="flex-1  bg-primary-500 p-4 text-white rounded-full"
          >
            Next
          </Button>
        </div>
      </form>

      <Support />
    </div>
  );
};

export default RegisterDetails;
