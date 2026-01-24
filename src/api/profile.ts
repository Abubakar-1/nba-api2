import clientRequest from "./client";
import { handleRequest } from "./client/request";

const APP_URL = import.meta.env.VITE_AUTH_API2_URL;

function getProfile() {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: APP_URL,
    }).get("/user/profile"),
  );
}

function updateProfile(body: any) {
  return handleRequest(() =>
    clientRequest().put("/user/profile", body, { baseURL: APP_URL }),
  );
}

function deleteProfile() {
  return handleRequest(() =>
    clientRequest().delete("/user/soft-delete", { baseURL: APP_URL }),
  );
}

function verifyNIN(body: any) {
  return handleRequest(() =>
    clientRequest().post("nin-verification/verify", body, { baseURL: APP_URL }),
  );
}

function getNIN() {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: APP_URL,
    }).get("/nin-verification/check-verification"),
  );
}

function getVerifiedNINRecords(params: any) {
  const queryParams = new URLSearchParams(params);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: APP_URL,
    }).get(`/admin/verified-nin?${queryParams}`),
  );
}

export {
  getProfile,
  updateProfile,
  verifyNIN,
  getNIN,
  deleteProfile,
  getVerifiedNINRecords,
};
