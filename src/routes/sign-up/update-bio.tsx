import { getAllBranch, updateUserInfo } from "@/api/auth";
import { IUpdateUserInfo } from "@/api/interfaces/auth";
import { IBranch } from "@/api/interfaces/branch";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import LoginStepBar from "@/components/ui/login-step-bar";
import LoginStepCheck from "@/components/ui/login-step-check";
import PageTitle from "@/components/ui/page-title";
import { Select } from "@/components/ui/select";
import Support from "@/components/ui/support";
import AuthContext from "@/context/auth-context";
import { UpdateBioSchema } from "@/schema/sign-up";
import { AreaOfPractice } from "@/utils/others/area-of-practice";
import { States } from "@/utils/others/states";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { Link } from "react-router-dom";
import * as yup from "yup";

interface IUpdateBio {
  onClick: () => void;
  activatePage: (name: string) => void;
  previousPage: () => void;
}

const UpdateBio: FunctionalComponent<IUpdateBio> = ({
  onClick,
  activatePage,
  previousPage,
}) => {
  const { signUpInfo, setSignUpInfo } = AuthContext.useContainer();

  const { makeRequest, isLoading } =
    useRequest<IUpdateUserInfo>(updateUserInfo);

  const { response: branchData } = useFetcher<any, IBranch[]>(getAllBranch);

  async function submit(body: IUpdateUserInfo) {
    const [response, _err] = await makeRequest(body);
    if (!_err) {
      setSignUpInfo((prevState: any) => ({
        ...prevState,
        email: body.email,
        phone: body.phone,
        // address: body.address,
        // area_of_practice: body.area_of_practice,
      }));
      onClick();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  const formik = useFormik({
    validationSchema: UpdateBioSchema,
    initialValues: {
      id: signUpInfo?.id ?? 0,
      first_name: signUpInfo?.first_name ?? "",
      last_name: signUpInfo?.last_name ?? "",
      middle_name: signUpInfo?.middle_name ?? "",
      scn: signUpInfo?.scn ?? "",
      email: signUpInfo?.email ?? "",
      phone: signUpInfo?.phone ?? "",
      year_of_call: signUpInfo?.year_of_call ?? "",
      is_honorable_bencher: signUpInfo?.is_honorable_bencher ?? false,
      is_san: signUpInfo?.is_san ?? false,
      gender: signUpInfo?.gender ?? "",
      // address: signUpInfo?.address ?? "",
      // state_name: signUpInfo?.state_name ?? "",
      // state_code: signUpInfo?.state_code ?? "",
      branch: signUpInfo?.branch ?? "",
      // area_of_practice: signUpInfo?.area_of_practice ?? "",
      date_of_call: signUpInfo?.date_of_call ?? "",
      roles: signUpInfo?.roles ?? [2],
    },
    onSubmit(values, formikHelpers) {
      if (signUpInfo?.id)
        submit({
          ...values,
          // state_name: States.filter((el) => el.code == values.state_code)[0]
          //   .name,
          // area_of_practice: values.area_of_practice.toLocaleLowerCase(),
        });
    },
  });

  const signUpStepArray = [
    {
      name: "SCN & Year",
      state: true,
    },
    {
      name: "Verify Bio",
      state: true,
    },
    {
      name: "Update Bio",
      state: true,
    },
    {
      name: "Verify Account",
      state: false,
    },
    {
      name: "Create Password",
      state: false,
    },
  ];

  return (
    <div className="min-w-full min-h-screen p-4 lg:px-[10%] lg:pt-[10%] 2xl:px-[15%] flex flex-col justify-center lg:justify-start items-start pt-10">
      <PageTitle title="Update Bio" />
      <div className="h-fit w-full flex justify-evenly items-center mb-10 lg:-ml-4">
        {signUpStepArray.map((el, id) => {
          return (
            <div
              className={`hidden md:flex justify-evenly items-center w-full ${
                el.name === "Create Password" && "!justify-start"
              }`}
            >
              <LoginStepCheck
                state={el.state}
                value={el.name}
                onClick={() => el.state && activatePage(el.name)}
              />

              {el.name !== "Create Password" && (
                <LoginStepBar state={el.state} />
              )}
            </div>
          );
        })}
      </div>

      <>
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
        <form
          onSubmit={formik.handleSubmit}
          className="w-full lg:w-4/6  mb-3 flex flex-col items-start"
        >
          <h1 className="font-bold mb-2 text-2xl text-gray-800">
            Update your bio
          </h1>
          <p className="text-gray-500 mb-5 font-light text-sm text-left">
            Please double check in the information below and continue
          </p>

          <div className="mt-1 w-full">
            <Input
              label="Email"
              id="email"
              dimension="lg"
              variant="primary"
              {...formik.getFieldProps("email")}
              type="text"
              autoComplete="SCN-Number"
              required
              error={formik.touched.email ? formik.errors.email : undefined}
            />
          </div>
          <div className="mt-5 w-full">
            <Input
              label="Phone number"
              id="phone"
              dimension="lg"
              variant="primary"
              {...formik.getFieldProps("phone")}
              type="text"
              autoComplete="Phone"
              required
              error={formik.touched.phone ? formik.errors.phone : undefined}
            />
          </div>
          {/* <div className="mt-5 w-full">
            <Select
              label="State of origin"
              id="state_code"
              dimension="lg"
              variant="primary"
              {...formik.getFieldProps("state_code")}
              type="text"
              autoComplete="state"
              required
              error={
                formik.touched.state_code ? formik.errors.state_code : undefined
              }
            >
              <option value={""}>Select here</option>
              {States.map((el, idx) => (
                <option value={el.code}>{el.name}</option>
              ))}
            </Select>
          </div> */}

          <div className="mt-5 w-full">
            <Select
              label="Select branch"
              id="branch"
              dimension="lg"
              variant="primary"
              {...formik.getFieldProps("branch")}
              type="text"
              autoComplete="branch"
              required
              error={formik.touched.branch ? formik.errors.branch : undefined}
            >
              <option value={""}>Select here</option>

              {branchData &&
                branchData.map((el, idx) => (
                  <option value={el.name}>{el.name.toLocaleUpperCase()}</option>
                ))}
            </Select>
          </div>
          <div className="mt-5 w-full">
            <Select
              label="Select gender"
              id="gender"
              dimension="lg"
              variant="primary"
              {...formik.getFieldProps("gender")}
              type="text"
              autoComplete="gender"
              required
              error={formik.touched.gender ? formik.errors.gender : undefined}
            >
              <option value={""}>Select here</option>
              <option value={"M"}>Male</option>
              <option value={"F"}>Female</option>
            </Select>
          </div>

          {/* <div className="mt-5 w-full">
            <Select
              label="Area of practice"
              id="area_of_practice"
              dimension="lg"
              variant="primary"
              {...formik.getFieldProps("area_of_practice")}
              type="text"
              autoComplete="area_of_practice"
              required
              error={
                formik.touched.area_of_practice
                  ? formik.errors.area_of_practice
                  : undefined
              }
            >
              <option value={""}>Select here</option>

              {AreaOfPractice &&
                AreaOfPractice.map((el, idx) => (
                  <option value={el.value}>
                    {el.name.toLocaleUpperCase()}
                  </option>
                ))}
            </Select>
          </div> */}

          {/* <div className="mt-5 w-full">
            <Input
              label="Address"
              id="address"
              dimension="lg"
              variant="primary"
              defaultValue={signUpInfo?.phone}
              {...formik.getFieldProps("address")}
              type="text"
              autoComplete="address"
              required
              error={formik.touched.address ? formik.errors.address : undefined}
            />
          </div> */}

          <div className="mt-5 w-full">
            <p className="block text-sm text-left font-normal text-gray-700 mb-3">
              Select category
            </p>
            <Checkbox
              label="SAN"
              id="is_san"
              variant="primary"
              dimension="md"
              {...formik.getFieldProps("is_san")}
              type="radio"
              autoComplete="is_san"
            />
          </div>

          <div className="mt-5 w-full">
            <Checkbox
              label="Honorable Benchers"
              id="is_honorable_bencher"
              variant="primary"
              dimension="md"
              {...formik.getFieldProps("is_honorable_bencher")}
              type="radio"
              autoComplete="is_honorable_bencher"
            />
          </div>

          <div className="mt-5 w-full">
            <Checkbox
              label="None of the above"
              id="non"
              variant="primary"
              dimension="md"
              // {...formik.getFieldProps("none")}
              type="radio"
              autoComplete="none"
            />
          </div>

          <div className="mt-7 w-full">
            <Button
              type="submit"
              dimension="lg"
              variant="primary"
              isLoading={isLoading}
              className="flex-1  bg-primary-500 p-4 text-white rounded-full"
              // onClick={() => onClick()}
              // onClick={() => {}}

              // disabled={!(formik.isValid && formik.dirty)}
            >
              Next
            </Button>
          </div>
          <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
            <button
              type="button"
              onClick={(e) => {
                previousPage();
                e.preventDefault();
              }}
              className="flex-1 border-1 border-[black] rounded-full"
            >
              Back
            </button>
          </div>
        </form>
      </>
      <Support />
    </div>
  );
};
export default UpdateBio;
