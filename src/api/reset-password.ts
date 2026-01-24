import { handleRequest } from "@/api/client/request";
import clientRequest from "@/api/client";

const APP_URL = import.meta.env.VITE_AUTH_API2_URL;

function resetPasswordInitiate(body: { email: string }) {
  return handleRequest(() =>
    clientRequest({ baseURL: APP_URL }).post("/auth/reset-password", body)
  );
}

function resetPasswordVerify(body: any) {
  return handleRequest(() =>
    clientRequest({ baseURL: APP_URL }).post("/auth/verify-otp-password", body)
  );
}

function resetPasswordComplete(body: any) {
  return handleRequest(() =>
    clientRequest({ baseURL: APP_URL }).post("/auth/password/update", body)
  );
}

export { resetPasswordInitiate, resetPasswordVerify, resetPasswordComplete };
