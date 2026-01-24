import clientRequest from "./client";
import { handleRequest } from "./client/request";
import { API_CONFIG } from "./config";

const BASE_URL = API_CONFIG.AUTH_API;

function getUserDashboard(data: { status: string }) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get("/user/dashboard/metrics")
  );
}

function getAdminDashboard(data: { year: string }) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/dashboard/metrics?year=${data.year}`)
  );
}

export { getAdminDashboard, getUserDashboard };
