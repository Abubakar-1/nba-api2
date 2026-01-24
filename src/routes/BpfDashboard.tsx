import { useEffect, useState } from "preact/hooks";
import AuthContext from "@/context/auth-context";

interface Payment {
  id: number;
  reference: string;
  amount: number;
  status: "success" | "pending" | "failed";
  created_at: string;
  receipt_url?: string | null;
  verify_url?: string | null;
}

const API_BASE =
  "https://nigerianbar.online/credo/bpf_dashboard_api.php";

const statusColor = {
  success: "bg-green-700",
  pending: "bg-yellow-500",
  failed: "bg-red-700",
};

const BpfDashboard = () => {
  const { user } = AuthContext.useContainer();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiptHtml, setReceiptHtml] = useState<string | null>(null);

  /* ===============================
     LOAD PAYMENTS
  =============================== */
  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams();
      if (user?.scn) params.append("scn", user.scn);
      if (user?.exam_no) params.append("exam_no", user.exam_no);

      const res = await fetch(
        `${API_BASE}?action=list&${params.toString()}`,
        { credentials: "include" }
      );

      const data = await res.json();
      setPayments(data.payments || []);
      setLoading(false);
    };

    load();
  }, [user]);

  /* ===============================
     VERIFY PAYMENT
  =============================== */
  const verifyPayment = async (url: string) => {
    if (!confirm("Verify payment now?")) return;

    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();

    if (data.success) {
      location.reload();
    } else {
      alert(data.message || "Verification failed");
    }
  };

  /* ===============================
     VIEW RECEIPT
  =============================== */
  const viewReceipt = async (url: string, ref: string) => {
    history.pushState({ receipt: ref }, "", `?receipt=${ref}`);

    const res = await fetch(url, {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    setReceiptHtml(await res.text());
  };

  window.onpopstate = () => setReceiptHtml(null);

  if (loading) {
    return <p className="text-center text-gray-500">Loading payments…</p>;
  }

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-[#228B22] mb-5">
        My BPF Payments
      </h2>

      <table className="w-full border">
        <thead className="bg-[#228B22] text-white">
          <tr>
            <th className="p-3">Reference</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Receipt</th>
            <th>Verify</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-t text-center">
              <td className="p-3">{p.reference}</td>
              <td>₦{p.amount.toLocaleString()}</td>
              <td>
                <span
                  className={`text-white px-3 py-1 rounded-full text-sm ${statusColor[p.status]}`}
                >
                  {p.status}
                </span>
              </td>
              <td>
                {p.receipt_url ? (
                  <button
                    className="text-[#228B22] font-semibold"
                    onClick={() =>
                      viewReceipt(p.receipt_url!, p.reference)
                    }
                  >
                    View
                  </button>
                ) : (
                  "—"
                )}
              </td>
              <td>
                {p.verify_url ? (
                  <button
                    className="bg-[#228B22] text-white px-3 py-1 rounded"
                    onClick={() => verifyPayment(p.verify_url!)}
                  >
                    Verify
                  </button>
                ) : (
                  "✓"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {receiptHtml && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    {/* Add max height and overflow-y scroll to modal content */}
    <div className="bg-white w-[95%] max-w-4xl rounded-lg p-4 relative max-h-[90vh] overflow-y-auto">
      <button
        className="absolute top-3 right-4 text-xl"
        onClick={() => {
          setReceiptHtml(null);
          history.pushState({}, "", location.pathname);
        }}
        aria-label="Close receipt"
      >
        ×
      </button>
      <div dangerouslySetInnerHTML={{ __html: receiptHtml }} />
    </div>
  </div>
)}

    </div>
  );
};

export default BpfDashboard;
