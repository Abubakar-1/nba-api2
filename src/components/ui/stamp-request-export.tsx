import { FunctionComponent, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import Button from "./button";
import Input from "./input";
import { Modal } from "./modal";
import * as XLSX from "xlsx";
import { useRequest } from "../hooks/use-request";
import { NotifyError } from "../toast/toast";
import { getAdminStampSealOrdersNoPaginate } from "@/api/stamp-seal-request";
import { BtnLoader } from "./loader";
import { Select } from "./select";

interface Props {
  state: boolean;
  toggleModal: any;
  currentStampData?: any[];
  filters: {
    remark_status: string;
    search: string;
  };
}

const StampRequestExport: FunctionComponent<Props> = ({
  state,
  toggleModal,
  currentStampData,
  filters,
}) => {
  const [dates, setDates] = useState({
    start_date: "",
    end_date: "",
  });

  // Local state for the export specific filter (independent from parent)
  const [exportRemarkStatus, setExportRemarkStatus] = useState("");

  // Reset export filter when modal opens
  useEffect(() => {
    if (state) {
      setExportRemarkStatus("");
    }
  }, [state]);

  const fetchStampRequest = useRequest<{
    start_date: string;
    end_date: string;
    remark_status: string;
  }>(getAdminStampSealOrdersNoPaginate);

  const today = new Date();
  today.setDate(today.getDate() - 1);

  const maxDate = today.toISOString().split("T")[0];

  async function handleDownloadFiltered(e: Event) {
    e.preventDefault();
    if (!dates.start_date || !dates.end_date) {
      NotifyError("Please select both start and end dates");
      return;
    }

    const payload = {
      start_date: dates.start_date,
      end_date: dates.end_date,
      remark_status: exportRemarkStatus || undefined,
    };

    const [response, _err] = await fetchStampRequest.makeRequest(
      payload as any,
    );

    if (!_err) {
      let data =
        response.orders ||
        response.records ||
        response.items ||
        response.data ||
        [];

      // Perform local filtering (mostly just for search now, as status is handled by API ideally, but kept for robustness if API returns all)
      if (exportRemarkStatus || filters.search) {
        data = data.filter((item: any) => {
          let matchesType = true;
          let matchesSearch = true;

          // Request Type Filter (Double check locally just in case)
          if (exportRemarkStatus && exportRemarkStatus !== "ALL") {
            const itemType = item.remark_status
              ? item.remark_status.toUpperCase()
              : "";
            matchesType = itemType === exportRemarkStatus.toUpperCase();
          }

          // Search Filter (payer_name or recipient_scn)
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const nameObj = item.payer_name
              ? item.payer_name.toLowerCase()
              : "";
            const scnObj =
              item.recipient_scn || item.scn
                ? item.recipient_scn.toLowerCase() || item.scn.toLowerCase()
                : "";
            matchesSearch =
              nameObj.includes(searchLower) || scnObj.includes(searchLower);
          }

          return matchesType && matchesSearch;
        });
      }

      const dataToExport = data.map((d: any) => {
        return {
          "PAYER NAME": d.payer_name ? d.payer_name.toUpperCase() : "N/A",
          // "USER EMAIL": d.user_email || "N/A",
          // "PAYER EMAIL": d.payer_email,
          "PAYMENT DATE": new Date(d.created_at).toDateString(),
          AMOUNT: d.amount,
          "SCN NUMBER": d.recipient_scn || d.scn,
          BRANCH: d.branch,
          REQUEST_TYPE: d.request_type,
          "SEAL TYPE": d.seal_type,
          STATUS: d.remark_status || "PENDING",
          TYPE: d.remark_status,
        };
      });
      exportToExcel(dataToExport);
      toggleModal();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
    } else {
      NotifyError(_err?.info);
    }
  }

  const exportToExcel = (data: any[]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    };

    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "stamp-seal-export.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal isOpen={state} showCloseIcon={state} onClose={() => toggleModal()}>
      <form onSubmit={(e) => handleDownloadFiltered(e)} className="p-4">
        <h1 className="font-bold text-lg mb-2">Export Records</h1>
        <p className="mb-4 text-gray-600 text-sm">
          Select a date range to download. The records will be filtered by:
          <br />
          {filters.search && (
            <>
              <span className="font-medium">Search:</span> {filters.search}
            </>
          )}
        </p>

        <div className="flex flex-col gap-4 mb-6">
          <Input
            label="Start Date"
            id="start_date"
            dimension="lg"
            variant="primary"
            type="date"
            max={maxDate}
            value={dates.start_date}
            onChange={(e) =>
              setDates({ ...dates, start_date: e.currentTarget.value })
            }
            className="w-full"
            required
          />
          <Input
            label="End Date"
            id="end_date"
            dimension="lg"
            variant="primary"
            type="date"
            max={maxDate}
            value={dates.end_date}
            onChange={(e) =>
              setDates({ ...dates, end_date: e.currentTarget.value })
            }
            className="w-full"
            required
          />

          <div className="w-full">
            <label className="text-sm text-gray-400 font-medium mb-1 block">
              Remark Status
            </label>
            <Select
              dimension="lg"
              value={exportRemarkStatus}
              onChange={(e) => setExportRemarkStatus(e.currentTarget.value)}
              className="w-full"
            >
              <>
                <option value="">ALL</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
              </>
            </Select>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            type="submit"
            className="w-full h-11 border border-primary-500 rounded-3xl text-white bg-primary-500 disabled:cursor-not-allowed flex items-center justify-center hover:bg-primary-600 transition-colors"
            disabled={fetchStampRequest.isLoading}
          >
            {fetchStampRequest.isLoading ? (
              <BtnLoader isOutlined={true} />
            ) : (
              "Download"
            )}
          </button>

          <Button
            type="button"
            dimension="md"
            variant="primary"
            onClick={() => toggleModal()}
            className="w-full h-11 text-black bg-white border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StampRequestExport;
