"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import {
  Calendar,
  Users,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  MapPin,
  Tag,
  Lock,
  Eye,
} from "lucide-react";

export default function CreateMeeting() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [agenda, setAgenda] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [priority, setPriority] = useState("Medium");
  const [location, setLocation] = useState("offline");
  const [onlineLink, setOnlineLink] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [scope, setScope] = useState("general"); //general / team
  const [allMembers, setAllMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("adminToken");
      try {
        //Fetch team
        const resTeams = await api.get("/admin/visible-teams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeams(resTeams.data);

        //Fetch tag
        const resTags = await api.get("/tags", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExistingTags(resTags.data);

        // Fetch members
        const res = await api.get("/admin/members", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAllMembers(res.data); 
      } catch (err) {
        console.error(err);
        setMsg("Failed to fetch data");
        setMsgType("error");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");

    const token = localStorage.getItem("adminToken");
    try {
      const res = await api.post(
        "/meetings/create",
        {
          title,
          description,
          agenda,
          dateTime,
          duration,
          priority,
          location,
          onlineLink: location === "online" ? onlineLink : "",
          team: selectedTeam || null,
          tags: selectedTags,
          isPrivate,
          invitedMembers: isPrivate ? invitedMembers : [], 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg(res.data.msg);
      setMsgType("success");

      setTitle("");
      setDescription("");
      setAgenda("");
      setDateTime("");
      setDuration(60);
      setPriority("Medium");
      setLocation("offline");
      setOnlineLink("");
      setSelectedTeam("");
    } catch (err) {
      setMsg(err.response?.data?.msg || "Error creating meeting");
      setMsgType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // search bar -> filter
  useEffect(() => {
  if (!searchTerm.trim()) {
    setFilteredMembers([]);
    return;
  }

  const lower = searchTerm.toLowerCase();
  const results = allMembers.filter((member) =>
    member.name.toLowerCase().includes(lower) ||
    (member.rollNo && member.rollNo.toString().includes(lower))
  );

  setFilteredMembers(results);
}, [searchTerm, allMembers]);

  // Add a member to the invited list
  const handleSelectMember = (member) => {
    setInvitedMembers((prev) => {
      if (prev.includes(member._id)) {
        return prev.filter((id) => id !== member._id); // remove
      }
      return [...prev, member._id]; // add
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".member-dropdown")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);


  // Remove member from invited list
  const handleRemoveMember = (id) => {
    setInvitedMembers((prev) => prev.filter((m) => m !== id));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/50">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Meeting</h1>
          <p className="text-slate-400">Add a new meeting and assign it to a team</p>
        </div>

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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                placeholder="Meeting title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                placeholder="Meeting description"
              />
            </div>

            {/* Team */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Visibility Scope
              </label>

              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setScope("general");
                    setSelectedTeam("");
                  }}
                  className={`px-4 py-2 rounded-xl border ${scope === "general"
                      ? "bg-cyan-600 text-white border-cyan-700"
                      : "bg-slate-900/50 text-slate-400 border-slate-600"
                    }`}
                >
                  General
                </button>

                <button
                  type="button"
                  onClick={() => setScope("team")}
                  className={`px-4 py-2 rounded-xl border ${scope === "team"
                      ? "bg-cyan-600 text-white border-cyan-700"
                      : "bg-slate-900/50 text-slate-400 border-slate-600"
                    }`}
                >
                  Team Specific
                </button>
              </div>
            </div>

            {/* Team Chips (Only if Team-Specific) */}
            {scope === "team" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Team
                </label>

                <div className="flex flex-wrap gap-2">
                  {teams.length === 0 ? (
                    <p className="text-slate-500 text-sm">No teams found.</p>
                  ) : (
                    teams.map((team) => (
                      <button
                        type="button"
                        key={team._id}
                        onClick={() => setSelectedTeam(team._id)}
                        className={`px-4 py-2 rounded-full border ${selectedTeam === team._id
                            ? "bg-cyan-600 text-white border-cyan-700"
                            : "bg-slate-900/50 text-slate-300 border-slate-700"
                          }`}
                      >
                        {team.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            

            {/* Location & Online Link */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location
              </label>

              <div className="flex gap-3">

                {/* ONLINE BUTTON */}
                <button
                  type="button"
                  onClick={() => setLocation("online")}
                  className={`px-4 py-2 rounded-xl border 
        ${location === "online"
                      ? "bg-cyan-600 border-cyan-400 text-white"
                      : "bg-slate-900/50 border-slate-600 text-slate-300"
                    }`}
                >
                  Online
                </button>

                {/* OFFLINE BUTTON */}
                <button
                  type="button"
                  onClick={() => setLocation("offline")}
                  className={`px-4 py-2 rounded-xl border 
        ${location === "offline"
                      ? "bg-cyan-600 border-cyan-400 text-white"
                      : "bg-slate-900/50 border-slate-600 text-slate-300"
                    }`}
                >
                  Offline
                </button>

              </div>
            </div>

            {/* OFFLINE LOCATION INPUT */}
            {location === "offline" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Physical Location
                </label>
                <input
                  type="text"
                  value={onlineLink}
                  onChange={(e) => setOnlineLink(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 
                 rounded-xl text-white placeholder-slate-500 
                 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  placeholder="e.g.,Conference Room B"
                />
              </div>
            )}

            {/* ONLINE INPUT */}
            {location === "online" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Online Meeting Link
                </label>
                <input
                  type="url"
                  value={onlineLink}
                  onChange={(e) => setOnlineLink(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 
                 rounded-xl text-white placeholder-slate-500 
                 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  placeholder="e.g.,Zoom/Meet URL"
                />
              </div>
            )}

            {/* date and time  */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
                className="w-full px-4 py-3 pl-10 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>

            {/* Agenda */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Agenda</label>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                placeholder="Agenda (optional)"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>


            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags
              </label>

              <div className="flex flex-wrap gap-2">
                {existingTags.length === 0 ? (
                  <p className="text-slate-500 text-sm">No tags found.</p>
                ) : (
                  existingTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag._id);

                    return (
                      <button
                        type="button"
                        key={tag._id}
                        onClick={() => {
                          setSelectedTags((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== tag._id) // remove
                              : [...prev, tag._id] // add
                          );
                        }}
                        className={`px-3 py-1 text-sm rounded-full border transition-all
              ${isSelected
                            ? "bg-cyan-600 border-cyan-400 text-white"
                            : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
                          }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Visibility: Public / Private */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Meeting Visibility
              </label>

              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`px-4 py-2 rounded-xl border ${!isPrivate
                      ? "bg-cyan-600 border-cyan-400 text-white"
                      : "bg-slate-900/50 border-slate-600 text-slate-300"
                    }`}
                >
                  Public
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`px-4 py-2 rounded-xl border ${isPrivate
                      ? "bg-cyan-600 border-cyan-400 text-white"
                      : "bg-slate-900/50 border-slate-600 text-slate-300"
                    }`}
                >
                  Private
                </button>
              </div>
            </div>

            {isPrivate && (
              <div className="mt-4 relative">
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Search by name or roll number..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  className="w-full px-4 py-2 text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Dropdown Results */}
                {showDropdown && filteredMembers.length > 0 && (
                  <div className="absolute left-0 right-0 z-[9999] mt-1 
      bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto member-dropdown">
                    {filteredMembers.map((member) => {
                      const isSelected = invitedMembers.includes(member._id);

                      return (
                        <div
                          key={member._id}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                          onClick={() => handleSelectMember(member)} // toggle selection
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectMember(member)}
                              onClick={(e) => e.stopPropagation()} // prevents dropdown closing
                            />
                            <span>{member.name}</span>
                          </div>
                          <span className="text-gray-500 text-sm">
                            {member.rollNo ? `Roll: ${member.rollNo}` : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Selected Names */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {invitedMembers.map((id) => {
                    const member = allMembers.find((m) => m._id === id);
                    return (
                      <div
                        key={id}
                        className="px-3 py-1 text-sm bg-slate-700/50 border border-slate-600 
            rounded-full text-white flex items-center gap-2"
                      >
                        {member?.name || member?.username}
                        {member?.rollNo && (
                          <span className="text-xs text-gray-600">({member.rollNo})</span>
                        )}
                        <button
                          onClick={() => handleRemoveMember(id)}
                          className="w-5 h-5 flex items-center justify-center 
              rounded-full bg-slate-600 hover:bg-red-500 text-white text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Meeting...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  <span>Create Meeting</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
