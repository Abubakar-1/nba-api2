import { FunctionalComponent } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import AuthContext from "@/context/auth-context";
import {
  getBranchInformation,
  createBranchDues,
  updateBranchDues,
  editBranch,
} from "@/api/branch";
import { useFetcher } from "@/components/hooks/use-fetcher";

const basicInfoSchema = yup.object({
  branchCode: yup.string().required("Branch code is required"),
  branchName: yup.string().required("Branch name is required"),
  managerName: yup.string().required("Manager name is required"),
  managerSCN: yup.string().required("Manager SCN is required"),
  managerEmail: yup
    .string()
    .email("Invalid email address")
    .required("Manager email is required"),
  branchAddress: yup.string().required("Branch address is required"),
});

const duesSchema = yup.object({
  oneToFourYears: yup
    .number()
    .min(0, "Must be 0 or greater")
    .required("Required"),
  fiveToNineYears: yup
    .number()
    .min(0, "Must be 0 or greater")
    .required("Required"),
  tenToFourteenYears: yup
    .number()
    .min(0, "Must be 0 or greater")
    .required("Required"),
  fifteenYearsAndAbove: yup
    .number()
    .min(0, "Must be 0 or greater")
    .required("Required"),
  seniorAdvocates: yup
    .number()
    .min(0, "Must be 0 or greater")
    .required("Required"),
  honorableBenches: yup
    .number()
    .min(0, "Must be 0 or greater")
    .required("Required"),
});

const BranchAdminDetail: FunctionalComponent = () => {
  const navigate = useNavigate();
  const { user } = AuthContext.useContainer();
  // console.log(user);
  const [isSubmittingBasic, setIsSubmittingBasic] = useState(false);
  const [isSubmittingDues, setIsSubmittingDues] = useState(false);

  const branchName =
    user?.branch_name ||
    (typeof user?.branch === "string" ? user?.branch : user?.branch?.name) ||
    "";

  const { response: branchInfo, makeRequest } =
    useFetcher(getBranchInformation);

  useEffect(() => {
    if (branchInfo) {
      console.log("Branch Info Response:", branchInfo);
    }
  }, [branchInfo]);

  // Basic Info Form
  const basicInfoFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      branchCode: branchInfo?.branch?.code || "",
      branchName: branchInfo?.branch?.name || "",
      managerName: branchInfo?.branch?.manager_name || "",
      managerSCN: branchInfo?.branch?.manager_scn || "",
      managerEmail: user?.email || "",
      branchAddress: branchInfo?.branch?.address ?? "",
    },
    validationSchema: basicInfoSchema,
    onSubmit: async (values) => {
      setIsSubmittingBasic(true);
      try {
        const [response, error] = await editBranch({
          code: values.branchCode,
          name: values.branchName,
          address: values.branchAddress,
          active: true, // Assuming active state should be maintained or true
          // Add other necessary fields if required by API, but 'code' is primary for ID
        } as any);

        if (error) {
          throw error;
        }

        NotifySuccess("Branch information updated successfully");
        makeRequest();
      } catch (error: any) {
        NotifyError(
          error?.message ||
            error?.data?.message ||
            "Failed to update branch information"
        );
      } finally {
        setIsSubmittingBasic(false);
      }
    },
  });

  // Dues Form
  const duesFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      oneToFourYears: branchInfo?.branch_due?.one_to_four_years ?? "",
      fiveToNineYears: branchInfo?.branch_due?.five_to_nine_years ?? "",
      tenToFourteenYears: branchInfo?.branch_due?.ten_to_fourteen_years ?? "",
      fifteenYearsAndAbove: branchInfo?.branch_due?.fifteen_years_above ?? "",
      seniorAdvocates: branchInfo?.branch_due?.senior_advocates ?? "",
      honorableBenches: branchInfo?.branch_due?.honorable_benchers ?? "",
    },
    validationSchema: duesSchema,
    onSubmit: async (values) => {
      setIsSubmittingDues(true);
      try {
        const payload = {
          one_to_four_years: Number(values.oneToFourYears),
          five_to_nine_years: Number(values.fiveToNineYears),
          ten_to_fourteen_years: Number(values.tenToFourteenYears),
          fifteen_years_above: Number(values.fifteenYearsAndAbove),
          senior_advocates: Number(values.seniorAdvocates),
          honorable_benchers: Number(values.honorableBenches),
          active: true,
        };

        let response, error;

        if (branchInfo?.branch_due) {
          // Update
          [response, error] = await updateBranchDues({
            // branchCode: branchInfo?.branch?.name, // Use the fetched branch code
            body: payload,
          });
        } else {
          // Create
          [response, error] = await createBranchDues({
            ...payload,
            // code: basicInfoFormik.values.branchCode,
            // branch: basicInfoFormik.values.branchName,
          });
        }

        if (error) {
          throw error;
        }

        NotifySuccess("Branch dues saved successfully");
        makeRequest();
      } catch (error: any) {
        NotifyError(
          error?.message || error?.data?.message || "Failed to save branch dues"
        );
      } finally {
        setIsSubmittingDues(false);
      }
    },
  });

  return (
    <div className="w-full min-h-[calc(100vh-7rem)] pl-0 lg:pl-[20px]">
      <PageTitle title="Branch Profile" />

      {/* Main Form Card - Centered */}
      <div className="w-full flex justify-center items-start py-6">
        <div className="bg-white w-full max-w-2xl p-6 sm:p-5">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">
            Complete Your Branch Information
            <br />
            <span className="text-base sm:text-lg font-semibold">
              to Proceed
            </span>
          </h1>

          {/* Basic Info Form */}
          <form onSubmit={basicInfoFormik.handleSubmit} className="w-full mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#009009] mb-4">
                Basic Info
              </h2>

              <div className="grid grid-cols-2 gap-6 w-full">
                {/* Branch Code */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="Branch Code*"
                    name="branchCode"
                    placeholder="001"
                    value={basicInfoFormik.values.branchCode}
                    onChange={basicInfoFormik.handleChange}
                    onBlur={basicInfoFormik.handleBlur}
                    disabled
                    error={
                      basicInfoFormik.touched.branchCode &&
                      basicInfoFormik.errors.branchCode
                        ? String(basicInfoFormik.errors.branchCode)
                        : ""
                    }
                  />
                </div>

                {/* Branch Name */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="Branch Name*"
                    name="branchName"
                    placeholder="Abuja"
                    value={basicInfoFormik.values.branchName}
                    onChange={basicInfoFormik.handleChange}
                    onBlur={basicInfoFormik.handleBlur}
                    disabled
                    error={
                      basicInfoFormik.touched.branchName &&
                      basicInfoFormik.errors.branchName
                        ? String(basicInfoFormik.errors.branchName)
                        : ""
                    }
                  />
                </div>

                {/* Manager Name */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="Manager Name*"
                    name="managerName"
                    placeholder="SHEGE MOEYE FOR DANGOTE"
                    value={basicInfoFormik.values.managerName}
                    onChange={basicInfoFormik.handleChange}
                    onBlur={basicInfoFormik.handleBlur}
                    disabled
                    error={
                      basicInfoFormik.touched.managerName &&
                      basicInfoFormik.errors.managerName
                        ? String(basicInfoFormik.errors.managerName)
                        : ""
                    }
                  />
                </div>

                {/* Manager SCN */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="Manager SCN*"
                    name="managerSCN"
                    placeholder="SCN00000000"
                    value={basicInfoFormik.values.managerSCN}
                    onChange={basicInfoFormik.handleChange}
                    onBlur={basicInfoFormik.handleBlur}
                    disabled
                    error={
                      basicInfoFormik.touched.managerSCN &&
                      basicInfoFormik.errors.managerSCN
                        ? String(basicInfoFormik.errors.managerSCN)
                        : ""
                    }
                  />
                </div>

                {/* Manager Email */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="Manager Email address*"
                    name="managerEmail"
                    type="email"
                    placeholder="user@gmail.com"
                    value={basicInfoFormik.values.managerEmail}
                    onChange={basicInfoFormik.handleChange}
                    onBlur={basicInfoFormik.handleBlur}
                    disabled
                    error={
                      basicInfoFormik.touched.managerEmail &&
                      basicInfoFormik.errors.managerEmail
                        ? String(basicInfoFormik.errors.managerEmail)
                        : ""
                    }
                  />
                </div>

                {/* Branch Address */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="Branch Address*"
                    name="branchAddress"
                    placeholder="input your branch address"
                    value={basicInfoFormik.values.branchAddress}
                    onChange={basicInfoFormik.handleChange}
                    onBlur={basicInfoFormik.handleBlur}
                    error={
                      basicInfoFormik.touched.branchAddress &&
                      basicInfoFormik.errors.branchAddress
                        ? String(basicInfoFormik.errors.branchAddress)
                        : ""
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                type="submit"
                dimension="lg"
                variant="primary"
                className="w-full text-white font-bold"
                style={{
                  backgroundColor: "#009009",
                  borderRadius: "21.91px",
                  height: "44px",
                  color: "white",
                  fontWeight: "bold",
                }}
                disabled={isSubmittingBasic || !basicInfoFormik.isValid}
              >
                {isSubmittingBasic ? "Saving..." : "Save Basic Info"}
              </Button>
            </div>
          </form>

          {/* Branch Dues Form */}
          <form onSubmit={duesFormik.handleSubmit} className="w-full">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#009009] mb-2">
                Branch Dues Info
              </h2>
              <p className="text-xs text-gray-600 mb-4">
                Please fill in accurately the branch dues for each lawyer
                category in your branch
              </p>

              <div className="grid grid-cols-2 gap-6 w-full">
                {/* 1-4 Years */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="1-4 Years*"
                    name="oneToFourYears"
                    type="number"
                    placeholder="N"
                    value={duesFormik.values.oneToFourYears}
                    onChange={duesFormik.handleChange}
                    onBlur={duesFormik.handleBlur}
                    error={
                      duesFormik.touched.oneToFourYears &&
                      duesFormik.errors.oneToFourYears
                        ? String(duesFormik.errors.oneToFourYears)
                        : ""
                    }
                  />
                </div>

                {/* 5-9 Years */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="5-9 Years*"
                    name="fiveToNineYears"
                    type="number"
                    placeholder="N"
                    value={duesFormik.values.fiveToNineYears}
                    onChange={duesFormik.handleChange}
                    onBlur={duesFormik.handleBlur}
                    error={
                      duesFormik.touched.fiveToNineYears &&
                      duesFormik.errors.fiveToNineYears
                        ? String(duesFormik.errors.fiveToNineYears)
                        : ""
                    }
                  />
                </div>

                {/* 10-14 Years */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="10-14 Years*"
                    name="tenToFourteenYears"
                    type="number"
                    placeholder="N"
                    value={duesFormik.values.tenToFourteenYears}
                    onChange={duesFormik.handleChange}
                    onBlur={duesFormik.handleBlur}
                    error={
                      duesFormik.touched.tenToFourteenYears &&
                      duesFormik.errors.tenToFourteenYears
                        ? String(duesFormik.errors.tenToFourteenYears)
                        : ""
                    }
                  />
                </div>

                {/* 15 Years and above */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="15 Years and above*"
                    name="fifteenYearsAndAbove"
                    type="number"
                    placeholder="N"
                    value={duesFormik.values.fifteenYearsAndAbove}
                    onChange={duesFormik.handleChange}
                    onBlur={duesFormik.handleBlur}
                    error={
                      duesFormik.touched.fifteenYearsAndAbove &&
                      duesFormik.errors.fifteenYearsAndAbove
                        ? String(duesFormik.errors.fifteenYearsAndAbove)
                        : ""
                    }
                  />
                </div>

                {/* Senior Advocates */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="Senior Advocates*"
                    name="seniorAdvocates"
                    type="number"
                    placeholder="N"
                    value={duesFormik.values.seniorAdvocates}
                    onChange={duesFormik.handleChange}
                    onBlur={duesFormik.handleBlur}
                    error={
                      duesFormik.touched.seniorAdvocates &&
                      duesFormik.errors.seniorAdvocates
                        ? String(duesFormik.errors.seniorAdvocates)
                        : ""
                    }
                  />
                </div>

                {/* Honorable Benches */}
                <div>
                  <Input
                    dimension="md"
                    variant="primary"
                    label="Honorable Benchers*"
                    name="honorableBenches"
                    type="number"
                    placeholder="N"
                    value={duesFormik.values.honorableBenches}
                    onChange={duesFormik.handleChange}
                    onBlur={duesFormik.handleBlur}
                    error={
                      duesFormik.touched.honorableBenches &&
                      duesFormik.errors.honorableBenches
                        ? String(duesFormik.errors.honorableBenches)
                        : ""
                    }
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <Button
                type="submit"
                dimension="lg"
                variant="primary"
                className="w-full text-white font-bold"
                style={{
                  backgroundColor: "#009009",
                  borderRadius: "21.91px",
                  height: "44px",
                  color: "white",
                  fontWeight: "bold",
                }}
                disabled={isSubmittingDues || !duesFormik.isValid}
              >
                {isSubmittingDues
                  ? "Saving Dues..."
                  : branchInfo?.branch_due
                  ? "Update Branch Dues"
                  : "Create Branch Dues"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BranchAdminDetail;
