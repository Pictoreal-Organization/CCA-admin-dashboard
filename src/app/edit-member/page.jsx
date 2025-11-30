"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../lib/api";
import {
  Users,
  User,
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
} from "lucide-react";

export default function EditMember() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [year, setYear] = useState("");
  const [division, setDivision] = useState("");
  const [phone, setPhone] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMember, setLoadingMember] = useState(true);

  // Fetch member data & teams
  useEffect(() => {
    const fetchData = async () => {
      if (!memberId) {
        setMsg("Member ID not provided");
        setMsgType("error");
        setLoadingMember(false);
        return;
      }

      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch all visible teams
        const teamsRes = await api.get("/admin/visible-teams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeams(teamsRes.data || []);

        // Try single-member endpoint
        let member = null;
        try {
          const single = await api.get(`/admin/members/${memberId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          member = single.data;
        } catch (err) {
          console.log("Single-member endpoint failed. Using fallback...");

          // Fallback: fetch all members
          const allMembersRes = await api.get("/admin/members", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const allMembers = Array.isArray(allMembersRes.data)
            ? allMembersRes.data
            : [];

          member = allMembers.find((m) => m._id === memberId);

          if (!member) {
            setMsg("Member not found");
            setMsgType("error");
            setLoadingMember(false);
            return;
          }
        }

        // Populate fields
        setUsername(member.username || "");
        setEmail(member.email || "");
        setName(member.name || "");
        setRollNo(member.rollNo || "");
        setYear(member.year || "");
        setDivision(member.division || "");
        setPhone(member.phone || "");

        // Handle team array
        if (Array.isArray(member.team)) {
          const ids = member.team.map((t) => (t._id ? t._id : t));
          setSelectedTeams(ids);
        }

        setLoadingMember(false);
      } catch (error) {
        console.error(error);
        setMsg("Failed to load member data");
        setMsgType("error");
        setLoadingMember(false);
      }
    };

    fetchData();
  }, [memberId, router]);

  // Toggle team selection
  const handleTeamSelect = (id) => {
    setSelectedTeams((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  // Submit updated member
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");

    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      const res = await api.put(
        `/admin/members/${memberId}`,
        {
          username,
          email,
          name,
          rollNo,
          year,
          division,
          phone,
          team: selectedTeams,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg(res.data.msg || "Member updated successfully!");
      setMsgType("success");

      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Error updating member");
      setMsgType("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading member data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
            <Edit className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Edit Team Member
          </h1>
          <p className="text-slate-400">
            Update member information and team assignments
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {msg && (
            <div
              className={`mb-6 flex items-start gap-3 p-4 rounded-xl border ${
                msgType === "success"
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              {msgType === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  msgType === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {msg}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <InputField
              label="Username"
              icon={User}
              value={username}
              setValue={setUsername}
              required
            />

            {/* Email */}
            <InputField
              label="Email Address"
              icon={Mail}
              value={email}
              setValue={setEmail}
              required
              type="email"
            />

            <InputField
              label="Full Name"
              icon={User}
              value={name}
              setValue={setName}
            />

            <InputField
              label="Roll Number"
              value={rollNo}
              setValue={setRollNo}
              required
            />

            <InputField
              label="Year"
              value={year}
              setValue={setYear}
              required
              placeholder="FY / SY / TE / BE"
            />

            <InputField
              label="Division"
              value={division}
              setValue={setDivision}
              required
            />

            <InputField
              label="Phone Number"
              value={phone}
              setValue={setPhone}
              required
            />

            {/* Team selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Assign Teams
              </label>
              <div className="flex flex-wrap gap-3">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    onClick={() => handleTeamSelect(team._id)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                      selectedTeams.includes(team._id)
                        ? "bg-blue-600 border-blue-400 text-white shadow-md"
                        : "bg-slate-900/50 border-slate-600 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {team.name}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-5 h-5" /> Update Member
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

/* -----------------------------------------------
   Small reusable input component (kept simple)
------------------------------------------------- */
function InputField({
  label,
  icon: Icon,
  value,
  setValue,
  required,
  type = "text",
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={required}
          placeholder={placeholder}
          className={`w-full ${
            Icon ? "pl-12" : "px-4"
          } pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
        />
      </div>
    </div>
  );
}
