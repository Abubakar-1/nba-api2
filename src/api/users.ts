import clientRequest from "./client";
import { handleRequest } from "./client/request";
import { API_CONFIG } from "./config";

const BASE_URL = API_CONFIG.AUTH_API;

function getUser(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/users/paginated?${params}`),
  );
}

function getRoles() {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/roles`),
  );
}

function addAdmin(body: any) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).post("/admin/create-new-admin", body),
  );
}

function updateAdmin(payload: { id: string | number; body: any }) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).put(`/admin/update-admin/${payload.id}`, payload.body),
  );
}

function getAdminUsers(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/admin-users?${params}`),
  );
}

export { getUser, getRoles, addAdmin, getAdminUsers, updateAdmin };
