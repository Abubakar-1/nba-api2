import { handleRequest } from "@/api/client/request";
import clientRequest from "@/api/client";

const APP_URL = import.meta.env.VITE_AUTH_API_URL;

function getEmailReceipt(data: { id: string }) {
  // const params = new URLSearchParams(queryParams);
  return handleRequest(() =>
    clientRequest().get(`/payment/email-receipts/${data.id}`)
  );
}

export { getEmailReceipt };
