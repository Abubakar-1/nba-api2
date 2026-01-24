import { useEffect, useState } from "preact/hooks";
import AuthContext from "@/context/auth-context";
import { logger } from "@/utils/logger";

const API_URL =
  "https://digital-license.nigerianbar.online/download/dashboard_api_2872636739.php";
const DOWNLOAD_PATH = "https://digital-license.nigerianbar.online/admin/";

interface License {
  license_pdf_path: string;
  date_issue: string;
}

const DigitalLicense: React.FC = () => {
  const { user } = AuthContext.useContainer();
  const scn = user?.scn;

  logger.debug("User SCN", scn);

  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.scn) {
        setError("No SCN found. Please ensure you are logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}?scn=${user.scn}`);
        if (!response.ok) {
          throw new Error("Failed to fetch licenses");
        }
        const data = await response.json();
        setLicenses(data);
        console.log("data", response)
      } catch (err) {
        setError((err as Error).message); // ✅ Fix here
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.scn]);

  if (loading) return <p>Loading licenses...</p>;
  if (error) return <p>Error: {error}</p>;
  if (licenses.length === 0) return <p>No results found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Digital Licenses</h1>
      <div className="space-y-4">
        {licenses.map((license: License, index: number) => (
          <div
            className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            key={index}
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                License #{index + 1}
              </h2>
              <p className="text-sm text-gray-600">
                Issued on: {license.date_issue}
              </p>
            </div>
            <a
              href={`${DOWNLOAD_PATH}/licenses/${license.license_pdf_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigitalLicense;
