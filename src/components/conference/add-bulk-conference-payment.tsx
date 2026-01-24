import { groupPayment, groupPaymentPreview } from "@/api/conference";
import { IBranch } from "@/api/interfaces/branch";
import { IBulkPaymentUpload, IBulkRecords } from "@/api/interfaces/conference";
import MultiUploadIcon from "@/assets/icons/multi-upload-icon";
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { FunctionalComponent } from "preact";
import { ChangeEvent } from "preact/compat";
import { useState } from "preact/hooks";
import { Fragment } from "preact";
import { useRequest } from "../hooks/use-request";
import { NotifyError, NotifySuccess } from "../toast/toast";
import Button from "../ui/button";
import Input from "../ui/input";
import { Modal } from "../ui/modal";
import PageLoader from "../ui/page-loader";
import {
  Table,
  TableHead,
  TableHeadItem,
  TableBody,
  TableRow,
  TableCell,
} from "../ui/table";

interface AddProps {
  state: boolean;
  handleModalClose: any;
  refresh?(): void;
}
const AddBulkConferencePayment: FunctionalComponent<AddProps> = ({
  state,
  refresh,
  handleModalClose,
}) => {
  const [organization, setOrganization] = useState("");
  const [uploadPreviewState, setUploadPreviewState] = useState(false);
  const [paymentPreviewModal, setPaymentPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreviewResponse, setUploadPreviewResponse] =
    useState<IBulkPaymentUpload>();

  const { isLoading, makeRequest, error } = useRequest<{ uploadFile: File }>(
    groupPaymentPreview
  );
  const groupPaymentRequest = useRequest<{ uploadFile: File }>(groupPayment);

  async function uploadPreview(body: {
    uploadFile: File;
    organization: string;
  }) {
    const [response, _err] = await makeRequest(body);
    if (!_err) {
      setUploadPreviewResponse(response);
      if (response.length < 1) {
        NotifyError(
          "Error! Please ensure the file you are uploading is not empty."
        );
      } else {
        setUploadPreviewState(true);
        handleModalClose();
        setPaymentPreviewModal(!paymentPreviewModal);
      }
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);

      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  async function submit() {
    const body = { uploadFile: selectedFile!, organization: organization };
    const [response, _err] = await groupPaymentRequest.makeRequest(body);
    if (!_err) {
      NotifySuccess("Payment added successfully");
      setUploadPreviewState(false);
      setSelectedFile(null);
      setOrganization("");
      setPaymentPreviewModal(!paymentPreviewModal);
      if (refresh) refresh();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (organization.length !== 0) {
      const inputElement = event.target as HTMLInputElement;
      if (inputElement.files && inputElement.files.length > 0) {
        setSelectedFile(inputElement.files[0]);
        uploadPreview({
          uploadFile: inputElement.files[0],
          organization: organization,
        });
      }
    } else NotifyError("Organization cannot be empty");
  };

  return (
    <>
      <Modal
        isOpen={state}
        showCloseIcon={state}
        onClose={() => handleModalClose()}
        dimensions="2xl"
      >
        <div className="">
          <h1 className="text-lg lg:text-2xl font-bold text-black mb-4">
            Upload Bulk Payment
          </h1>
          <div className="w-fit px-2 py-1 flex rounded  bg-yellow-500 bg-opacity-10 text-sm">
            <span className="font-bold text-red-500 ">NOTE: &nbsp;</span>
            <p className="text-tiny font-medium">
              Please be sure to enter your organization name to activate the
              file upload field.
            </p>
          </div>

          <div className="my-5 w-full">
            <Input
              onChange={(e) => {
                setOrganization(e.currentTarget.value);
              }}
              label="Organization"
              placeholder="Enter Organization"
              type="text"
              variant="primary"
              dimension="lg"
              value={organization}
            />
          </div>
          <p className="text-sm -mb-4">Upload CSV file</p>
          <div className="w-full h-full flex justify-center">
            <PageLoader isOutlined={isLoading} />
          </div>
          {!uploadPreviewState && (
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
                  accept=".png, .jpg, .jpeg, .xlsx"
                  className="sr-only"
                  disabled={organization.length === 0 ? true : false}
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
                {organization.length === 0 ? (
                  <button
                    disabled
                    type="button"
                    className="cursor-not-allowed border-[1px] lg:px-4 lg:py-3 p-2 text-xs lg:text-sm border-primary-500 text-primary-500 rounded-3xl text-center"
                  >
                    Select file
                  </button>
                ) : (
                  <div className="border-[1px] lg:px-4 lg:py-3 p-2 text-xs lg:text-sm border-primary-500 text-primary-500 rounded-3xl text-center">
                    Select file
                  </div>
                )}
              </label>

              <a href="/AGF_2024_Group_Payment.xlsx" className="flex gap-3">
                <ArrowDownTrayIcon className="w-5 h-5 text-primary-500" />
                <p className="text-primary-500 text-sm">
                  Download CSV template
                </p>
              </a>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={paymentPreviewModal}
        onClose={() => setPaymentPreviewModal(!paymentPreviewModal)}
        dimensions="screen"
      >
        <>
          <h1 className="text-lg lg:text-2xl font-bold text-black mb-1">
            Bulk Payment Preview
          </h1>
          <p className="font-bold flex justify-start items-center mb-4">
            Organization:&nbsp;
            <span className="font-normal capitalize"> {organization}</span>
          </p>
          <div className="mb-5 p-2 w-full flex justify-between items-center rounded relative bg-gray-100 h-12">
            <div className=" flex justify-left items-center h-full gap-2 w-3/5">
              <DocumentTextIcon className="h-5 w-5 text-primary-500" />
              <p className="text-xs">{selectedFile?.name || " "}</p>
              <div className="h-1 w-1 bg-gray-700 rounded-full"></div>

              {/* <div className='absolute left-0 top-0 h-10 w-10 rounded-full bg-red-500'></div> */}
            </div>
            <p className="text-xs">
              {selectedFile?.size
                ? (selectedFile.size / 1024).toFixed(2) + "kb"
                : " "}
            </p>
            <XCircleIcon
              role="button"
              onClick={() => {
                setUploadPreviewState(false);
                setSelectedFile(null);
                handleModalClose();
                setPaymentPreviewModal(!paymentPreviewModal);
              }}
              className="absolute w-7 h-7 text-red-500 -top-4 -right-2"
            />
          </div>
          <Table>
            <TableHead textSize="xs">
              <TableHeadItem>TITLE</TableHeadItem>
              <TableHeadItem>FULLNAME</TableHeadItem>
              <TableHeadItem>SCN</TableHeadItem>
              <TableHeadItem>CATEGORY</TableHeadItem>
              <TableHeadItem>DESIGNATION</TableHeadItem>
              <TableHeadItem>EMAIL</TableHeadItem>
              <TableHeadItem>YEAR OF CALL</TableHeadItem>
              <TableHeadItem>ADDRESS</TableHeadItem>
              <TableHeadItem>PARTICIPATION</TableHeadItem>
              <TableHeadItem>AMOUNT</TableHeadItem>
              <TableHeadItem>REASON</TableHeadItem>
              <TableHeadItem>STATUS</TableHeadItem>
            </TableHead>
            <TableBody>
              {uploadPreviewResponse?.records.map(
                (row: IBulkRecords, idx: number) => (
                  <TableRow>
                    <TableCell alignment="left">{row.title}</TableCell>
                    <TableCell alignment="left">{row?.fullName}</TableCell>
                    <TableCell alignment="left">{row.scn}</TableCell>
                    <TableCell alignment="left">{row.category}</TableCell>
                    <TableCell alignment="left">{row.designation}</TableCell>
                    <TableCell alignment="left">{row.email}</TableCell>
                    <TableCell alignment="left">{row.year_of_call}</TableCell>
                    <TableCell alignment="left">{row.address}</TableCell>
                    <TableCell alignment="left">{row.participation}</TableCell>
                    <TableCell alignment="left">
                      ₦{row.amount.toLocaleString()}
                    </TableCell>
                    <TableCell alignment="left">{row?.reason}</TableCell>
                    <TableCell alignment="left">{row.status}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
          <div className="mt-7 flex justify-end items-center">
            <div className="w-full lg:w-72">
              {uploadPreviewResponse?.status.toLocaleUpperCase() === "OK" ? (
                <div className="flex flex-col lg:flex-row gap-4">
                  <Button
                    type="button"
                    dimension="lg"
                    variant="primary"
                    onClick={() => submit()}
                    isLoading={groupPaymentRequest.isLoading}
                  >
                    Submit
                  </Button>
                  <Button
                    type="button"
                    dimension="lg"
                    variant="outline"
                    onClick={() => {
                      setUploadPreviewState(false);
                      setSelectedFile(null);
                      handleModalClose();
                      setPaymentPreviewModal(!paymentPreviewModal);
                    }}
                  >
                    Change file
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  dimension="lg"
                  variant="primary"
                  onClick={() => {
                    setUploadPreviewState(false);
                    setSelectedFile(null);
                    handleModalClose();
                    setPaymentPreviewModal(!paymentPreviewModal);
                  }}
                >
                  Change file
                </Button>
              )}
            </div>
          </div>
        </>
      </Modal>
    </>
  );
};
export default AddBulkConferencePayment;
