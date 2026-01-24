import { Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";
import AuthContext from "@/context/auth-context";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { IProfile } from "@/api/interfaces/profile";
import { getProfile } from "@/api/profile";
import EtrasactAPI from "@/components/etrasact/etrasact-api_letterogs";
import { logger } from "@/utils/logger";

const API_BASE =
  "https://digital-license.nigerianbar.online/api13672/letterofgoodstandingapi";
const API_BASE_FILE_PATH =
  "https://digital-license.nigerianbar.online/api13672/letterofgoodstandingapi/letterogsf";

interface FormData {
  organisation_email: string;
  organisation_name: string;
  organisation_address: string;
  organisation_country: string;
}

const LetterOfGoodStanding: React.FC = () => {
  const { user } = AuthContext.useContainer();
  const { response: profileData, isLoading } = useFetcher<any, IProfile>(
    getProfile
  );
  const [callDay, setCallDay] = useState<string>("01");
  const [callMonth, setCallMonth] = useState<string>("01");

  const [formData, setFormData] = useState<FormData>({
    organisation_email: "",
    organisation_name: "",
    organisation_address: "",
    organisation_country: "",
  });
  const [step, setStep] = useState<
    | "start"
    | "personal"
    | "recipient"
    | "preview"
    | "payment"
    | "success"
    | "history"
  >("start");

  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openRow, setOpenRow] = useState<number | null>(null);

  useEffect(() => {
    logger.debug("Step changed", step);
  }, [step]);

  const handleSubmit = async () => {
    logger.debug("Form submission initiated", { step, formData });

    // Guard clause for missing required data
    if (
      !profileData ||
      !profileData.email ||
      !profileData.first_name ||
      !profileData.last_name ||
      !profileData.year_of_call
    ) {
      alert("Profile data is missing or incomplete. Please reload the page.");
      return;
    }

    // Guard clause for form data
    if (
      !formData.organisation_name ||
      !formData.organisation_address ||
      !formData.organisation_country ||
      !formData.organisation_email
    ) {
      alert("Please fill in all recipient details before proceeding.");
      return;
    }

    // Format date_of_call from year_of_call (set as Jan 1st)
    const formattedDateOfCall = `${callDay}-${callMonth}-${profileData.year_of_call}`;

    try {
      const res = await fetch(`${API_BASE}/create_payment_request.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GOOD_STANDING",
          scn: profileData.scn,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
          branch: profileData.branch,
          year_of_call: profileData.year_of_call,
          organisation_name: formData.organisation_name,
          organisation_email: formData.organisation_email,
          organisation_address: formData.organisation_address,
          organisation_country: formData.organisation_country,
          date_of_call: formattedDateOfCall, // Correct format: dd-mm-yyyy
        }),
      });

      const data = await res.json();
      logger.debug("Payment request response", data);

      if (!res.ok || data.success === false) {
        alert(data.error || "Something went wrong.");
        return;
      }

      setPaymentRef(data.reference);
      setStep(() => "payment");
    } catch (err) {
      console.error("Error creating payment request", err);
      alert("A network error occurred. Please try again.");
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/fectch_logs.php?scn=${user?.scn}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.applications);
      }
    } catch (err) {
      console.error("Failed to load application history", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStart = () => (
    <div className="space-x-4 flex">
      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={() => setStep("personal")}
      >
        New Application
      </button>
      <button
        className="bg-gray-400 text-white px-4 py-2 rounded"
        onClick={() => {
          fetchHistory();
          setStep("history");
        }}
      >
        Application History
      </button>
    </div>
  );

  // const renderStart = () => (
  //   <div className="space-x-4 flex">
  //     <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setStep("personal")}>New Application</button>
  //     <button className="bg-green-600 text-white px-4 py-2 rounded">Application History</button>
  //   </div>
  // );

  const renderPersonalDetails = () => (
    <div className="space-y-4 mt-6">
      <h2 className="text-xl font-bold text-center">Personal Details</h2>
      <div className="space-y-2">
        <label className="block">
          First Name
          <input
            disabled
            value={profileData?.first_name || ""}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block">
          Middle Name
          <input
            disabled
            value={profileData?.middle_name || ""}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block">
          Last Name
          <input
            disabled
            value={profileData?.last_name || ""}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block">
          SCN
          <input
            disabled
            value={profileData?.scn || ""}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block">
          Branch
          <input
            disabled
            value={profileData?.branch || ""}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block">
          Year of Call
          <input
            disabled
            value={profileData?.year_of_call || ""}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block">
          Day of Call
          <select
            value={callDay}
            onChange={(e) => setCallDay((e.target as HTMLSelectElement).value)}
            className="w-full p-2 border rounded"
          >
            {[...Array(31)].map((_, i) => {
              const day = (i + 1).toString().padStart(2, "0");
              return (
                <option key={day} value={day}>
                  {day}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block">
          Month of Call
          <select
            value={callMonth}
            onChange={(e) =>
              setCallMonth((e.target as HTMLSelectElement).value)
            }
            className="w-full p-2 border rounded"
          >
            {[
              { value: "01", label: "January" },
              { value: "02", label: "February" },
              { value: "03", label: "March" },
              { value: "04", label: "April" },
              { value: "05", label: "May" },
              { value: "06", label: "June" },
              { value: "07", label: "July" },
              { value: "08", label: "August" },
              { value: "09", label: "September" },
              { value: "10", label: "October" },
              { value: "11", label: "November" },
              { value: "12", label: "December" },
            ].map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          Category
          <input
            disabled
            value={profileData?.is_san ? "SAN" : ""}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block">
          Email Address
          <input
            disabled
            value={profileData?.email || ""}
            className="w-full p-2 border rounded"
          />
        </label>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setStep("start")}
          className="bg-gray-500 text-white px-6 py-2 rounded"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep("recipient")}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Next →
        </button>
      </div>
    </div>
  );

  const renderRecipientForm = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">Recipient Details</h2>
      <label className="block">
        Name of Organisation
        <input
          type="text"
          placeholder="E.g Law Society of Ontario"
          value={formData.organisation_name}
          onInput={(e) =>
            setFormData({
              ...formData,
              organisation_name: (e.target as HTMLInputElement).value,
            })
          }
          className="w-full p-2 border rounded"
        />
      </label>
      <label className="block">
        Address of Organisation
        <input
          type="text"
          value={formData.organisation_address}
          onInput={(e) =>
            setFormData({
              ...formData,
              organisation_address: (e.target as HTMLInputElement).value,
            })
          }
          className="w-full p-2 border rounded"
        />
      </label>
      <label className="block">
        Country of Organisation
        <input
          type="text"
          value={formData.organisation_country}
          onInput={(e) =>
            setFormData({
              ...formData,
              organisation_country: (e.target as HTMLInputElement).value,
            })
          }
          className="w-full p-2 border rounded"
        />
      </label>
      <label className="block">
        Email Address of organisation
        <input
          type="email"
          value={formData.organisation_email}
          onInput={(e) =>
            setFormData({
              ...formData,
              organisation_email: (e.target as HTMLInputElement).value,
            })
          }
          className="w-full p-2 border rounded"
        />
      </label>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setStep("personal")}
          className="bg-gray-500 text-white px-6 py-2 rounded"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep("preview")}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Preview →
        </button>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">Preview Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>
            First Name :
            <input
              disabled
              value={profileData?.first_name || ""}
              className="w-full p-2 border rounded"
            />
          </label>
          <label>
            Last Name:
            <input
              disabled
              value={profileData?.last_name || ""}
              className="w-full p-2 border rounded"
            />
          </label>
          <label>
            Branch:
            <input
              disabled
              value={profileData?.branch || ""}
              className="w-full p-2 border rounded"
            />
          </label>
          <label>
            Category:
            <input
              disabled
              value={profileData?.is_san ? "SAN" : ""}
              className="w-full p-2 border rounded"
            />
          </label>
          <label>
            Name of Organisation :
            <input
              disabled
              value={formData.organisation_name}
              className="w-full p-2 border rounded"
            />
          </label>
          <label>
            Country of Organisation:
            <input
              disabled
              value={formData.organisation_country}
              className="w-full p-2 border rounded"
            />
          </label>
        </div>
        <div>
          <label>
            Middle Name:
            <input
              disabled
              value={profileData?.middle_name || ""}
              className="w-full p-2 border rounded"
            />
          </label>
          <label>
            SCN:
            <input
              disabled
              value={profileData?.scn || ""}
              className="w-full p-2 border rounded"
            />
          </label>
          <label>
            Year of Call:
            <input
              disabled
              value={profileData?.year_of_call || ""}
              className="w-full p-2 border rounded"
            />
          </label>
          <label>
            Date of Call:
            <input
              disabled
              value={`${callDay}-${callMonth}-${profileData?.year_of_call}`}
              className="w-full p-2 border rounded"
            />
          </label>
          <label>
            Email Address:
            <input
              disabled
              value={profileData?.email || ""}
              className="w-full p-2 border rounded"
            />
          </label>
          <label>
            Address of Organisation:
            <input
              disabled
              value={formData.organisation_address}
              className="w-full p-2 border rounded"
            />
          </label>
          <label>
            Email Address of organisation:
            <input
              disabled
              value={formData.organisation_email}
              className="w-full p-2 border rounded"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setStep("recipient")}
          className="bg-gray-500 text-white px-6 py-2 rounded"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Proceed →
        </button>
      </div>
    </div>
  );

  const renderPayment = () => {
    if (!paymentRef) {
      return <p className="text-gray-500">Generating payment reference...</p>;
    }

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Payment Details</h2>
        <p>Description: Payment for Application of Letter of Good Standing</p>
        <p>Amount: NGN 5000</p>
        <p>Payment Ref: {paymentRef}</p>

        <EtrasactAPI
          tx_ref={paymentRef}
          amount={5000}
          email={profileData?.email || ""}
          name={`${profileData?.first_name} ${profileData?.last_name}`}
          completePayment={(ref: string, status: boolean) => {
            if (status) {
              fetch(`${API_BASE}/callback.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ref, status: "PAID" }),
              });
              setStep("success");
            }
          }}
          label="Pay with eTranzact"
        />
      </div>
    );
  };

  const renderSuccess = () => (
    <div>
      <h2 className="text-xl font-bold text-green-600">Payment Successful!</h2>
      <p>Your application has been received and processed.</p>
    </div>
  );

  const renderHistory = () => (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Letter of Good Standing</h2>
      <div className="space-x-4 mb-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setStep("personal")}
        >
          New Application
        </button>
        <button className="bg-gray-400 text-white px-4 py-2 rounded">
          Application History
        </button>
      </div>
      {loading ? (
        <p>Loading history...</p>
      ) : history.length === 0 ? (
        <p className="text-gray-500 text-sm">No history found.</p>
      ) : (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">PAYER NAME</th>
              <th className="p-2">RECIPIENT ORGANISATION</th>
              <th className="p-2">RECIPIENT EMAIL</th>
              <th className="p-2">DATE</th>
              <th className="p-2">STATUS</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{item.payer_name}</td>
                <td className="p-2">{item.organisation_name}</td>
                <td className="p-2">{item.organisation_email}</td>
                <td className="p-2">{item.created_at}</td>
                <td className="p-2">{item.status}</td>
                <td className="p-2">
                  <div className="relative inline-block text-left">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded"
                      onClick={() =>
                        setOpenRow(openRow === index ? null : index)
                      }
                    >
                      ⋮
                    </button>
                    {openRow === index && (
                      <div className="absolute right-0 mt-1 w-28 rounded-md shadow-lg bg-white border z-10 transition-all duration-200 ease-in-out opacity-100 scale-100">
                        <ul className="text-sm">
                          {item.status === "PENDING" && (
                            <li>
                              <button
                                onClick={async () => {
                                  const ref1 = `${item.payment_ref}`;
                                  logger.debug("Payment item", item);
                                  const ref = ref1.replace(".pdf", "");
                                  logger.debug("Processing reference", ref);
                                  try {
                                    const res = await fetch(
                                      `${API_BASE}/verify_payment.php`,
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ ref }),
                                      }
                                    );
                                    const data = await res.json();
                                    if (data.success) {
                                      alert(
                                        "✅ Payment verified successfully."
                                      );
                                      fetchHistory(); // Refresh
                                    } else {
                                      alert(
                                        "❌ " +
                                          (data.error || "Verification failed.")
                                      );
                                    }
                                  } catch (err) {
                                    alert("❌ Network error.");
                                  }
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Verify Transaction
                              </button>
                            </li>
                          )}

                          {item.status === "SENT" && (
                            <>
                              <li>
                                <a
                                  href={`${API_BASE_FILE_PATH}/${item.pdf_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block px-4 py-2 hover:bg-gray-100"
                                >
                                  View
                                </a>
                              </li>
                              <li>
                                <button
                                  onClick={async () => {
                                    const ref = item.pdf_path.replace(
                                      ".pdf",
                                      ""
                                    );
                                    try {
                                      const res = await fetch(
                                        `${API_BASE}/resend_letter.php`,
                                        {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({ ref }),
                                        }
                                      );
                                      const data = await res.json();
                                      if (data.success) {
                                        alert("✅ Letter resent successfully!");
                                      } else {
                                        alert("❌ " + data.message);
                                      }
                                    } catch (err) {
                                      alert("❌ Network error.");
                                    }
                                  }}
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                  Resend
                                </button>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  logger.debug("Current step", step);

  if (isLoading || !profileData) return <p>Loading user data...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Letter of Good Standing
      </h1>
      {step === "start" && renderStart()}
      {step === "history" && renderHistory()}
      {step === "personal" && renderPersonalDetails()}
      {step === "recipient" && renderRecipientForm()}
      {step === "preview" && renderPreview()}
      {step === "payment" && renderPayment()}
      {step === "success" && renderSuccess()}
    </div>
  );
};

export default LetterOfGoodStanding;
