import { useEffect, useState } from "preact/hooks";
import AuthContext from "@/context/auth-context";

const API_URL = "https://certificate.nigerianbar.online/cpd-points/api_get_member_cpd.php";

interface Program {
  program_name: string;
  cpd_hours: number;
}

interface Member {
  name: string;
  email: string;
  scn: string;
  total_cpd: number;
  yearly_target: number;
  progress_percent: number;
}

interface CPDResponse {
  member: Member;
  programs: Program[];
}

const CPDDashboard: React.FC = () => {
  const { user } = AuthContext.useContainer();
  const [data, setData] = useState<CPDResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCPD = async () => {
      try {
        const response = await fetch(`${API_URL}?scn=${user.scn}`);
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchCPD();
  }, [user.scn]);

  if (loading) return <p>Loading your CPD data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No data available.</p>;

  const { member, programs } = data;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {member.name} ({member.scn})
      </h1>
      <p className="text-gray-600">{member.email}</p>

      <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
        <div
          className="bg-green-600 h-4 rounded-full transition-all"
          style={{ width: `${member.progress_percent}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        Total CPD: {member.total_cpd} / {member.yearly_target} ({Math.round(member.progress_percent)}%)
      </p>

      <h2 className="text-xl font-semibold mt-6">Program Breakdown</h2>
      {programs.length === 0 ? (
        <p>No programs recorded yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Program</th>
              <th className="p-2">CPD Hours</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p, idx) => (
              <tr
                key={idx}
                className={`border-b transition-colors duration-200 ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-green-50`}
              >
                <td className="p-2">{p.program_name}</td>
                <td className="p-2">{p.cpd_hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CPDDashboard;
