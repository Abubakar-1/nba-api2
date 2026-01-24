import clientRequest from "./client";
import { handleRequest } from "./client/request";

export interface ConferencePaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

import { API_CONFIG } from "./config";

const BASE_URL = API_CONFIG.MAIN_API;

function getConferenceStatus(params?: ConferencePaymentFilters) {
  const queryParams = params
    ? new URLSearchParams(params as any).toString()
    : "";
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/conference/payments${queryParams ? `?${queryParams}` : ""}`)
  );
}

function getCategory() {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get("/conference/categories")
  );
}

function getCategoryDetails(id: string | number) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/conference/categories/${id}`)
  );
}
function initiateConference(body: any) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).post("/conference/payment/initialize", body)
  );
}

function updateConference(payload: any) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).put(`/conference/${payload.id}`, payload.body)
  );
}

function getPaymentPreview() {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get("/conference/invoice-preview")
  );
}

function makePayment(body?: {
  year?: number;
  type?: string;
  participation?: "physical" | "virtual";
  payment_rate?: "early_bird" | "regular" | "late";
  quantity?: number;
  payment_gateway?: "PAYSTACK" | "FLUTTERWAVE";
}) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).post("/conference/payment/initialize", body || {})
  );
}

function verifyConferencePayment(data: { ref: string }) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).post(`/conference/payment/verify`, { reference: data.ref })
  );
}

function getUserConference(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/conference/payments?${params}`)
  );
}

function getAdminConference(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/admin/conferences?${params}`)
  );
}

function getAdminConferenceDetails(id: string | number) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/admin/conferences/${id}`)
  );
}

function viewConferencePayment(data: { val: string }) {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/conference/email-receipts/${data.val}`)
  );
}

function groupPaymentPreview(body: { uploadFile: File; organization: string }) {
  const formData = new FormData();
  formData.append("file", body.uploadFile, body.uploadFile.name);
  formData.append("organization", body.organization);
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "multipart/form-data",
        "ngrok-skip-browser-warning": "your-value",
      },
    }).post("/conference/group-reg/preview", formData)
  );
}

function groupPayment(body: { uploadFile: File; organization: string }) {
  const formData = new FormData();
  formData.append("file", body.uploadFile, body.uploadFile.name);
  formData.append("organization", body.organization);
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "multipart/form-data",
        "ngrok-skip-browser-warning": "your-value",
      },
    }).post("/conference/group-reg/complete", formData)
  );
}

function getAdminConferenceMetrics() {
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get("/admin/conference/metrics")
  );
}

function getConferencePayments(params: any) {
  const queryParams = new URLSearchParams(params).toString();
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/conference/payments?${queryParams}`)
  );
}

export {
  getConferenceStatus,
  getCategory,
  initiateConference,
  updateConference,
  getPaymentPreview,
  makePayment,
  verifyConferencePayment,
  getUserConference,
  getAdminConference,
  getAdminConferenceDetails,
  viewConferencePayment,
  groupPaymentPreview,
  groupPayment,
  getAdminConferenceMetrics,
  getCategoryDetails,
  getConferencePayments,
};
