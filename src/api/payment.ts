import clientRequest, { clientRequest2 } from "./client";
import { handleRequest } from "./client/request";
import { BPFPaymentProp, IUploadStampDocument } from "./interfaces/payment";
import { API_CONFIG } from "./config";

const BASE_URL = API_CONFIG.AUTH_API;

//get payment
function paymentInvoice(body: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).post("/bpf-payment/initialize", body),
  );
}

function generateInvoicePreview(body: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).post("/bpf-payment/initialize", body),
  );
}

function generateBranchDuesInvoicePreview(body: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).post("/branch-dues/initialize", body),
  );
}

function verifyPayment(body: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).post(`/bpf-payment/verify`, body),
  );
}

function verifyStampAndSealPayment(body: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).post(`/stamp-seal/verify`, body),
  );
}

function verifyBranchDuesPayment(body: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).post(`/branch-dues/verify`, body),
  );
}

function verifyBranchDuesImmediately(params: {
  reference: string;
  transaction_id: string | number;
}) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/branch-dues/verify-immediately`, { params }),
  );
}

// get stamp items / list products
function getStampItems() {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get("/stamp-seal/prices"),
  );
}

function getTransactionStatus(params?: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/bpf-payment/status`, { params }),
  );
}

function getBranchDuesStatus(params?: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/branch-dues/status`, { params }),
  );
}

function getBPFHistory(params?: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/bpf-payment/history`, { params }),
  );
}

function getBranchDuesHistory(params?: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/branch-dues/history`, { params }),
  );
}

// create stamp order / initialize payment
function initializeStampPayment(body: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).post(`/stamp-seal/orders`, body),
  );
}

function uploadStampAndSealDoc(data: IUploadStampDocument) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).put(`/stamp-seal/orders/${data.orderId || 1}/upload-attachment`, data),
  );
}

export {
  paymentInvoice,
  generateInvoicePreview,
  verifyPayment,
  getStampItems,
  getTransactionStatus,
  uploadStampAndSealDoc,
  getBPFHistory,
  initializeStampPayment,
  generateBranchDuesInvoicePreview,
  getStampOrders,
  submitBranchFeeProof,
  verifyBranchDuesPayment,
  verifyBranchDuesImmediately,
  getBranchDuesStatus,
  getBranchDuesHistory,
  verifyBPFImmediately,
  verifyStampAndSealPayment,
  verifyPaymentByReference,
  payBalance,
};

function payBalance(body: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).post("/bpf-payment/pay-balance", body),
  );
}

function submitBranchFeeProof(body: any) {
  return handleRequest(() =>
    clientRequest({
      headers: {
        "ngrok-skip-browser-warning": "your-value",
        "Content-Type": "multipart/form-data",
      },
      baseURL: BASE_URL,
    }).post(`/stamp-seal/branch-fee/submit-payment`, body),
  );
}

// verify bpf immediately
function verifyBPFImmediately(params: {
  reference: string;
  transaction_id: string;
}) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/bpf-payment/verify-immediately`, { params }),
  );
}

function getStampOrders(params?: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/stamp-seal/orders`, { params }),
  );
}

// Verify payment by reference using PATCH endpoint
function verifyPaymentByReference(reference: string) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).patch(`/payments/${reference}/verify`),
  );
}
