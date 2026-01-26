import { IBranch } from "@/api/interfaces/branch";
import { IUploadLawyerPreview, LawyerProp } from "@/api/interfaces/lawyers";
import { addLawyer, bulkUploadLawyers } from "@/api/lawyers";
import AddMultipleIcon from "@/assets/icons/add-multiple-icon";
import AddSingleIcon from "@/assets/icons/add-single-icon";
import ConfirmIcon from "@/assets/icons/confirm-icon";
import MultiUploadIcon from "@/assets/icons/multi-upload-icon";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import PageLoader from "@/components/ui/page-loader";
import { Select } from "@/components/ui/select";
import { LawyerSchema } from "@/schema/lawyer";
import { AreaOfPractice } from "@/utils/others/area-of-practice";
import { States } from "@/utils/others/states";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { ChangeEvent } from "preact/compat";
import { useState } from "preact/hooks";

interface AddProps {
  state: boolean;
  handleModalClose: any;
  refresh(): void;
  branch: IBranch[] | undefined;
}
const AddLawyer: FunctionalComponent<AddProps> = ({
  state,
  handleModalClose,
  refresh,
  branch,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [multipleUploadModalOpen, setMultipleUploadModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPreview, setIsPreview] = useState<boolean>(false);

  const addLawyerRequest = useRequest<LawyerProp>(addLawyer);
  const uploadLawyerRequest = useRequest<{ file: File }>(bulkUploadLawyers);

  async function submit(body: any) {
    const [response, _err] = await addLawyerRequest.makeRequest(body);
    if (!_err) {
      setSingleModalOpen(false);
      setIsPreview(false);
      setIsOpen(true);
      form.resetForm();
      if (refresh) refresh();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  async function submitBulkUpload() {
    if (!selectedFile) return;
    const [response, _err] = await uploadLawyerRequest.makeRequest({
      file: selectedFile,
    });
    if (!_err) {
      const results = response?.results;

      if (results) {
        const { successful, failed, errors } = results;

        if (failed === 0) {
          // Complete success
          setMultipleUploadModalOpen(false);
          setSelectedFile(null);
          setIsOpen(true);
          if (refresh) refresh(); // Refresh the table
        } else {
          // Partial success or failure
          if (successful > 0) {
            NotifySuccess(
              `Upload complete. ${successful} records added successfully.`,
            );
            setMultipleUploadModalOpen(false);
            setSelectedFile(null);
            if (refresh) refresh(); // Refresh to show the successful ones
          }

          if (failed > 0) {
            const firstError = errors?.[0]?.error || "Unknown error";
            const moreErrors =
              failed > 1 ? ` (and ${failed - 1} other failures)` : "";
            NotifyError(
              `Failed to upload ${failed} records. ${firstError}${moreErrors}`,
            );
          }
        }
      } else {
        // Fallback for unexpected structure, assume success if 200 OK
        setMultipleUploadModalOpen(false);
        setSelectedFile(null);
        setIsOpen(true);
        if (refresh) refresh();
      }
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
    } else {
      NotifyError(_err?.info);
    }
  }

  const form = useFormik({
    validationSchema: LawyerSchema,
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
      is_san: false,
      is_honorable_bencher: false,
    },
    onSubmit(values, formikHelpers) {
      submit({
        ...values,
        state_name: States.filter((el) => el.code === values.state_code)[0]
          .name,
        date_of_call: values.date_of_call.split("-").reverse().join("-"),
      });
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      setSelectedFile(inputElement.files[0]);
    }
  };

  return (
    <>
      <div>
        {" "}
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="lg:px-5 py-5 flex flex-col justify-center items-center gap-6">
            <ConfirmIcon />
            <h1 className="text-sm md:text-base lg:text-lg xl:text-2xl font-bold">
              Lawyer added successfully
            </h1>
            <div className="w-full mt-3">
              <Button
                variant="primary"
                dimension="lg"
                onClick={(e) => {
                  setIsOpen(false);
                  handleModalClose();
                  e.preventDefault();
                }}
              >
                Add another lawyer
              </Button>
            </div>
            <div className="flex text-sm font-medium items-center w-full justify-center">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className=""
              >
                Back to lawyers table
              </button>
            </div>
          </div>
        </Modal>
      </div>
      <Modal
        isOpen={state}
        showCloseIcon={state}
        onClose={() => handleModalClose()}
        dimensions="lg"
      >
        <h1 className="font-bold text-lg lg:text-2xl">Add Lawyer</h1>
        <h1 className="mt-7">Select Option</h1>

        <div className="flex flex-col w-full mt-5 gap-4">
          <button
            type="button"
            onClick={() => {
              setSingleModalOpen(true);
              handleModalClose();
            }}
            className="w-full p-4 rounded border hover:border-primary-500 flex gap-3 justify-start items-center"
          >
            <AddSingleIcon />
            <p className="text-left inline-flex flex-col text-black font-medium">
              Add Individual Lawyer{" "}
              <span className="text-gray-400 text-sm -mt-1">
                Click here to add just one lawyer
              </span>
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setMultipleUploadModalOpen(true);
              handleModalClose();
            }}
            className="w-full p-4 rounded border hover:border-primary-500 flex gap-3 justify-start items-center"
          >
            <AddMultipleIcon />
            <p className="text-left inline-flex flex-col text-black font-medium">
              Add Multiple Lawyers{" "}
              <span className="text-gray-400 text-sm -mt-1">
                Click here to add multiple lawyer
              </span>
            </p>
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={singleModalOpen}
        showCloseIcon={singleModalOpen}
        onClose={() => setSingleModalOpen(false)}
        dimensions="xl"
      >
        <form onSubmit={form.handleSubmit}>
          <h1 className="font-bold text-lg lg:text-2xl">
            {isPreview ? "Preview Details" : "Add lawyer"}
          </h1>

          {!isPreview ? (
            <>
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
                    required
                    error={
                      form.touched.first_name
                        ? form.errors.first_name
                        : undefined
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
                    required
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
                    error={
                      form.touched.middle_name
                        ? form.errors.middle_name
                        : undefined
                    }
                  />
                </div>
                <div className="mt-5 w-full">
                  <Input
                    label="Enrollment Number"
                    id="scn"
                    dimension="lg"
                    variant="primary"
                    {...form.getFieldProps("scn")}
                    type="text"
                    autoComplete="scn"
                    required
                    error={form.touched.scn ? form.errors.scn : undefined}
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
                  required
                  error={form.touched.email ? form.errors.email : undefined}
                />
              </div>
              <div className="flex gap-3">
                <div className="mt-5 w-full">
                  <Input
                    label="Phone number"
                    id="phone"
                    dimension="lg"
                    variant="primary"
                    {...form.getFieldProps("phone")}
                    type="text"
                    autoComplete="phone"
                    required
                    error={form.touched.phone ? form.errors.phone : undefined}
                  />
                </div>
                <div className="mt-5 w-full">
                  <Select
                    label="Gender"
                    id="gender"
                    dimension="lg"
                    variant="primary"
                    {...form.getFieldProps("gender")}
                    type="text"
                    autoComplete="state"
                    required
                    error={form.touched.gender ? form.errors.gender : undefined}
                  >
                    <option value={""}>Select here</option>
                    <option value={"male"}>Male</option>
                    <option value={"female"}>Female</option>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-5 w-full">
                  <Select
                    label="State of origin"
                    id="state_code"
                    dimension="lg"
                    variant="primary"
                    {...form.getFieldProps("state_code")}
                    type="text"
                    autoComplete="state"
                    required
                    error={
                      form.touched.state_code
                        ? form.errors.state_code
                        : undefined
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
                    type="text"
                    autoComplete="branch"
                    required
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
                    type="text"
                    autoComplete="area_of_practice"
                    required
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
                    type="date"
                    min="1800-01-01"
                    max={new Date().toISOString().split("T")[0]}
                    autoComplete="date_of_call"
                    required
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
                  type="text"
                  autoComplete="address"
                  error={form.touched.address ? form.errors.address : undefined}
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
                    type="checkbox"
                    autoComplete="is_honorable_bencher"
                    checked={form.getFieldProps("is_honorable_bencher").value}
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <h4 className="text-gray-600 text-sm mt-3 mb-8">
                Please review every information to ensure they are all correct
                and names are spelt correctly
              </h4>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 text-gray-500">Full name:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {form.values.last_name +
                    " " +
                    form.values.first_name +
                    " " +
                    form.values.middle_name}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 text-gray-500">
                  Enrollment Number:
                </p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {form.values.scn}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 text-gray-500">Category:</p>
                <div className="w-full text-sm font-semibold lg:-ml-20 ">
                  <p> {form.values.is_san === true ? "SAN" : ""}</p>
                  <p>
                    {form.values.is_san === true &&
                    form.values.is_honorable_bencher === true
                      ? " & "
                      : ""}
                  </p>
                  <p>
                    {form.values.is_honorable_bencher === true
                      ? "Honarable Bencher"
                      : ""}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 text-gray-500">Email:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {form.values.email}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 text-gray-500">Mobile:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {form.values.phone}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 text-gray-500">
                  Date of call:
                </p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {form.values.date_of_call}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 text-gray-500">State:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {States.filter((el) => el.code === form.values.state_code)[0]
                    .name || ""}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 text-gray-500">Branch:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {form.values.branch}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 text-gray-500">
                  Area of practise:
                </p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {form.values.area_of_practice}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-t-1 border-gray-300">
                <p className="w-full text-sm pl-1 text-gray-500">Gender:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {form.values.gender}
                </p>
              </div>
              <div className="grid grid-cols-2 py-3 border-y-1 border-gray-300">
                <p className="w-full text-sm pl-1 text-gray-500">Address:</p>
                <p className="w-full text-sm font-semibold lg:-ml-20 ">
                  {form.values.address}
                </p>
              </div>
            </div>
          )}

          <div className="mt-7 w-full">
            {!isPreview ? (
              <button
                type="button"
                className="text-center w-full p-3 bg-primary-500 rounded-3xl text-white disabled:cursor-not-allowed disabled:bg-opacity-80"
                onClick={() => {
                  setIsPreview(true);
                }}
                disabled={!(form.isValid && form.dirty)}
              >
                Preview
              </button>
            ) : (
              <div className="flex flex-col gap-4 lg:gap-6">
                <div>
                  <Button
                    type="submit"
                    dimension="lg"
                    variant="primary"
                    isLoading={addLawyerRequest.isLoading}
                    disabled={!(form.isValid && form.dirty)}
                  >
                    Save
                  </Button>
                </div>
                <div>
                  <button
                    type="button"
                    className="text-center w-full p-3rounded-3xl text-black disabled:cursor-not-allowed disabled:bg-opacity-80"
                    onClick={() => {
                      setIsPreview(!isPreview);
                    }}
                  >
                    Edit information
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isPreview && (
            <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
              <button
                type="button"
                onClick={() => setSingleModalOpen(false)}
                className=""
              >
                Close
              </button>
            </div>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={multipleUploadModalOpen}
        showCloseIcon={multipleUploadModalOpen}
        onClose={() => setMultipleUploadModalOpen(false)}
        dimensions="xl"
      >
        <div className="w-full">
          <h1 className="text-lg lg:text-2xl font-bold text-black mb-6">
            Add Multiple Lawyers
          </h1>
          <p className="mb-5">
            {selectedFile ? "File selected" : "Upload CSV file"}
          </p>
          <div className="w-full h-full flex justify-center">
            <PageLoader isOutlined={uploadLawyerRequest.isLoading} />
          </div>

          {!selectedFile ? (
            <div>
              <label
                htmlFor="file-upload"
                role="button"
                className="w-full flex justify-between items-center rounded-lg border-dashed border-[1px] border-gray-400 p-2 lg:p-6 mb-5"
              >
                <input
                  id="file-upload"
                  name="file-upload"
                  onChange={handleFileChange}
                  type="file"
                  accept=".png, .jpg, .jpeg, .xlsx, .xls, .csv"
                  className="sr-only"
                />
                <div className=" flex gap-6 w-fit">
                  <MultiUploadIcon />{" "}
                  <div className=" flex flex-col gap-3">
                    <p className="text-sm">
                      Select a file or drag and drop here
                    </p>
                    <p className="text-xs text-gray-400">
                      Can only accept CSV or Excel file.
                    </p>
                  </div>
                </div>
                <div className="border-[1px] lg:px-4 lg:py-3 p-2 text-xs lg:text-sm border-primary-500 text-primary-500 rounded-3xl text-center">
                  Select file
                </div>
              </label>

              <a href="/upload_lawyer_sample.xlsx" className="flex gap-3">
                <ArrowDownTrayIcon className="w-5 h-5 text-primary-500" />
                <p className="text-primary-500 text-sm">
                  Download CSV template
                </p>
              </a>
            </div>
          ) : (
            <div className="w-full">
              <div className=" p-2 w-full flex justify-between items-center rounded relative bg-gray-100 h-12 mb-6">
                <div className=" flex justify-left items-center h-full gap-2 w-3/5">
                  <DocumentTextIcon className="h-5 w-5 text-primary-500" />
                  <p className="text-xs">{selectedFile?.name || " "}</p>
                  <div className="h-1 w-1 bg-gray-700 rounded-full"></div>
                  <p className="text-xs">
                    {selectedFile?.size
                      ? (selectedFile.size / 1024).toFixed(2) + " kb"
                      : " "}
                  </p>
                </div>

                <XCircleIcon
                  role="button"
                  onClick={() => {
                    setSelectedFile(null);
                  }}
                  className="absolute w-7 h-7 text-red-500 -top-4 -right-2"
                />
              </div>

              <Button
                variant="primary"
                dimension="lg"
                onClick={submitBulkUpload}
                isLoading={uploadLawyerRequest.isLoading}
              >
                Add lawyers
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
export default AddLawyer;
