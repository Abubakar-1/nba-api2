import { submitBranchFeeProof } from "@/api/payment";
import FileIcon from "@/assets/icons/file-icon";
import MultiUploadIcon from "@/assets/icons/multi-upload-icon";

import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { XMarkIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { FileUploader } from "react-drag-drop-files";

interface StatusProps {
  toggleModal: () => void;
  modalIsOpen: boolean;
  onSuccess?: () => void;
  submissionHandler?: (data: any) => Promise<void>;
  id?: string; // Optional if not always used
}

const StampAndSealUpload: FunctionalComponent<StatusProps> = ({
  toggleModal,
  modalIsOpen,
  onSuccess,
  submissionHandler,
  id,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); // Local loading state

  const fileTypes = ["JPEG", "PNG", "JPG", "PDF"];
  // const { makeRequest, isLoading } = useRequest(submitBranchFeeProof); // Removed buggy hook

  useEffect(() => {
    if (!modalIsOpen) {
      setFile(null);
      setUploadError("");
      setIsLoading(false);
    }
  }, [modalIsOpen]);

  const handleChange = (newFile: any) => {
    if (newFile && newFile[0]) {
      setFile(newFile[0]);
      setUploadError("");
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first.");
      NotifyError("Please upload payment proof.");
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData (correct way to upload files)
      const formData = new FormData();
      formData.append("payment_proof", file);

      // 1. Handle Custom Submission (if provided)
      if (submissionHandler) {
        await submissionHandler(formData);
        NotifySuccess("Document submitted successfully");
        toggleModal();
        setIsLoading(false);
        return;
      }

      // 2. Handle Default API Submission
      const [response, error] = await submitBranchFeeProof(formData);

      if (error) {
        const errorMsg =
          error?.data?.message ||
          error?.message ||
          "Failed to upload payment proof.";
        NotifyError(errorMsg);
      } else {
        NotifySuccess("Payment proof uploaded successfully!");
        if (onSuccess) onSuccess();
        toggleModal();
      }
    } catch (e: any) {
      console.error(e);
      NotifyError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      showCloseIcon={true}
      onClose={toggleModal}
      dimensions="lg"
    >
      <div className="flex flex-col w-full">
        <h1 className="font-bold text-xl mb-3 text-gray-900">
          Stamp and Seal Upload
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Please upload proof of your branch dues payment to complete the
          process.
        </p>

        <div
          className={classNames(
            "relative w-full h-36 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center justify-center p-4",
            {
              "border-primary-500 bg-blue-50/50": !file,
              "border-green-500 bg-green-50/50": file,
            }
          )}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2 relative w-full h-full justify-center">
              <div
                className="absolute -top-2 -right-2 cursor-pointer bg-white rounded-full shadow-sm"
                onClick={() => setFile(null)}
              >
                <XMarkIcon className="w-6 h-6 text-red-500 p-1 bg-red-100 rounded-full" />
              </div>
              <FileIcon />
              <p className="text-sm font-medium text-gray-700 truncate max-w-[250px]">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <FileUploader
              multiple={true}
              handleChange={handleChange}
              name="file"
              types={fileTypes}
              maxSize={5}
              onTypeError={() => setUploadError("Unsupported file type")}
              onSizeError={() => setUploadError("File too large (max 5MB)")}
              classes="w-full h-full"
            >
              <div className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
                <MultiUploadIcon />
                <span className="mt-3 text-sm text-primary-600 font-medium">
                  Click to upload or drag & drop
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  JPG, PNG, PDF supported
                </span>
                <div className="mt-3 px-4 py-1.5 rounded-full border border-primary-500 text-primary-500 text-xs font-medium uppercase tracking-wide">
                  Select File
                </div>
              </div>
            </FileUploader>
          )}
        </div>

        {uploadError && (
          <p className="text-red-500 text-xs mt-2 text-center font-medium">
            {uploadError}
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3 w-full">
          <Button
            variant="outline"
            onClick={toggleModal}
            type="button"
            dimension="lg"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            isLoading={isLoading}
            disabled={isLoading || !file}
            type="button"
            dimension="lg"
          >
            Submit Proof
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StampAndSealUpload;
