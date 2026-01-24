import clientRequest, { clientRequest2 } from "./client";
import { handleRequest } from "./client/request";
import { LawyerProp } from "./interfaces/lawyers";
import { API_CONFIG } from "./config";

const BASE_URL = API_CONFIG.AUTH_API;

function getLawyers(data: any) {
  const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  const params = new URLSearchParams(filteredData);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/lawyers?${params}`),
  );
}

function getAdminLawyers(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/lawyers?${params}`),
  );
}

function getAdminLawyerStats() {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/lawyers/stats`),
  );
}

function getAdminLawyerDetails(data: { id: string | number }) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/lawyers/${data.id}`),
  );
}

function getAdminVerifiedNIN(data: any) {
  // Filter out empty string/null/undefined values
  const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  const params = new URLSearchParams(filteredData);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/verified-nin?${params}`),
  );
}

function getAdminVerifiedNINDetails(data: { id: string | number }) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/verified-nin/${data.id}`),
  );
}

function editLawyer(body: LawyerProp | any) {
  const { id, ...data } = body;
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).put(`/admin/lawyer-user/${id}`, data),
  );
}

function changeLawyerStatus(data: { isActive: boolean; id: number }) {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).patch(
      `/admin/update-admin-status/${data.id}`,
      { enabled: data.isActive },
    ),
  );
}

function addLawyer(body: any) {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).post(
      "/admin/lawyers/create-new-lawyer",
      body,
    ),
  );
}

function addLawyerByFilePreview(body: { uploadFile: File }) {
  const formData = new FormData();
  formData.append("file", body.uploadFile, body.uploadFile.name);
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).post("/lawyers/upload/preview", formData),
  );
}
function addLawyerByFileComplete(body: { uploadFile: File }) {
  const formData = new FormData();
  formData.append("file", body.uploadFile, body.uploadFile.name);
  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).post("/lawyers/upload/complete", formData),
  );
}

function getLawyerInfo(data: { id: string }) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/users/${data.id}`),
  );
}

export {
  getLawyers,
  getAdminLawyers,
  getAdminLawyerStats,
  getAdminLawyerDetails,
  getAdminVerifiedNIN,
  getAdminVerifiedNINDetails,
  editLawyer,
  changeLawyerStatus,
  addLawyer,
  getLawyerInfo,
  addLawyerByFilePreview,
  addLawyerByFileComplete,
  getBranchLawyers,
};

function getBranchLawyers(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/lawyers/branch?${params}`),
  );
}

export interface DeleteLawyerPayload {
  scn: string;
  auth_key: string;
  admin_token: string;
}

export const deleteLawyerByScn = async (
  payload: DeleteLawyerPayload,
): Promise<any> => {
  return handleRequest(() => clientRequest2().post("/delete-lawyer", payload));
};
