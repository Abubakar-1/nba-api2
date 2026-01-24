import clientRequest from "./client";
import { handleRequest } from "./client/request";
import { IApprovalProps } from "./interfaces/stamp-seal-request";
import { API_CONFIG } from "./config";

const BASE_URL = API_CONFIG.MAIN_API;

// Fetch stamp-seal orders with verified, printed, delivered, page, and limit params
function getStampSealOrders(params: {
  verified?: boolean;
  printed?: boolean;
  delivered?: boolean;
  page?: number;
  limit?: number;
}) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get("/stamp-seal/orders", { params }),
  );
}

function getStampSealOrder(id: string | number) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/stamp-seal/orders/${id}`),
  );
}

function uploadStampSealAttachment(id: string | number, data: FormData) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: {
        "ngrok-skip-browser-warning": "your-value",
        "Content-Type": undefined,
      },
    }).post(`/stamp-seal/orders/${id}/upload-attachment`, data),
  );
}

function getAdminStampSealOrders(params: any) {
  // Build params object dynamically, only including non-empty values
  const apiParams: Record<string, any> = {
    page: params.page,
    limit: params.page_size || params.limit,
  };

  // Conditionally add optional parameters only if they have values
  if (params.search) apiParams.search = params.search;
  if (params.remark_status) apiParams.remark_status = params.remark_status;
  if (params.request_type) apiParams.request_type = params.request_type;
  if (params.paginated !== undefined) apiParams.paginated = params.paginated;
  if (params.start_date) apiParams.start_date = params.start_date;
  if (params.end_date) apiParams.end_date = params.end_date;

  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get("/admin/stamp-seal/orders", { params: apiParams }),
  );
}

function getAdminStampSealOrderLogs(data: { id: string | number }) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/admin/stamp-seal/orders/${data.id}/logs`),
  );
}

function getAdminStampSealTypeDetails(id: string | number) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/admin/stamp-seal/types/${id}`),
  );
}

function verifyAdminStampSealOrder(data: {
  id: string | number;
  remark_status: string;
  remark: string;
}) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).post(`/admin/stamp-seal/orders/${data.id}/verify`, {
      remark_status: data.remark_status,
      remark: data.remark,
    }),
  );
}

function updateAdminStampSealOrderStatus(data: {
  id: string | number;
  request_type: string;
  remark: string;
}) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).patch(`/admin/stamp-seal/orders/${data.id}/status`, {
      request_type: data.request_type,
      remark: data.remark,
    }),
  );
}

function markAdminStampSealOrder(data: {
  id: string | number;
  printed?: boolean;
  delivered?: boolean;
}) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).patch(`/admin/stamp-seal/orders/${data.id}/mark`, {
      printed: data.printed,
      delivered: data.delivered,
    }),
  );
}

function getAllStampSealRequest(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/stamp-seal?${params}`),
  );
}
function getMyStampSealRequest(data: any) {
  // Backend only accepts page and limit parameters
  // search and status filtering will be done client-side
  const validParams = {
    page: data.page,
    limit: data.page_size || data.limit,
  };
  const params = new URLSearchParams(
    Object.entries(validParams).filter(([_, v]) => v != null) as any,
  );
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/stamp-seal/orders?${params}`),
  );
}

function ApproveStampSealRequest(data: IApprovalProps) {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).put("/stamp-seal/verification", data),
  );
}

function StampSealRequestAttachmentRequest(data: { id: string }) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/stamp-seal/attachment/${data.id}`),
  );
}

function getStampMetrics() {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/admin/stamp-seal/stats`),
  );
}

function getUserStampRequest(data: { id: string }) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/stamp-seal/${data.id}`),
  );
}

function getStampRequestData(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).get(`/stamp-seal/export?${params}`),
  );
}

function getAdminStampSealOrder(data: { id: string | number }) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/admin/stamp-seal/orders/${data.id}`),
  );
}

function getAdminStampSealOrdersNoPaginate(params: {
  start_date: string;
  end_date: string;
  remark_status?: string;
}) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get("/admin/stamp-seal/orders/no-paginate", {
      params: {
        start_date: params.start_date,
        end_date: params.end_date,
        remark_status: params.remark_status,
      },
    }),
  );
}

export {
  getAllStampSealRequest,
  ApproveStampSealRequest,
  getMyStampSealRequest,
  StampSealRequestAttachmentRequest,
  getStampMetrics,
  getUserStampRequest,
  getStampRequestData,
  getStampSealOrders,
  getStampSealOrder,
  uploadStampSealAttachment,
  getAdminStampSealOrders,
  getAdminStampSealOrder,
  getAdminStampSealOrdersNoPaginate,
  getAdminStampSealOrderLogs,
  getAdminStampSealTypeDetails,
  verifyAdminStampSealOrder,
  updateAdminStampSealOrderStatus,
  markAdminStampSealOrder,
};
