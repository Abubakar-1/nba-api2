import {
  getAdminStampSealOrder,
  getAdminStampSealOrderLogs,
  verifyAdminStampSealOrder,
  updateAdminStampSealOrderStatus,
  markAdminStampSealOrder,
} from "@/api/stamp-seal-request";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadItem,
  TableRow,
} from "@/components/ui/table";
import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const StampSealRequestsDetail: FunctionalComponent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [markedState, setMarkedState] = useState({
    printed: false,
    delivered: false,
  });

  // Modals
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Form States
  const [verifyForm, setVerifyForm] = useState({
    remark_status: "APPROVED",
    remark: "",
  });
  const [statusForm, setStatusForm] = useState({
    request_type: "",
    remark: "",
  });

  const getDetailsRequest = useRequest(getAdminStampSealOrder);
  const getLogsRequest = useRequest(getAdminStampSealOrderLogs);
  const verifyRequest = useRequest(verifyAdminStampSealOrder);
  const updateStatusRequest = useRequest(updateAdminStampSealOrderStatus);
  const markRequest = useRequest(markAdminStampSealOrder);

  const location = useLocation();
  const stateData = location.state;

  const fetchData = async (force = false) => {
    if (!id) return;

    if (force || (!stateData && !details)) {
      const [res, err] = await getDetailsRequest.makeRequest({ id });
      if (!err && res) {
        setDetails(res);
        setMarkedState({ printed: res.printed, delivered: res.delivered });
        setStatusForm((f) => ({ ...f, request_type: res.request_type || "" }));
      }
    } else if (stateData && !details) {
      // Initialize from state
      setDetails(stateData);
      setMarkedState({
        printed: stateData.printed,
        delivered: stateData.delivered,
      });
      setStatusForm((f) => ({
        ...f,
        request_type: stateData.request_type || "",
      }));
    }

    const [logsRes, logsErr] = await getLogsRequest.makeRequest({ id });
    if (!logsErr && logsRes) {
      setLogs(logsRes);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, stateData]);

  const handleVerify = async () => {
    const [res, err] = await verifyRequest.makeRequest({ id, ...verifyForm });
    if (!err) {
      NotifySuccess("Order verification updated successfully");
      setVerifyModalOpen(false);
      fetchData(true);
      window.location.reload();
    } else {
      NotifyError(err?.message || "Failed to verify order");
    }
  };

  const handleUpdateStatus = async () => {
    const [res, err] = await updateStatusRequest.makeRequest({
      id,
      ...statusForm,
    });
    if (!err) {
      NotifySuccess("Order status updated successfully");
      setStatusModalOpen(false);
      fetchData(true);
      window.location.reload();
    } else {
      NotifyError(err?.message || "Failed to update status");
    }
  };

  const handleMark = async (key: "printed" | "delivered", value: boolean) => {
    const newState = { ...markedState, [key]: value };
    setMarkedState(newState);

    const [res, err] = await markRequest.makeRequest({ id, ...newState });
    if (!err) {
      NotifySuccess(`Order marked as ${key} ${value ? "true" : "false"}`);
      fetchData(true);
      window.location.reload();
    } else {
      NotifyError(err?.message || "Failed to mark order");
      setMarkedState({
        printed: details.printed,
        delivered: details.delivered,
      }); // Revert
    }
  };

  if (getDetailsRequest.isLoading && !details) {
    return (
      <div className="flex justify-center items-center h-96">
        <PageLoader isOutlined />
      </div>
    );
  }

  return (
    <div className="px-4 mb-20">
      <PageTitle title={`Stamp/Seal Request #${id}`} />

      <div className="flex items-center gap-4 mt-7 mb-6">
        <button
          onClick={() => navigate("/stampseal/doc")}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-bold text-xl lg:text-2xl">Request Details</h1>
      </div>

      {details && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="font-bold text-lg mb-4 text-primary-500 border-b pb-2">
                Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow
                  label="Recipient"
                  value={details.recipient || details.payer_name}
                />
                <DetailRow
                  label="SCN"
                  value={details.recipient_scn || details.scn}
                />
                <DetailRow
                  label="Type"
                  value={details.type || details.seal_type}
                />
                <DetailRow
                  label="Current Status"
                  value={details.remark_status}
                />
                <DetailRow
                  label="Amount"
                  value={`₦${(details.amount || 0).toLocaleString()}`}
                />
                <DetailRow label="Payment ID" value={details.payment_id} />
                <DetailRow
                  label="Payment Status"
                  value={details.payment_status}
                />
                <DetailRow
                  label="Created At"
                  value={
                    details.created_at
                      ? new Date(details.created_at).toLocaleString()
                      : "N/A"
                  }
                />
                <DetailRow
                  label="Verify Status"
                  value={details.verified ? "Verified" : "Not Verified"}
                />
                <DetailRow label="Branch" value={details.branch} />
              </div>
            </div>

            {/* Verification Logs */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="font-bold text-lg mb-4 text-primary-500 border-b pb-2">
                Activity Logs
              </h2>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeadItem>Date</TableHeadItem>
                    <TableHeadItem>Action</TableHeadItem>
                    <TableHeadItem>Admin</TableHeadItem>
                    <TableHeadItem>Remark</TableHeadItem>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length > 0 ? (
                    logs.map((log: any, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {log.created_at
                            ? new Date(log.created_at).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {log.action || log.status || "Update"}
                        </TableCell>
                        <TableCell>{log.admin_name || "System"}</TableCell>
                        <TableCell>{log.remark || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell alignment="center" colSpan={4}>
                        No logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Status Actions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="font-bold text-lg mb-4 text-primary-500">
                Actions
              </h2>
              <div className="space-y-4">
                <Button
                  className="w-full justify-center"
                  onClick={() => setVerifyModalOpen(true)}
                  dimension="md"
                  variant="primary"
                >
                  Verify Request
                </Button>

                <Button
                  className="w-full justify-center"
                  variant="outline"
                  dimension="md"
                  onClick={() => setStatusModalOpen(true)}
                >
                  Update Status
                </Button>
              </div>
            </div>

            {/* Mark Actions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="font-bold text-lg mb-4 text-primary-500">
                Fulfillment
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="printed"
                    className="w-5 h-5"
                    checked={markedState.printed}
                    onChange={(e: any) =>
                      handleMark("printed", e.target.checked)
                    }
                    disabled={markRequest.isLoading}
                  />
                  <label htmlFor="printed" className="font-medium">
                    Mark as Printed
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="delivered"
                    className="w-5 h-5"
                    checked={markedState.delivered}
                    onChange={(e: any) =>
                      handleMark("delivered", e.target.checked)
                    }
                    disabled={markRequest.isLoading}
                  />
                  <label htmlFor="delivered" className="font-medium">
                    Mark as Delivered
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        showCloseIcon
      >
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Verify Documents</h3>
          <div>
            <Select
              label="Status"
              value={verifyForm.remark_status}
              onChange={(e: any) =>
                setVerifyForm({ ...verifyForm, remark_status: e.target.value })
              }
            >
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
            </Select>
          </div>
          <div>
            <Input
              label="Remark"
              variant="primary"
              dimension="md"
              value={verifyForm.remark}
              onChange={(e: any) =>
                setVerifyForm({ ...verifyForm, remark: e.target.value })
              }
              placeholder="Enter remark"
            />
          </div>
          <Button
            onClick={handleVerify}
            disabled={verifyRequest.isLoading}
            isLoading={verifyRequest.isLoading}
            className="w-full mt-4"
            variant="primary"
            dimension="lg"
          >
            Submit Verification
          </Button>
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        showCloseIcon
      >
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Update Order Status</h3>
          <div>
            <Select
              label="New Status"
              value={statusForm.request_type}
              onChange={(e: any) =>
                setStatusForm({ ...statusForm, request_type: e.target.value })
              }
            >
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="COMPLETED">COMPLETED</option>
            </Select>
          </div>
          <div>
            <Input
              label="Remark"
              variant="primary"
              dimension="md"
              value={statusForm.remark}
              onChange={(e: any) =>
                setStatusForm({ ...statusForm, remark: e.target.value })
              }
              placeholder="Enter remark"
            />
          </div>
          <Button
            onClick={handleUpdateStatus}
            disabled={updateStatusRequest.isLoading}
            isLoading={updateStatusRequest.isLoading}
            className="w-full mt-4"
            variant="primary"
            dimension="lg"
          >
            Update Status
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: any }) => (
  <div className="py-2 border-b border-gray-100 last:border-0">
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    <p className="font-semibold text-gray-900 break-words">{value || "N/A"}</p>
  </div>
);

export default StampSealRequestsDetail;
