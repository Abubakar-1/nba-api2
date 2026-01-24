import { deleteLawyerByScn } from "@/api/lawyers";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "preact/hooks";
import { IBranch } from "@/api/interfaces/branch";
import { ILawyer, LawyerProp } from "@/api/interfaces/lawyers";
import { editLawyer } from "@/api/lawyers";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { LawyerSchema } from "@/schema/lawyer";
import { AreaOfPractice } from "@/utils/others/area-of-practice";
import { States } from "@/utils/others/states";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { useEffect } from "preact/hooks";
import AuthContext from "@/context/auth-context";
import { ACCESS_ROLES } from "@/utils/constants";
import { AdimEditLawyerSchema } from "@/schema/admin-edit-lawyer";

interface EditProps {
  state: boolean;
  handleModalClose: any;
  data?: ILawyer;
  refresh?(): void;
  branch: IBranch[] | undefined;
}
const EditLawyer: FunctionalComponent<EditProps> = ({
  state,
  handleModalClose,
  data,
  refresh,
  branch,
}) => {
  const editLawyerRequest = useRequest<LawyerProp>(editLawyer);
  const { user } = AuthContext.useContainer();
  const isSuperAdmin = user.roles.includes("SUPER_ADMIN");
  const isAdmin = user.roles.includes("ADMIN");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // const deleteRequest = useRequest(deleteProfile);

  async function submit(body: any) {
    const [response, _err] = await editLawyerRequest.makeRequest(body);
    if (!_err) {
      NotifySuccess("Lawyer updated successfully");
      if (refresh) refresh();
    } else if (_err && _err?.data) {
      const errorMsg = Array.isArray(_err.data.message)
        ? _err.data.message.join(", ")
        : _err.data.message || _err.data.error || _err.data.info;
      NotifyError(errorMsg);
      return;
    } else {
      NotifyError(_err?.message || "An error occurred");
      return;
    }
  }

  async function handleDelete() {
    if (!data?.scn) return NotifyError("SCN not found");

    setDeleting(true);

    try {
      await deleteLawyerByScn({
        scn: data.scn,
        auth_key: "A246689",
        admin_token: "A246689",
      });

      NotifySuccess("Lawyer deleted successfully");
      setShowDeleteModal(false);
      if (refresh) refresh();
    } catch (err: any) {
      NotifyError(err.message || "Unable to delete lawyer");
    } finally {
      setDeleting(false);
    }
  }

  const form = useFormik({
    validationSchema: ACCESS_ROLES.admin_dashboard.some((v) =>
      user.roles.includes(v),
    )
      ? AdimEditLawyerSchema
      : LawyerSchema,
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      scn: "",
      middle_name: "",
      address: "",
      branch: "",
      date_of_call: "",
      state_code: "",
      state_name: "",
      gender: "",
      area_of_practice: "",
      is_honorable_bencher: false,
      is_san: false,
      roles: [2],
      id: 0,
      dob: "",
      exam_no: "",
      rank: "",
      is_profile_public: true,
      enabled: true,
      has_onboarded: true,
      passport: "",
      is_verified: true,
      is_deleted: false,
    },
    onSubmit(values, formikHelpers) {
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        // email: values.email,
        phone: values.phone,
        middle_name: values.middle_name,
        nba_id: values.scn,
        exam_no: values.exam_no,
        gender: values.gender,
        dob: values.dob,
        address: values.address,
        state_name: values.state_code
          ? States.filter((el) => el.code === values.state_code)[0].name
          : "",
        state_code: values.state_code,
        branch: values.branch,
        is_honorable_bencher: values.is_honorable_bencher,
        is_san: values.is_san,
        date_of_call: values.date_of_call, // Assuming format is already YYYY-MM-DD or handled
        year_of_call: values.date_of_call
          ? new Date(values.date_of_call).getFullYear()
          : new Date().getFullYear(),
        area_of_practice: values.area_of_practice,
        rank: values.rank,
        is_profile_public: values.is_profile_public,
        enabled: values.enabled,
        has_onboarded: values.has_onboarded,
        passport: values.passport,
        is_verified: values.is_verified,
        is_deleted: values.is_deleted,
        id: values.id, // For URL param
      };

      submit(payload);
    },
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        scn: data.scn ?? "",
        middle_name: data.middle_name ?? "",
        address: data.address ?? "",
        branch: data.branch ?? "",
        date_of_call: data.date_of_call ? data.date_of_call.split("T")[0] : "",
        state_code: data.state_code
          ? States.filter((el) => el.code === data.state_code)[0].code
          : "",
        state_name: data.state_code
          ? States.filter((el) => el.code === data.state_code)[0].name
          : "",
        gender:
          data.gender === "Male"
            ? "M"
            : data.gender === "Female"
              ? "F"
              : (data.gender ?? ""),
        area_of_practice: data.area_of_practice ?? "",
        id: data.id,
        is_honorable_bencher: data.is_honorable_bencher ?? false,
        is_san: data.is_san ?? false,
        // New fields
        dob: (data as any).dob ? (data as any).dob.split("T")[0] : "",
        exam_no: (data as any).exam_no ?? "",
        rank: (data as any).rank ?? "",
        is_profile_public: (data as any).is_profile_public ?? true,
        enabled: (data as any).enabled ?? true,
        has_onboarded: (data as any).has_onboarded ?? true,
        passport: (data as any).passport ?? "",
        is_verified: (data as any).is_verified ?? true,
        is_deleted: (data as any).is_deleted ?? false,
        roles: [2],
      });
    }
  }, [data]);
  return (
    <>
      <Modal
        isOpen={state}
        showCloseIcon={state}
        onClose={() => handleModalClose()}
        dimensions="xl"
      >
        <form onSubmit={form.handleSubmit}>
          <h1 className="font-bold text-lg lg:text-2xl">Edit lawyer</h1>

          <div className="flex gap-3">
            <div className="mt-5 w-full">
              <Input
                label="First Name"
                id="first_name"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("first_name")}
                type="text"
                autoComplete="first_name"
                // readOnly
                disabled={!isSuperAdmin && !isAdmin}
                error={
                  form.touched.first_name ? form.errors.first_name : undefined
                }
              />
            </div>
            <div className="mt-5 w-full">
              <Input
                label="Last Name"
                id="last_name"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("last_name")}
                type="text"
                autoComplete="last_name"
                // readOnly
                disabled={!isSuperAdmin && !isAdmin}
                error={
                  form.touched.last_name ? form.errors.last_name : undefined
                }
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="mt-5 w-full">
              <Input
                label="Middle name"
                id="middle_name"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("middle_name")}
                type="text"
                autoComplete="middle_name"
                // readOnly
                disabled={!isSuperAdmin && !isAdmin}
                error={
                  form.touched.middle_name ? form.errors.middle_name : undefined
                }
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <div className="w-full">
              <Input
                label="Enrollment Number (SCN)"
                id="scn"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("scn")}
                disabled={!isSuperAdmin}
                type="text"
                autoComplete="scn"
                error={form.touched.scn ? form.errors.scn : undefined}
              />
            </div>
            <div className="w-full">
              <Input
                label="Exam Number"
                id="exam_no"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("exam_no")}
                disabled={!isSuperAdmin}
                type="text"
                autoComplete="exam_no"
                error={form.touched.exam_no ? form.errors.exam_no : undefined}
              />
            </div>
          </div>
          <div className="mt-5 w-full">
            <Input
              label="Email"
              id="email"
              dimension="lg"
              variant="primary"
              {...form.getFieldProps("email")}
              type="text"
              autoComplete="email"
              error={form.touched.email ? form.errors.email : undefined}
              readOnly
              disabled
            />
          </div>

          <div className="flex gap-3">
            <div className="mt-5 w-full">
              <Select
                label="Gender"
                id="gender"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("gender")}
                disabled={!isSuperAdmin}
                type="text"
                autoComplete="state"
                error={form.touched.gender ? form.errors.gender : undefined}
              >
                <option value={""}>Select here</option>
                <option value={"Male"}>Male</option>
                <option value={"Female"}>Female</option>
              </Select>
            </div>
            <div className="mt-5 w-full">
              <Input
                label="Date of Birth"
                id="dob"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("dob")}
                disabled={!isSuperAdmin}
                type="date"
                min="1900-01-01"
                max={new Date().toISOString().split("T")[0]}
                autoComplete="dob"
                error={form.touched.dob ? form.errors.dob : undefined}
              />
            </div>
          </div>

          <div className="mt-5 w-full">
            <Input
              label="Phone number"
              id="phone"
              dimension="lg"
              variant="primary"
              {...form.getFieldProps("phone")}
              disabled={!isSuperAdmin}
              type="text"
              autoComplete="phone"
              error={form.touched.phone ? form.errors.phone : undefined}
            />
          </div>

          <div className="flex gap-3">
            <div className="mt-5 w-full">
              <Select
                label="State of origin"
                id="state_code"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("state_code")}
                disabled={!isSuperAdmin}
                type="text"
                autoComplete="state"
                error={
                  form.touched.state_code ? form.errors.state_code : undefined
                }
              >
                <option value={""}>Select here</option>
                {States.map((el, idx) => (
                  <option value={el.code}>{el.name}</option>
                ))}
              </Select>
            </div>
            <div className="mt-5 w-full">
              <Select
                label="Select branch"
                id="branch"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("branch")}
                disabled={!isSuperAdmin}
                type="text"
                autoComplete="branch"
                error={form.touched.branch ? form.errors.branch : undefined}
              >
                <option value={""}>Select here</option>

                {branch &&
                  branch.map((el, idx) => (
                    <option value={el.name}>
                      {el.name.toLocaleUpperCase()}
                    </option>
                  ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row  lg:gap-3">
            <div className="mt-5 w-full">
              <Select
                label="Area of practice"
                id="area_of_practice"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("area_of_practice")}
                disabled={!isSuperAdmin}
                type="text"
                autoComplete="area_of_practice"
                error={
                  form.touched.area_of_practice
                    ? form.errors.area_of_practice
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
            </div>

            <div className="mt-5 w-full">
              <Input
                label="Date of call"
                id="date_of_call"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("date_of_call")}
                disabled={!isSuperAdmin}
                type="date"
                min="1800-01-01"
                max={new Date().toISOString().split("T")[0]}
                autoComplete="date_of_call"
                error={
                  form.touched.date_of_call
                    ? form.errors.date_of_call
                    : undefined
                }
              />
            </div>
          </div>
          <div className="mt-5 w-full">
            <Input
              label="Address"
              id="address"
              dimension="lg"
              variant="primary"
              {...form.getFieldProps("address")}
              disabled={!isSuperAdmin}
              type="text"
              autoComplete="address"
              error={form.touched.address ? form.errors.address : undefined}
            />
          </div>
          <p className="text-sm mt-5">Professional Details</p>
          <div className="mt-2 w-full">
            <Input
              label="Rank"
              id="rank"
              dimension="lg"
              variant="primary"
              {...form.getFieldProps("rank")}
              disabled={!isSuperAdmin}
              type="text"
              placeholder="e.g. Senior Associate"
              autoComplete="rank"
              error={form.touched.rank ? form.errors.rank : undefined}
            />
          </div>
          <p className="text-sm mt-5">Category</p>
          <div className="flex gap-3">
            <div className="mt-2 w-full">
              <Checkbox
                label="SAN"
                id="is_san"
                variant="primary"
                dimension="md"
                {...form.getFieldProps("is_san")}
                disabled={!isSuperAdmin}
                type="checkbox"
                autoComplete="is_san"
                checked={form.getFieldProps("is_san").value}
              />
            </div>
            <div className="mt-2 w-full">
              <Checkbox
                label="Honorable Bencher"
                id="is_honorable_bencher"
                variant="primary"
                dimension="md"
                {...form.getFieldProps("is_honorable_bencher")}
                disabled={!isSuperAdmin}
                type="checkbox"
                autoComplete="is_honorable_bencher"
                checked={form.getFieldProps("is_honorable_bencher").value}
              />
            </div>
            <div className="mt-2 w-full">
              <Checkbox
                label="Make Profile Public"
                id="is_profile_public"
                variant="primary"
                dimension="md"
                {...form.getFieldProps("is_profile_public")}
                disabled={!isSuperAdmin}
                type="checkbox"
                autoComplete="is_profile_public"
                checked={form.getFieldProps("is_profile_public").value}
              />
            </div>
          </div>

          {isSuperAdmin || isAdmin ? (
            <div className="mt-7 w-full">
              <Button
                type="submit"
                dimension="lg"
                variant="primary"
                isLoading={editLawyerRequest.isLoading}
                // disabled={!(form.isValid && form.dirty)}
              >
                Submit
              </Button>
            </div>
          ) : (
            <div className="mt-7 w-full p-4 bg-yellow-100 text-yellow-800 rounded-md text-center font-medium">
              You do not have permission to edit this lawyer's profile.
            </div>
          )}

          {(isSuperAdmin || isAdmin) && (
            <div className="mt-5 w-full flex justify-end">
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                dimension="sm"
              >
                Delete Lawyer
              </Button>
            </div>
          )}

          <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
            <button
              type="button"
              onClick={() => handleModalClose()}
              className=""
            >
              Close
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        showCloseIcon={true}
        onClose={() => setShowDeleteModal(false)}
      >
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="p-4 mt-10 w-fit rounded-full bg-red-500 bg-opacity-[12%]">
            <ExclamationCircleIcon className="text-red-500 w-10 h-10" />
          </div>
          <div className="flex flex-col items-center py-3 gap-1">
            <h1 className="text-2xl font-bold text-red-500">Delete Lawyer?</h1>
            <p className="text-sm text-center">
              Are you sure you want to permanently delete this lawyer's profile?
            </p>
          </div>

          <div className="mt-10 w-full flex flex-col gap-4">
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              dimension="lg"
              isLoading={deleting}
            >
              Confirm Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              dimension="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default EditLawyer;
