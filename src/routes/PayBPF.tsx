import { Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";
import etranzactLogo from "@/assets/images/etranzact.png";
import AuthContext from "@/context/auth-context";
import { PaymentGatewayModal } from "@/components/ui/payment-gateway-modal";

interface Member {
  first_name: string;
  middle_name?: string;
  last_name: string;
  scn?: string;
  exam_no?: string;
  email: string;
}

interface BpfSummary {
  member: Member;
  bpf_amount: number;
  bpf_category: string;
}

const API_BASE = "https://nigerianbar.online/credo/credo_api.php";

const PayBPF: React.FC = () => {
  const { user } = AuthContext.useContainer();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<BpfSummary | null>(null);
  const [paying, setPaying] = useState(false);
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  /* ================================
     LOAD BPF SUMMARY
  ================================ */
  useEffect(() => {
    const init = async () => {
      try {
        const params = new URLSearchParams();
        if (user?.scn) params.append("scn", user.scn);
        if (user?.exam_no) params.append("exam_no", user.exam_no);

        if (!params.toString()) {
          throw new Error("Missing SCN or Exam Number.");
        }

        const res = await fetch(
          `${API_BASE}?action=get_bpf_summary&${params.toString()}`,
          { headers: { Accept: "application/json" } },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load BPF summary.");
        }

        setSummary(data);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user]);

  /* ================================
     CREATE PAYMENT
  ================================ */
  const handlePayment = async () => {
    if (!summary) return;

    setPaying(true);
    setError(null);

    try {
      const payload = {
        scn: summary.member.scn,
        exam_no: summary.member.exam_no,
        email: summary.member.email,
        full_name: `${summary.member.first_name} ${summary.member.last_name}`,
      };

      const res = await fetch(`${API_BASE}?action=create_payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment initialization failed.");
      }

      // Instead of direct redirect, show modal simulation
      setPaymentUrl(data.payment_url);
      setGatewayModalOpen(true);
    } catch (err: any) {
      setError(err.message || "Unable to start payment.");
      setPaying(false);
    }
  };

  /* ================================
     UI STATES
  ================================ */
  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-8">
        Loading your payment summary…
      </p>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded text-center mt-8 max-w-xl mx-auto">
        {error}
      </div>
    );
  }

  if (!summary) return null;

  const member = summary.member;
  const payerName = `${member.first_name} ${member.middle_name || ""} ${
    member.last_name
  }`
    .replace(/\s+/g, " ")
    .trim();

  return (
    <>
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-8 space-y-8 mt-8">
        {/* HEADER */}
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "#228B22" }}
            aria-label="Bar Practicing Fee Title"
          >
            Bar Practicing Fee (BPF)
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review your details before proceeding to payment
          </p>
        </div>

        {/* MEMBER SUMMARY */}
        <div className="border border-gray-300 rounded-lg p-6 space-y-4">
          <SummaryRow label="Payer Name" value={payerName} />
          <SummaryRow label="SCN" value={member.scn || member.exam_no || ""} />
          <SummaryRow label="Category" value={summary.bpf_category} />
          <SummaryRow label="Email" value={member.email} />
        </div>

        {/* AMOUNT */}
        <div
          className="border border-gray-300 rounded-lg p-6 flex justify-between items-center font-semibold text-lg"
          style={{ color: "#228B22" }}
        >
          <span>Total BPF</span>
          <span className="text-2xl font-bold">
            ₦{Number(summary.bpf_amount).toLocaleString()}
          </span>
        </div>

        {/* PAY BUTTON */}
        <button
          disabled={paying}
          onClick={handlePayment}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-shadow duration-200 ${
            paying
              ? "cursor-not-allowed shadow-inner"
              : "shadow-lg hover:shadow-xl"
          }`}
          style={{
            backgroundColor: paying ? "#90ee90" : "#228B22",
          }}
          aria-busy={paying}
        >
          {paying ? "Redirecting to Credo…" : "Pay BPF via Credo"}
        </button>

        {/* LOGO */}
        <div className="flex justify-center pt-6">
          <img
            src={etranzactLogo}
            alt="Credo / Etranzact"
            className="max-w-[160px] object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <PaymentGatewayModal
        isOpen={gatewayModalOpen}
        onClose={() => setGatewayModalOpen(false)}
        paymentUrl={paymentUrl}
      />
    </>
  );
};

/* ================================
   SMALL HELPER
================================ */
const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600 uppercase tracking-wide">{label}</span>
    <strong className="text-gray-900 truncate max-w-[60%] text-right">
      {value}
    </strong>
  </div>
);

export default PayBPF;
