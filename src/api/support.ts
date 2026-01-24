import clientRequest from "./client";
import { handleRequest } from "./client/request";
import { ISupportRequest } from "./interfaces/support";

const BASE_URL = {
  baseURL: import.meta.env.VITE_AUTH_API_URL,
};

function sendIssue(body: ISupportRequest) {
  const file = body.files;

  const formData = new FormData();
  formData.append("name", body.sender_name);
  formData.append("email", body.sender_email);
  formData.append("issue", body.issue);
  formData.append("message", body.message);

  // Add attachment if provided (only first file, max 10MB)
  if (file && file.length > 0) {
    formData.append("attachment", file[0], file[0].name);
  }

  return handleRequest(() =>
    clientRequest({
      baseURL: BASE_URL.baseURL,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).post("/contact-support", formData),
  );
}

export { sendIssue };
