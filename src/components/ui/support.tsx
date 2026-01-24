import {
  ChatBubbleBottomCenterIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useState } from "preact/hooks";
import Button from "./button";
import Input from "./input";
import { Modal } from "./modal";
import { Select } from "./select";
import SupportIcon from "@/assets/icons/support-icon";
import { NotifyError, NotifySuccess } from "../toast/toast";
import { ChangeEvent } from "preact/compat";
import * as yup from "yup";
import { useFormik } from "formik";
import { useRequest } from "../hooks/use-request";
import { sendIssue } from "@/api/support";
import { ISupportRequest } from "@/api/interfaces/support";

const Support = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState("");
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null);

  const sendIssueRequest = useRequest<ISupportRequest>(sendIssue);

  async function sendTicket(formData: ISupportRequest) {
    const [response, _err] = await sendIssueRequest.makeRequest(formData);
    if (!_err) {
      NotifySuccess("Your ticket has been created successfully!");
      setSelectedFile(null);
      setFileName("");
      form.resetForm();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      form.resetForm();
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  const validationSchema = yup.object({
    issue: yup.string().required(),
    message: yup.string().required(),
    sender_name: yup.string().required("your name is required"),
    sender_email: yup
      .string()
      .email("your email must be a valid email")
      .required("your email is required"),
  });

  const handleModal = () => {
    setIsOpen(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // const imageFile: File = (event.target as HTMLInputElement).files![0];
    const imageFile: FileList = (event.target as HTMLInputElement).files!;
    // const fileExtension: string = imageFile.name.split(".").pop()!;
    const fileExtension: string = imageFile[0].name.split(".").pop()!;
    // setFileName(
    //   imageFile.name.split(".").slice(0, -1).join(".") + `.${fileExtension}`
    // );
    setFileName(
      imageFile[0].name.split(".").slice(0, -1).join(".") + `.${fileExtension}`,
    );
    setSelectedFile(imageFile);
    //set image file
    // const inputElement = event.target as HTMLInputElement;
    // if (inputElement.files && inputElement.files.length > 0) {
    // setSelectedFile(imageFile);
    // }
  };

  const form = useFormik({
    initialValues: {
      issue: "",
      message: "",
      sender_name: "",
      sender_email: "",
    },
    onSubmit(values) {
      const data = { ...values, files: selectedFile };
      sendTicket(data);
    },
    validationSchema,
  });

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onClose={() => handleModal()}
        showCloseIcon={isOpen}
        dimensions="lg"
      >
        <form onSubmit={form.handleSubmit}>
          <h1 className="text-2xl font-bold mb-3">Contact support</h1>
          <div className="mt-5 w-full">
            <Input
              type="text"
              label="Enter your name"
              variant="primary"
              dimension="lg"
              required
              {...form.getFieldProps("sender_name")}
              error={
                form.touched.sender_name ? form.errors.sender_name : undefined
              }
            />
          </div>
          <div className="mt-5 w-full">
            <Input
              type="email"
              label="Enter your email"
              variant="primary"
              dimension="lg"
              required
              {...form.getFieldProps("sender_email")}
              error={
                form.touched.sender_email ? form.errors.sender_email : undefined
              }
            />
          </div>
          <div className="mt-5 w-full">
            <Select
              label="Issue"
              id="issue"
              variant="primary"
              dimension="lg"
              required
              {...form.getFieldProps("issue")}
              error={form.touched.issue ? form.errors.issue : undefined}
            >
              <option value="" disabled selected>
                Select
              </option>
              <option value="Conference Registration">
                Conference Registration
              </option>
              <option value="Name Correction"> Name Correction</option>
              <option value="Missing Enrollment Number">
                Missing Enrollment Number
              </option>
              <option value="Change of Name Request">
                Change of Name Request
              </option>
              <option value="Login/Onboarding complaint">
                Login/Onboarding complaint
              </option>
              <option value="Issues with NIN verification">
                Issues with NIN verification
              </option>
              <option value="Payment Complaint">Payment Complaint</option>
              <option value="Wrong Year of Call">Wrong Year of Call</option>
              <option value="Others">Other complaints</option>
            </Select>
          </div>
          <div className="flex flex-col justify-center items-start">
            <p className=""></p>
            <div className=" mt-5 w-full ">
              <div className="flex items-center bg-[#EFF4FF]">
                <label
                  htmlFor="file-upload"
                  className="flex justify-between items-center w-5/6 h-11 px-4  hover:cursor-pointer"
                >
                  <div className="flex justify-start items-center">
                    <SupportIcon />{" "}
                    <p className="text-sm text-blue-600 font-semibold ml-7">
                      {fileName || "Attatch file"}
                    </p>
                  </div>
                </label>
                <div
                  className="px-2 h-full w-1/6"
                  onClick={() => setFileName("")}
                >
                  {fileName && (
                    <XMarkIcon className="text-gray-600 font-semibold w-6 h-6" />
                  )}
                </div>
              </div>
              <input
                id="file-upload"
                name="file-upload"
                onChange={handleFileChange}
                type="file"
                accept=".png, .jpg, .jpeg, .pdf, .docx"
                className="sr-only"
                // onChange={(e: ChangeEvent<HTMLInputElement>) => {
                //   const imageFile: File = (e.target as HTMLInputElement)
                //    .files![0];
                //   const fileExtension: string = imageFile.name
                //     .split(".")
                //     .pop()!;
                //   setFileName(
                //     imageFile.name.split(".").slice(0, -1).join(".") +
                //       `.${fileExtension}`
                //   );
                // }}
              />
            </div>
          </div>
          <div className="mt-5 w-full">
            <label
              htmlFor="message"
              className="block text-sm text-left font-normal text-gray-700"
            >
              Message
            </label>
            <textarea
              id="message"
              className="h-24 w-full focus:outline-none border rounded p-1"
              required
              {...form.getFieldProps("message")}
            ></textarea>
            {form.touched.issue ? (
              <p className="text-xs text-red-500 text-left">
                {form.errors.issue}
              </p>
            ) : undefined}
          </div>
          <div className="mt-5 w-full">
            <Button
              variant="primary"
              dimension="lg"
              type="submit"
              isLoading={sendIssueRequest.isLoading}
            >
              send message
            </Button>
          </div>
          <div className="mt-5 w-full">
            <Button
              variant="primary"
              dimension="lg"
              type="button"
              className="w-full block text-lg text-center font-medium text-gray-700"
              onClick={() => handleModal()}
            >
              cancel
            </Button>
          </div>
        </form>
      </Modal>
      <div className="fixed right-2 bottom-5 lg:bottom-20 lg:right-20 w-fit">
        <div
          className="flex justify-end items-center gap-5"
          role="button"
          onClick={() => setIsOpen(true)}
        >
          <p className="hidden font-medium lg:block">Contact support</p>
          <div className="p-1 w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-primary-500">
            <ChatBubbleBottomCenterIcon className="lg:mt-[0.3rem] w-5 h-5 lg:w-8 lg:h-8 inline-flex justify-end text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
