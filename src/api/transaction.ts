import clientRequest from "./client";
import { handleRequest } from "./client/request";
import { BPFPaymentProp } from "./interfaces/payment";
import { OldTransactionProps } from "./interfaces/transaction";
import { API_CONFIG } from "./config";

const BASE_URL = API_CONFIG.AUTH_API;

function getTransaction(data: any) {
  // Destructure to separate page_size from the rest of the params
  const { page_size, limit, ...rest } = data;

  // Map page_size to limit as expected by the API
  const validParams = {
    ...rest,
    limit: limit || page_size,
  };

  // Create URLSearchParams from the valid params
  // Filter out undefined/null/empty values to keep the URL clean
  const params = new URLSearchParams(
    Object.entries(validParams).filter(
      ([_, v]) => v != null && v !== "",
    ) as any,
  );

  return handleRequest(async () => {
    const response = await clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/payments/my-payments?${params}`);

    // Normalize array response to match expected paginated structure
    if (Array.isArray(response.data.payments)) {
      response.data = {
        items: response.data.payments.map((item: any) => ({
          ...item,
          // Ensure fields match ITransactions interface if needed
          payer_name: item.recipient || item.payer_name || "N/A",
          reference: item.reference || item.payment_id || "N/A",
          status: item.status || "PENDING",
          payment_type:
            item.payment_type && item.payment_type !== "BPF"
              ? item.payment_type
              : item.item_description?.toLowerCase().includes("branch")
                ? "Branch Dues"
                : "BPF",
          item_description: item.item_description || "N/A",
          tag: item.tag || "",
        })),
        pagination: {
          page: response.data.pagination?.page ?? 1,
          total_rows:
            response.data.pagination?.total ??
            response.data.pagination?.total_rows ??
            response.data.payments.length,
          page_size:
            response.data.pagination?.limit ??
            response.data.pagination?.page_size ??
            20,
          limit:
            response.data.pagination?.limit ??
            response.data.pagination?.page_size ??
            20,
          total:
            response.data.pagination?.total ??
            response.data.pagination?.total_rows ??
            response.data.payments.length,
          totalPages: response.data.pagination?.totalPages ?? 1,
        },
      };
    }
    return response;
  });
}

function getAdminTransaction(data: any) {
  // Destructure and map parameters
  const {
    page_size,
    payment_type,
    from_date,
    to_date,
    limit,
    status,
    search,
    ...rest
  } = data;

  const validParams = {
    ...rest,
    limit: limit ?? page_size ?? 50,
    page: data.page ?? 1,
    paymentType: payment_type,
    startDate: from_date,
    endDate: to_date,
    status,
    search,
  };

  // Filter out undefined/null/empty strings
  const params = new URLSearchParams(
    Object.entries(validParams).filter(
      ([_, v]) => v != null && v !== "",
    ) as any,
  );

  return handleRequest(async () => {
    const response = await clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/transactions?${params}`);

    // Normalize response structure
    if (response.data) {
      // Map meta to pagination
      const meta = response.data.meta || {};
      const items = Array.isArray(response.data.data) ? response.data.data : [];

      // Ensure we preserve the original structure but add items/pagination for frontend compatibility
      response.data = {
        ...response.data,
        items: items,
        pagination: {
          page: meta.page ?? 1,
          total_rows: meta.total ?? 0,
          page_size: meta.limit ?? 50,
          limit: meta.limit ?? 50,
          total: meta.total ?? 0,
          totalPages: meta.totalPages ?? 0,
        },
      };
    }

    return response;
  });
}

function getAdminTransactionStats(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/transactions/stats?${params}`),
  );
}

function getAdminTransactionDetails(id: string | number) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/admin/transactions/${id}`),
  );
}

function getTransactionDetails(data: { id: string }) {
  return handleRequest(async () => {
    try {
      const response = await clientRequest({
        headers: { "ngrok-skip-browser-warning": "your-value" },
        baseURL: BASE_URL,
      }).get(`/payments/my-payments`);
      console.log("response", response);

      if (Array.isArray(response.data)) {
        // Check if ID matches valid ID or Reference
        const found = response.payments.find(
          (item: any) =>
            String(item.id) === String(data.id) ||
            String(item.reference || item.payment_id) === String(data.id),
        );

        if (found) {
          response.data = {
            ...found,
            id: found.id,
            recipient_name: found.recipient || found.payer_name || "N/A",
            email: found.payer_email || found.email || "",
            type: found.payment_type || "BPF",
            reference: found.reference || found.payment_id || "N/A",
            created_at: found.created_at,
            amount: found.amount,
            year: found.year || new Date().getFullYear(),
            status: found.status || "PENDING",
            // Map missing fields for receipt
            recipient_scn: found.scn || found.recipient_scn || "N/A",
            branch: found.branch_name || found.branch || "N/A",
            year_of_call: found.year_of_call || found.call_year || "N/A",
          };
          return response;
        }
      }
    } catch (e) {
      console.error("BPF History fetch failed", e);
    }

    // 2. If not found in BPF, try generic valid transaction endpoint
    // This is a fallback for other transaction types (like Stamp & Seal if they have their own endpoint)
    // or if it's a direct ID lookup supported by backend.
    return clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/payments/my-payments/${data.id}`);
  });
}

function myTransaction(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(async () => {
    const response = await clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/bpf-payment/history?${params}`);

    // Normalize array response to match expected paginated structure
    if (Array.isArray(response.data)) {
      response.data = {
        items: response.data.map((item: any) => ({
          ...item,
          // Ensure fields match ITransactions interface if needed
          payer_name: item.recipient || item.payer_name || "N/A",
          reference: item.reference || item.payment_id || "N/A",
          status: item.status || "PENDING",
          payment_type:
            item.payment_type && item.payment_type !== "BPF"
              ? item.payment_type
              : item.item_description?.toLowerCase().includes("branch")
                ? "Branch Dues"
                : "BPF",
          item_description: item.item_description || "N/A",
          tag: item.tag || "",
        })),
        pagination: {
          page: 1,
          total_rows: response.data.length,
          page_size: 50,
        },
      };
    }
    return response;
  });
}

function getOldUserTransaction(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/archive-payment/personal?${params}`),
  );
}

function getOldAdminTransaction(data: any) {
  const params = new URLSearchParams(data);
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/archive-payment?${params}`),
  );
}

function editOldTransaction(body: OldTransactionProps) {
  return handleRequest(() =>
    clientRequest({ baseURL: BASE_URL }).put("/archive-payment", body),
  );
}

export {
  getTransaction,
  getTransactionDetails,
  getAdminTransactionStats,
  getAdminTransactionDetails,
  myTransaction,
  getAdminTransaction,
  getOldUserTransaction,
  getOldAdminTransaction,
  editOldTransaction,
};
