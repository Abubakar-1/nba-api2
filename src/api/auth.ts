import {
  ICreateUserPassword,
  ILogin,
  IUpdateUserInfo,
  IValidateOTP,
} from "@/api/interfaces/auth";
import clientRequest from "./client";
import { handleRequest } from "./client/request";

import { API_CONFIG } from "./config";

const BASE_URL = API_CONFIG.AUTH_API;
const AUTH_API2_URL = API_CONFIG.AUTH_API;

interface IVerifySCN {
  scn: string;
}
function loginApi(body: ILogin) {
  return handleRequest(() =>
    clientRequest({
      baseURL: AUTH_API2_URL,
    }).post("/auth/login", body),
  );
}

//get branch
function getAllBranch() {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get("/auth/branches"),
  );
}

//get branches for auth/signup
function getAuthBranches() {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: AUTH_API2_URL,
    }).get("/auth/branches"),
  );
}

//verify
function verifySignUpSCNApi(data: IVerifySCN) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/users/search?scn=${data.scn}`),
  );
}

//update
function updateUserInfo(body: IUpdateUserInfo) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).post("/signup", body),
  );
}

//validate
function validateUserOTP(body: IValidateOTP) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).post("/signup/validate", body),
  );
}

//create
function createUserPassword(body: ICreateUserPassword) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).post("/signup/complete", body),
  );
}

function verifySCNApi(data: { scn: string; access_token: string }) {
  return handleRequest(() =>
    clientRequest({
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        "ngrok-skip-browser-warning": "your-value",
      },
      baseURL: AUTH_API2_URL,
    }).get(`/auth/verify?id=${data.scn}`),
  );
}

function getUserDetailsApi() {
  return handleRequest(() =>
    clientRequest({
      headers: {
        "ngrok-skip-browser-warning": "your-value",
      },
      baseURL: AUTH_API2_URL,
    }).get("/user/profile"),
  );
}

function verifyLoginOtp(body: { email: string; otp: string }) {
  return handleRequest(() =>
    clientRequest({
      headers: {
        "ngrok-skip-browser-warning": "your-value",
      },
      baseURL: AUTH_API2_URL,
    }).post("/auth/verify-otp-password", body),
  );
}

function resendLoginOtp(body: { email: string }) {
  return handleRequest(() =>
    clientRequest({
      headers: {
        "ngrok-skip-browser-warning": "your-value",
      },
      baseURL: AUTH_API2_URL,
    }).post("/auth/resend-otp", body),
  );
}

function logoutApi() {
  return handleRequest(() =>
    clientRequest({ baseURL: AUTH_API2_URL }).get("/auth/logout"),
  );
}

// ============================================
// NEW SIGNUP FLOW ENDPOINTS
// ============================================

/**
 * Step 1: Find user by SCN
 */
function findSCNApi(body: { scn: string }) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: AUTH_API2_URL,
    }).post("/auth/find-scn", body),
  );
}

function findSUserCNApi(body: { scn: string }) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: AUTH_API2_URL,
    }).post("/user/find-scn", body),
  );
}

/**
 * Step 2: Register user with details
 */
function registerUserApi(body: {
  scn: string;
  area_of_practice?: string;
  gender: string;
  phone: string;
  email: string;
  branch: string;
  year_of_call?: number;
}) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: AUTH_API2_URL,
    }).post("/auth/register", body),
  );
}

/**
 * Step 3: Verify email OTP
 */
function verifyRegistrationOTPApi(body: { email: string; otp: string }) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: AUTH_API2_URL,
    }).post("/auth/register/verify-otp", body),
  );
}

/**
 * Step 4: Create password and complete registration
 */
function updateRegistrationPasswordApi(body: {
  email: string;
  password: string;
  retypePassword: string;
}) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: AUTH_API2_URL,
    }).post("/auth/register/update-password", body),
  );
}

export {
  loginApi,
  logoutApi,
  getUserDetailsApi,
  verifySCNApi,
  verifySignUpSCNApi,
  updateUserInfo,
  validateUserOTP,
  createUserPassword,
  getAllBranch,
  getAuthBranches,
  verifyLoginOtp,
  resendLoginOtp,
  // New signup flow
  findSCNApi,
  findSUserCNApi,
  registerUserApi,
  verifyRegistrationOTPApi,
  updateRegistrationPasswordApi,
};
