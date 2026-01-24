import clientRequest from "./client";
import { handleRequest } from "./client/request";
import { BranchProp, IBranch } from "./interfaces/branch";
import { API_CONFIG } from "./config";

const BASE_URL = API_CONFIG.AUTH_API;

function getBranches(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/branch-dues/branches?${params}`)
  );
}

function getAdminBranches(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/branches?${params}`)
  );
}

function getAdminBranchDetails(code: string) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/branches/${code}`)
  );
}

function getBranchDuesPayments(params: any) {
  const queryParams = new URLSearchParams(params).toString();
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/branch-dues/payments/branch?${queryParams}`)
  );
}

function getBranchTransactions(params: any) {
  const queryParams = new URLSearchParams(params).toString();
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/branch/transactions${queryParams}`)
  );
}

function changeBranchStatus(data: { isActive: boolean; id: number }) {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).put(
      `branches/activate/${data.id}?is_active=${data.isActive}`
    )
  );
}

function deleteBranch(data: { id: number }) {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).delete(`branches/${data.id}`)
  );
}

function addBranch(body: IBranch) {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).post("/branches", body)
  );
}

function editBranch(body: BranchProp) {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).put("/branches", body)
  );
}

function getBranchInformation() {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).get(
      "/admin/new-branch-dues/information"
    )
  );
}

function createBranchDues(body: any) {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).post("/admin/new-branch-dues", body)
  );
}

function updateBranchDues(data: { body: any }) {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).put(
      "/admin/new-branch-dues",
      data.body
    )
  );
}

function getBranchDashboard({
  branchName,
  year,
}: {
  branchName: string;
  year: string;
}) {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).get(
      `/admin/branches/${branchName}/dashboard`,
      {
        params: { year },
      }
    )
  );
}

export {
  getBranches,
  getAdminBranches,
  getAdminBranchDetails,
  getBranchDuesPayments,
  changeBranchStatus,
  deleteBranch,
  editBranch,
  addBranch,
  getBranchInformation,
  getBranchDashboard,
  createBranchDues,
  updateBranchDues,
  getBranchTransactions,
};
