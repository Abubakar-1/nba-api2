import { IUploadLawyerPreview } from "@/api/interfaces/lawyers";
import { addLawyerByFileComplete } from "@/api/lawyers";
import { useRequest } from "@/components/hooks/use-request";
import { Fragment } from "preact";
import { NotifyError } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadItem,
  TableRow,
} from "@/components/ui/table";
import { FunctionalComponent } from "preact";

interface UploadProps {
  state: boolean;
  handleModalClose: any;
  file: File | null;
  handleLawyerUploadSuccess: any;
  previewResponse: IUploadLawyerPreview[] | undefined;
}
const PreviewLawyerUpload: FunctionalComponent<UploadProps> = ({
  state,
  handleModalClose,
  previewResponse,
  handleLawyerUploadSuccess,
  file,
}) => {
  const uplaodLawyerRequest = useRequest<{ uploadFile: File }>(
    addLawyerByFileComplete
  );

  async function uploadCompleted(file: { uploadFile: File }) {
    const [response, _err] = await uplaodLawyerRequest.makeRequest(file);
    if (!_err) {
      handleLawyerUploadSuccess();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  return (
    <>
      <Modal
        dimensions="screen"
        isOpen={state}
        showCloseIcon={state}
        onClose={() => handleModalClose()}
      >
        <>
          <h1 className="text-sm md:text-base lg:text-lg xl:text-2xl font-bold mb-2">
            Preview uploaded records
          </h1>
          <p className="text-gray-500 text-sm">
            Successfully uploaded records of lawyers.{" "}
            <span className="font-bold text-primary-500">
              {previewResponse?.length} records
            </span>
          </p>
          <div className="mt-10">
            <Table>
              <TableHead textSize="xs">
                <TableHeadItem>SCN NUMBER</TableHeadItem>
                <TableHeadItem>FILE NAME</TableHeadItem>
                <TableHeadItem>EMAIL ADDRESS</TableHeadItem>
                <TableHeadItem>MOBILE</TableHeadItem>
                <TableHeadItem>YEAR OF CALL</TableHeadItem>
                <TableHeadItem>CATEGORY</TableHeadItem>
                <TableHeadItem>GENDER</TableHeadItem>
                <TableHeadItem>STATE</TableHeadItem>
                <TableHeadItem>ADDRESS</TableHeadItem>
              </TableHead>
              <TableBody>
                {previewResponse?.map(
                  (row: IUploadLawyerPreview, idx: number) => (
                    <TableRow>
                      <TableCell alignment="left">{row.scn}</TableCell>
                      <TableCell alignment="left">
                        <p
                          title={
                            row.last_name +
                            " " +
                            row.first_name +
                            " " +
                            row.middle_name
                          }
                          className="max-w-[12rem] truncate font-semibold"
                        >
                          {row.last_name +
                            " " +
                            row.first_name +
                            " " +
                            row.middle_name}
                        </p>
                      </TableCell>
                      <TableCell alignment="left">{row.email}</TableCell>
                      <TableCell alignment="left">{row.phone}</TableCell>
                      <TableCell alignment="left">
                        <p className="ml-2 max-w-[12rem] truncate">
                          {row.year_of_call}
                        </p>
                      </TableCell>
                      <TableCell alignment="left">
                        {row.category ?? ""}
                      </TableCell>
                      <TableCell alignment="left">{row.gender}</TableCell>
                      <TableCell alignment="left">{row.state ?? ""}</TableCell>
                      <TableCell alignment="left">
                        {" "}
                        <p
                          title={row.address}
                          className="ml-2 max-w-[12rem] truncate"
                        >
                          {row.address}
                        </p>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end w-full mt-10">
            <button
              type="button"
              className="w-20 p-3"
              onClick={handleModalClose}
            >
              Back
            </button>
            <div className="w-40">
              <Button
                variant="primary"
                dimension="lg"
                onClick={() => file && uploadCompleted({ uploadFile: file })}
                isLoading={uplaodLawyerRequest.isLoading}
              >
                Save
              </Button>
            </div>
          </div>
        </>
      </Modal>
    </>
  );
};
export default PreviewLawyerUpload;
