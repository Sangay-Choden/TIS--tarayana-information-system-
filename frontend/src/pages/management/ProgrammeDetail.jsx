

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Users, FileText, MapPin } from "lucide-react";

const ManagementProgrammeDetail = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const rootPath = pathname.split("/")[1];

  const [programme, setProgramme] = useState(null);
  const [projects, setProjects] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH PROGRAMME
  // =========================
  useEffect(() => {
    if (!id) return;

    const fetchProgramme = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_URL}/api/programmes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load programme");
          return;
        }

        setProgramme(data.programme);
      } catch (err) {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchProgramme();
  }, [id]);

  // =========================
  // FETCH PROJECTS
  // =========================
  useEffect(() => {
    if (!id) return;

    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_URL}/api/projects/programme/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message);
          return;
        }

        setProjects(data.projects || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProjects();
  }, [id]);

  // =========================
  // FETCH BENEFICIARIES
  // =========================
  useEffect(() => {
    if (!id) return;

    const fetchBeneficiaries = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_URL}/api/beneficiaries/programme/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message);
          return;
        }

        setBeneficiaries(data.count || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBeneficiaries();
  }, [id]);

  const safeProjects = Array.isArray(projects) ? projects : [];

  const uniqueDzongkhags = [
    ...new Set(safeProjects.flatMap((p) => p.dzongkhag || [])),
  ];

  const dzongkhagCount = uniqueDzongkhags.length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

        {/* BACK */}
        <button
          onClick={() => navigate(`/${rootPath}/programmes`)}
          className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500"
        >
          <ChevronLeft size={16} />
          Back to programmes
        </button>

        {/* TITLE */}
        <div className="w-full max-w-4xl">
          <h2 className="text-xl font-bold">
            {programme?.programmeName}
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            {programme?.programmeDescription}
          </p>
        </div>

        {/* KPI CARDS (same admin style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <div className="bg-white rounded-xl shadow p-5 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Beneficiaries</p>
              <h2 className="text-xl font-semibold mt-2">
                {beneficiaries}
              </h2>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Users />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Projects</p>
              <h2 className="text-xl font-semibold mt-2">
                {safeProjects.length}
              </h2>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <FileText />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Dzongkhags</p>
              <h2 className="text-xl font-semibold mt-2">
                {dzongkhagCount}
              </h2>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <MapPin />
            </div>
          </div>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow p-5">

          {/* <h3 className="font-semibold mb-4">Projects</h3> */}

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">

              <thead>
                <tr className="border-b text-left bg-gray-50/50">
                  <th className="py-3 px-3">Project Name</th>
                  <th className="px-3">Dzongkhag</th>
                  <th className="px-3">Start</th>
                  <th className="px-3">End</th>
                  <th className="px-3">Donor</th>
                  <th className="px-3">Partner</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 text-[13px]">
                {safeProjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-400">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  safeProjects.map((p) => (
                    <tr key={p._id} className=" hover:bg-gray-50">

                      <td
                        onClick={() =>
                          navigate(`/${rootPath}/programmes/projects/${p._id}`)
                        }
                        className="py-3 px-3 text-blue-500 cursor-pointer"
                      >
                        {p.projectName}
                      </td>

                      <td className="px-3">
                        {p.dzongkhag?.join(", ")}
                      </td>

                      <td className="px-3">
                        {new Date(p.startDate).toLocaleDateString()}
                      </td>

                      <td className="px-3">
                        {new Date(p.endDate).toLocaleDateString()}
                      </td>

                      <td className="px-3">
                        {p.donor?.map((d) => d?.name).join(", ") || "-"}
                      </td>

                      <td className="px-3">
                        {p.partner?.map((d) => d?.name).join(", ") || "-"}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>

        </div>

      </div>
    </>
  );
};

export default ManagementProgrammeDetail;
