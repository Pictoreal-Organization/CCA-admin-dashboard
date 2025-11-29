"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import {
  Users,
  User,
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function CreateMember() {
  const router = useRouter();
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

  // Fetch all teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      const token = localStorage.getItem("adminToken");
      try {
        const res = await api.get("/admin/visible-teams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeams(res.data);
      } catch (err) {
        console.error(err);
        setMsg("Failed to load teams");
        setMsgType("error");
      }
    };
    fetchTeams();
  }, []);

  // Toggle team selection
  const handleTeamSelect = (id) => {
    setSelectedTeams((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");

    const token = localStorage.getItem("adminToken");
    try {
      const res = await api.post(
        "/admin/create-member",
        {
          username,
          email,
          name,
          rollNo,
          year,
          division,
          phone,
          teamIds: selectedTeams,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg(res.data.msg);
      setMsgType("success");
      setUsername("");
      setEmail("");
      setName("");
      setRollNo("");
      setYear("");
      setDivision("");
      setPhone("");
      setSelectedTeams([]);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Error creating member");
      setMsgType("error");
    } finally {
      setIsLoading(false);
    }
  };

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
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Team Member
          </h1>
          <p className="text-slate-400">
            Add a new member and assign them to one or more teams
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Alert Message */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="member@example.com"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}            
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Roll Number
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl  text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter roll number"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl  text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g., FY / SY / TE / BE"
              />
            </div>

            {/* Division */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Division
              </label>
              <input
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl  text-white placeholder-slate-500 focus:outline-none focus:ring-2  focus:ring-blue-500 transition-all"
                placeholder="Enter division"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl  text-white placeholder-slate-500 focus:outline-none focus:ring-2  focus:ring-blue-500 transition-all"
                placeholder="Enter phone number"
              />
            </div>

            {/* Team Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Assign Teams
              </label>
              <div className="flex flex-wrap gap-3">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    onClick={() => handleTeamSelect(team._id)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all
                      ${
                        selectedTeams.includes(team._id)
                          ? "bg-blue-600 border-blue-400 text-white shadow-md"
                          : "bg-slate-900/50 border-slate-600 text-slate-300 hover:bg-slate-800"
                      }`}
                  >
                    {team.name}
                  </div>
                ))}
              </div>
              {teams.length === 0 && (
                <p className="text-slate-500 text-sm mt-2">
                  No teams available. Please create a team first.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Member...</span>
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  <span>Create Team Member</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm text-blue-300">
            <strong>Note:</strong> A temporary password will be generated and
            displayed in the dashboard. The member should change it after first
            login.
          </p>
        </div>
      </main>
    </div>
  );
}
