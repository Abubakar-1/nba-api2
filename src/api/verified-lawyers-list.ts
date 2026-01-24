import clientRequest from "./client";
import { handleRequest } from "./client/request";

const BASE_URL = {
  baseURL: import.meta.env.VITE_AUTH_API_URL,
};
function getVerifiedList(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
    }).get(`/user-verification?${params}`)
  );
}

export { getVerifiedList };
