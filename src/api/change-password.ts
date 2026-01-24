import { handleRequest } from "@/api/client/request";
import clientRequest from "@/api/client";

const APP_URL = import.meta.env.VITE_AUTH_API_URL;

function changePassword(body: any) {
  // Transform field names to match backend expectations
  const transformedBody = {
    currentPassword: body.old_password,
    newPassword: body.new_password,
    confirmPassword: body.confirm_password,
  };
  
  return handleRequest(() =>
    clientRequest().put("/user/password", transformedBody, { baseURL: APP_URL })
  );
}

export { changePassword };
