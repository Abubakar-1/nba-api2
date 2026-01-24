import { getAllBranch, logoutApi } from "@/api/auth";
import { changePassword } from "@/api/change-password";
import { IBranch } from "@/api/interfaces/branch";
import {
  IChangePassword,
  IEditProfile,
  IProfile,
} from "@/api/interfaces/profile";
import { deleteProfile, getProfile, updateProfile } from "@/api/profile";
import CancelVisibilityIcon from "@/assets/icons/cancel-visibility-icon";
import VisibilityIcon from "@/assets/icons/visibility-icon";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import RadioButton from "@/components/ui/radio-button";
import { Select } from "@/components/ui/select";
import AuthContext from "@/context/auth-context";
import { ProfileChangePasswordSchema, ProfileSchema } from "@/schema/profile";
import { blobToBase64 } from "@/utils/functions/string-functions";
import { AreaOfPractice } from "@/utils/others/area-of-practice";
import { States } from "@/utils/others/states";
import {
  CheckCircleIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import classNames from "classnames";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Modal } from "@/components/ui/modal";

const Profile: FunctionalComponent = () => {
  const { makeRequest } = useRequest(logoutApi);

  const [deleting, setDeleting] = useState(false);
  const { logout } = AuthContext.useContainer();
  const [editable, setEditable] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [file, setFile] = useState<any>("");
  const [imageSizeError, setSizeImageError] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState(false);
  const { response: branchData } = useFetcher<any, IBranch[]>(getAllBranch);
  const {
    response: profileData,
    isLoading,
    makeRequest: profileMakeRequest,
  } = useFetcher<any, IProfile>(getProfile);

  const updateProfileRequest = useRequest<IEditProfile>(updateProfile);
  const deleteAccount = useRequest(deleteProfile);
  const ResetPasswordRequest = useRequest<IChangePassword>(changePassword);

  async function resetPasswordSubmit(body: IChangePassword) {
    const [response, _err] = await ResetPasswordRequest.makeRequest(body);
    if (!_err) {
      NotifySuccess("Password changed successfully");
      changePasswordFormik.resetForm();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }
  async function handleDelete() {
    setDeleting(true);

    const [response, _err] = await deleteAccount.makeRequest({});
    if (!_err) {
      NotifySuccess("Account reset successful");
      const [_, error] = await makeRequest({});
      setDeleting(false);
      logout();
    } else if (_err && _err?.data) {
      setDeleting(false);
      NotifyError(_err?.data?.info);
      return;
    } else {
      setDeleting(false);
      NotifyError(_err?.info);
      return;
    }
  }
  async function submit(body: IEditProfile) {
    const [response, _err] = await updateProfileRequest.makeRequest(body);
    if (!_err) {
      NotifySuccess("Profile updated successfully");
      // profileMakeRequest();
      setEditable(false);
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  const formik = useFormik({
    validationSchema: ProfileSchema,
    initialValues: {
      phone: profileData?.phone + "",
      branch: profileData?.branch + "",
      year_of_call: profileData?.year_of_call + "",
      gender: profileData?.gender + "",
      address: profileData?.address + "",
      area_of_practice: profileData?.area_of_practice + "",
      state_name: profileData?.state_name + "",
      state_code: profileData?.state_code + "",
      is_honorable_bencher: profileData?.is_honorable_bencher || false,
      is_san: profileData?.is_san || false,
      is_profile_public: profileData?.is_profile_public || false,
      dob: profileData?.dob + "",
      passport: file,
    },
    onSubmit(values) {
      const { year_of_call, is_honorable_bencher, is_san, ...rest } = values;
      submit({
        ...rest,
        passport: file,
        dob: values.dob,
        state_code: States.find((el) => el.name === values.state_name)?.code || values.state_code,
      } as IEditProfile);
    },
  });

  const changePasswordFormik = useFormik({
    initialValues: { new_password: "", confirm_password: "", old_password: "" },
    onSubmit(values) {
      resetPasswordSubmit(values);
    },
    validationSchema: ProfileChangePasswordSchema,
  });

  const handleImageChange = (e: any) => {
    if (e.target.files[0].size <= 250100) {
      blobToBase64(e.target.files[0], setFile);
      setSizeImageError(false);
    } else setSizeImageError(true);

    e.preventDefault();
  };
  useEffect(() => {
    if (profileData) {
      formik.setValues({
        phone: profileData?.phone,
        branch: profileData?.branch || "",
        year_of_call: profileData?.year_of_call,
        gender: profileData?.gender || "",
        address: profileData?.address || "",
        area_of_practice: profileData?.area_of_practice || "",
        state_name: profileData?.state_name || "",
        state_code: profileData?.state_code || "",
        is_honorable_bencher: profileData?.is_honorable_bencher,
        is_san: profileData?.is_san,
        is_profile_public: profileData?.is_profile_public,
        dob: profileData?.dob || "",
        passport: file,
      });
      setFile(profileData.passport || "");
    }
  }, [profileData]);

  return (
    <div className="px-4 mb-5">
      <Modal
        isOpen={showDelete}
        showCloseIcon={showDelete}
        onClose={() => setShowDelete(false)}
      >
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="p-4 mt-10 w-fit rounded-full bg-red-500 bg-opacity-[12%]">
            <ExclamationCircleIcon className="text-red-500 w-10 h-10" />
          </div>
          <div className="flex flex-col items-center py-3 gap-1">
            <h1 className="text-3xl text-primary-500 font-bold">
              Delete Account!
            </h1>
            <p className="text-sm">
              Are you sure you want to delete your account.
            </p>
          </div>

          <div className="mt-10 w-full">
            <Button
              type="button"
              variant="danger"
              onClick={() => handleDelete()}
              dimension="lg"
              isLoading={deleting}
            >
              Delete Account
            </Button>
          </div>
          <div className="mt-10 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDelete(false)}
              dimension="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
      <PageTitle title="Profile" />
      {isLoading ? (
        <div className="w-full h-full flex justify-center items-center">
          <PageLoader isOutlined={isLoading} />
        </div>
      ) : profileData ? (
        <>
          <form onSubmit={formik.handleSubmit} className="w-full lg:w-3/4">
            <div className={"flex w-full justify-between items-center"}>
              <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">
                Profile
              </h1>
              <button
                onClick={() => setShowDelete(true)}
                className={
                  "text-white font-bold bg-red-500 rounded-lg px-4 text-xs py-2"
                }
                type="button"
              >
                Reset Account
              </button>
            </div>
            <h1 className="text-gray-500 border-b-1 pb-3 lg:mt-10 text-left w-full">
              Personal details.
            </h1>
            <div className="my-5 lg:w-fit">
              <p className="text-gray-500 mb-2">Photo</p>
              <div className="w-full flex lg:justify-center items-center lg:gap-4 gap-10">
                <div className="space-y-1 text-center relative">
                  {file ? (
                    <div className="">
                      {/* <img
                        src={file}
                        alt="profile"
                        className=" h-28 w-28 object-cover rounded-full"
                      /> */}
                      <div
                        className="h-20 md:h-32 w-20 md:w-32 bg-cover bg-center rounded-full  bg-red-500"
                        style={{ backgroundImage: `url(${file})` }}
                      ></div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        disabled={!editable}
                        className="text-sm text-gray-600 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed mt-5 cursor-pointer lg:absolute top-4 -right-[6.5rem] border-gray-300 border px-4 py-3 rounded-xl"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div>
                      <UserCircleIcon className=" fill-blue-400 text-xs w-40 mx-auto" />

                      <div className="flex text-sm text-gray-600">
                        {editable && (
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer font-medium text-primary-500 focus:outline-none focus:ring-0"
                          >
                            <span className="text-form-label text-sm  ">
                              Click here to Upload a photo
                            </span>

                            <input
                              id="file-upload"
                              name="file-upload"
                              onChange={handleImageChange}
                              type="file"
                              accept=".png, .jpg, .jpeg"
                              className="sr-only"
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-[#ADADAD] mt-2">
                        PNG, JPG, GIF up to 250kb
                      </p>
                    </div>
                  )}
                  {imageSizeError && (
                    <span className="text-red-500 text-xs">
                      file too large (max 250kb)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="border-b-[1px] border-gray-300 flex justify-center items-center h-14 py-1 ">
              <h1 className="w-32 lg:w-72 sm:text-sm text-gray-500 font-medium">
                Full name
              </h1>
              <input
                defaultValue={`${
                  profileData.last_name +
                  " " +
                  profileData.first_name +
                  " " +
                  profileData.middle_name
                }`}
                className="px-2 focus:outline-none text-sm font-bold text-black w-full h-full disabled:bg-gray-50 disabled:text-gray-600 bg-white
                "
                disabled
              />
            </div>
            <div
              className={`border-b-[1px] text-gray-500 border-gray-300 flex justify-center items-center h-14 py-1 `}
            >
              <h1 className="w-32 lg:w-72 sm:text-sm font-medium text-gray-500">
                Enrollment Number
              </h1>
              <input
                defaultValue={`${profileData.scn}`}
                className="px-2 focus:outline-none text-sm font-bold text-black w-full h-full disabled:bg-gray-50 disabled:text-gray-600 bg-white
                "
                disabled
              />
            </div>
            <div className="border-b-[1px] border-gray-300 flex justify-center items-center h-14 py-1 ">
              <h1 className="w-32 lg:w-72 sm:text-sm font-medium text-gray-500">
                Email address
              </h1>
              <input
                defaultValue={`${profileData.email}`}
                className="px-2 focus:outline-none text-sm font-bold text-black w-full h-full disabled:bg-gray-50 disabled:text-gray-600 bg-white
                "
                disabled
              />
            </div>
            <div className="border-b-[1px] py-1">
              <div className="h-12 border-gray-300 flex justify-center items-center">
                <h1 className="w-32 lg:w-72 sm:text-sm font-medium text-gray-500">
                  Phone number
                </h1>
                <input
                  {...formik.getFieldProps("phone")}
                  className="px-2 focus:outline-none text-sm font-bold text-black w-full h-full disabled:bg-gray-50 disabled:text-gray-600 bg-white
                "
                  disabled={!editable}
                />
              </div>
              {formik.touched.phone && (
                <p className=" ml-24 lg:ml-[13.5rem] text-sm text-red-500 w-full">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            <div className="border-b-[1px] border-gray-300 py-1 ">
              <div className="h-12 border-gray-300 flex justify-center items-center">
                <h1 className="w-32 lg:w-72 sm:text-sm font-medium text-gray-500">
                  Date of birth
                </h1>
                <input
                  type="date"
                  {...formik.getFieldProps("dob")}
                  className="px-2 focus:outline-none text-sm font-bold text-black w-full h-full disabled:bg-gray-50 disabled:text-gray-600 bg-white
                  "
                  min="1800-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  disabled={!editable}
                />
              </div>
              {formik.touched.dob && (
                <p className="ml-24 lg:ml-[13.5rem] text-sm text-red-500 w-full">
                  {formik.errors.dob}
                </p>
              )}
            </div>
            <div className="py-1 border-b-[1px] border-gray-300 flex justify-center items-center">
              <h1 className="w-32 lg:w-72 sm:text-sm font-medium text-gray-500">
                Area of Practice
              </h1>
              <Select
                className={`w-full focus:outline-none disabled:bg-gray-50 text-black font-bold bg-white focus:ring-0 focus:border-0 border-0 rounded-none shadow-transparent`}
                id="area_of_practice"
                dimension="lg"
                variant="primary"
                {...formik.getFieldProps("area_of_practice")}
                type="text"
                autoComplete="area_of_practice"
                disabled={!editable}
                onChange={(e) => {
                  formik.setFieldValue(
                    "area_of_practice",
                    e.currentTarget.value
                  );
                }}
                error={
                  formik.touched.area_of_practice && editable
                    ? formik.errors.area_of_practice
                    : undefined
                }
              >
                <option value=""></option>
                {AreaOfPractice &&
                  AreaOfPractice.map((el, idx) => (
                    <option value={el.value}>
                      {el.name?.toLocaleUpperCase()}
                    </option>
                  ))}
              </Select>
            </div>

            <div className="py-1 border-b-[1px] border-gray-300 flex justify-center items-center">
              <h1 className="w-32 lg:w-72 sm:text-sm font-medium text-gray-500">
                State of origin
              </h1>
              <Select
                className={`w-full focus:outline-none disabled:bg-gray-50 text-black font-bold bg-white focus:ring-0 focus:border-0 border-0 rounded-none shadow-transparent`}
                id="state_name"
                dimension="lg"
                variant="primary"
                {...formik.getFieldProps("state_name")}
                type="text"
                autoComplete="state_name"
                disabled={!editable}
                onChange={(e) => {
                  formik.setFieldValue("state_name", e.currentTarget.value);
                }}
                error={
                  formik.touched.state_name && editable
                    ? formik.errors.state_name
                    : undefined
                }
              >
                <option value=""></option>
                {States.map((el, idx) => (
                  <option value={el.name}>{el.name}</option>
                ))}
              </Select>
            </div>

            <div className="py-1 border-b-[1px] border-gray-300 flex justify-center items-center">
              <h1 className="w-32 lg:w-72 sm:text-sm font-medium text-gray-500">
                Branch
              </h1>
              <Select
                className={`w-full focus:outline-none disabled:bg-black-50 disabled:text-gray-600 text-black font-bold bg-white focus:ring-0 focus:border-0 border-0 rounded-none shadow-transparent`}
                id="branch"
                dimension="lg"
                variant="primary"
                {...formik.getFieldProps("branch")}
                type="text"
                autoComplete="branch"
                disabled={!editable}
                onChange={(e) => {
                  formik.setFieldValue("branch", e.currentTarget.value);
                }}
                error={
                  formik.touched.branch && editable
                    ? formik.errors.branch
                    : undefined
                }
              >
                <option value=""></option>
                {branchData?.map((el, idx) => (
                  <option value={el.name}>{el.name?.toLocaleUpperCase()}</option>
                ))}
              </Select>
            </div>

            <div className="border-b-[1px] border-gray-300 flex justify-center items-center h-14 py-1 ">
              <h1 className="w-32 lg:w-72 sm:text-sm font-medium text-gray-500">
                Year of call
              </h1>
              <input
                {...formik.getFieldProps("year_of_call")}
                className="px-2 focus:outline-none text-sm font-bold text-black w-full h-full disabled:bg-gray-50 disabled:text-gray-600 bg-white
                "
                disabled={true}
              />
            </div>
            <div className="py-1 border-b-[1px] border-gray-300 flex justify-center items-center">
              <h1 className="w-32 lg:w-72 sm:text-sm font-medium text-gray-500">
                Gender
              </h1>
              <Select
                className={`w-full focus:outline-none disabled:bg-gray-50 text-black font-bold bg-white focus:ring-0 focus:border-0 border-0 rounded-none shadow-transparent`}
                id="gender"
                dimension="lg"
                variant="primary"
                {...formik.getFieldProps("gender")}
                type="text"
                autoComplete="gender"
                onChange={(e) => {
                  formik.setFieldValue("gender", e.currentTarget.value);
                }}
                disabled={!editable}
                error={
                  formik.touched.gender && editable
                    ? formik.errors.gender
                    : undefined
                }
              >
                <option value={""}>Select here</option>
                <option value={"M"}>Male</option>
                <option value={"F"}>Female</option>
              </Select>
            </div>
            <div className="border-b-[1px] border-gray-300 flex justify-center items-center h-14 py-1 ">
              <h1 className="w-32 lg:w-72 sm:text-sm font-medium text-gray-500">
                Address
              </h1>
              <input
                {...formik.getFieldProps("address")}
                className="px-2 focus:outline-none text-sm font-bold text-black w-full h-full disabled:bg-gray-50 disabled:text-gray-600 bg-white
                "
                disabled={!editable || profileData?.address ? true : false}
              />
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="w-1/2">
                <div className="mt-5 w-full">
                  <p className="block text-sm text-left font-normal text-gray-700 mb-3">
                    Category
                  </p>
                  {profileData?.is_san ? (
                    <RadioButton
                      disabled={true}
                      checked
                      label="SAN"
                      id="is_san"
                      variant="primary"
                      dimension="md"
                      {...formik.getFieldProps("is_san")}
                      type="radio"
                      autoComplete="is_san"
                    />
                  ) : (
                    <Checkbox
                      disabled={true}
                      label="SAN"
                      id="is_san"
                      variant="primary"
                      dimension="md"
                      {...formik.getFieldProps("is_san")}
                      type="radio"
                      autoComplete="is_san"
                    />
                  )}
                </div>

                <div className="mt-5 w-full">
                  <Checkbox
                    disabled={true}
                    label="Honorable Bencher"
                    id="is_honorable_bencher"
                    variant="primary"
                    dimension="md"
                    {...formik.getFieldProps("is_honorable_bencher")}
                    type="checkbox"
                    autoComplete="is_honorable_bencher"
                    checked={formik.getFieldProps("is_honorable_bencher").value}
                  />
                </div>
              </div>

              <div className="w-1/2">
                <p className="block text-sm text-left font-normal text-gray-700 mb-3">
                  Profile visibility
                </p>
                <Checkbox
                  disabled={!editable}
                  label="Appear in public search results"
                  // style={{ pointerEvents: `${!editable ? "none" : ""}` }}
                  id="is_profile_public"
                  variant="primary"
                  dimension="md"
                  {...formik.getFieldProps("is_profile_public")}
                  type="checkbox"
                  autoComplete="is_profile_public"
                  checked={formik.getFieldProps("is_profile_public").value}
                />
              </div>
            </div>

            <div className="w-full flex justify-end items-center mt-10">
              {!editable ? (
                <div className="w-32">
                  <Button
                    variant="primary"
                    dimension="lg"
                    type="button"
                    onClick={() => setEditable(true)}
                  >
                    Edit profile
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="w-32">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white text-primary-500 border-primary-500 w-full inline-flex items-center justify-center font-medium border focus:outline-none px-4 py-2.5 text-base rounded-3xl"
                      dimension="lg"
                      onClick={() => setEditable(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="w-32">
                    <Button
                      variant="primary"
                      dimension="lg"
                      type="submit"
                      isLoading={updateProfileRequest.isLoading}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>
          <form
            onSubmit={changePasswordFormik.handleSubmit}
            className="mt-16 w-full lg:w-2/4"
          >
            <h1 className="font-bold text-lg lg:text-xl mt-7 mb-4">
              Change password
            </h1>
            <div className="mt-5 mb-5 w-full">
              <Input
                label="Current password"
                id="old_password"
                dimension="lg"
                variant="primary"
                {...changePasswordFormik.getFieldProps("old_password")}
                type="text"
                autoComplete="old_password"
                error={
                  changePasswordFormik.touched.old_password
                    ? changePasswordFormik.errors.old_password
                    : undefined
                }
              />
            </div>
            <div className="mt-5 w-full">
              <Input
                label="New password"
                id="new_password"
                dimension="lg"
                variant={
                  changePasswordFormik.errors.new_password
                    ? "danger"
                    : "primary"
                }
                {...changePasswordFormik.getFieldProps("new_password")}
                rightSlot={() => (
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 cursor-pointer"
                  >
                    {showPassword ? (
                      <VisibilityIcon />
                    ) : (
                      <CancelVisibilityIcon />
                    )}
                  </span>
                )}
                type={showPassword ? "text" : "password"}
                error={
                  changePasswordFormik.touched.new_password
                    ? changePasswordFormik.errors.new_password
                    : undefined
                }
              />
            </div>

            <div className="mt-5 mb-5 w-full">
              <Input
                label="Confirm Password"
                id="confirm_password"
                dimension="lg"
                variant="primary"
                {...changePasswordFormik.getFieldProps("confirm_password")}
                type="password"
                autoComplete="confirm_password"
                error={
                  changePasswordFormik.touched.confirm_password
                    ? changePasswordFormik.errors.confirm_password
                    : undefined
                }
              />
            </div>

            <div className="mt-5 w-full inline-flex justify-end items-center">
              <div className="w-36">
                <Button
                  type="submit"
                  dimension="lg"
                  variant="primary"
                  isLoading={ResetPasswordRequest.isLoading}
                  disabled={
                    !(
                      changePasswordFormik.isValid && changePasswordFormik.dirty
                    )
                  }
                >
                  Save password
                </Button>
              </div>
            </div>
          </form>

          {/* reset password */}
        </>
      ) : null}
    </div>
  );
};

export default Profile;
