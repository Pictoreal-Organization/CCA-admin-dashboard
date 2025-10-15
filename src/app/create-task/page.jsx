"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import {
  CheckSquare,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

export default function CreateTask() {
  const router = useRouter();

  // Task state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  // Subtasks
  const [subtasks, setSubtasks] = useState([
    { title: "", description: "", status: "Pending", assignedTo: [] },
  ]);

  // Users
  const [allUsers, setAllUsers] = useState([]);

  // UI state
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      if (!token) return;
      try {
        const res = await api.get("/admin/visible-teams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeams(res.data || []);
      } catch (err) {
        console.error(err);
        setMsg("Failed to load teams");
        setMsgType("error");
      }
    };
    fetchTeams();
  }, [token]);

  // Fetch users
  useEffect(() => {
    const fetchAllUsers = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
  
      try {
        const res = await api.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Users API response:", res.data); // <-- add this line
        setAllUsers(res.data || []);
      } catch (err) {
        console.error(err);
        setMsg("Failed to load users");
        setMsgType("error");
      }
    };
    fetchAllUsers();
  }, []);
  

  // Subtask handlers
  const addSubtask = () =>
    setSubtasks([...subtasks, { title: "", description: "", status: "Pending", assignedTo: [] }]);
  const removeSubtask = index => setSubtasks(subtasks.filter((_, i) => i !== index));
  const updateSubtask = (index, field, value) => {
    const updated = [...subtasks];
    updated[index][field] = value;
    setSubtasks(updated);
  };
  const toggleSubtaskAssignee = (subtaskIndex, userId) => {
    const updated = [...subtasks];
    if (updated[subtaskIndex].assignedTo.includes(userId)) {
      updated[subtaskIndex].assignedTo = updated[subtaskIndex].assignedTo.filter(id => id !== userId);
    } else {
      updated[subtaskIndex].assignedTo.push(userId);
    }
    setSubtasks(updated);
  };

  // Submit task
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");

    try {
      const filteredSubtasks = subtasks
        .filter(st => st.title.trim() !== "")
        .map(st => ({
          title: st.title,
          description: st.description,
          status: st.status,
          assignedTo: st.assignedTo,
        }));

      const res = await api.post(
        "/tasks/create",
        {
          title,
          description,
          status,
          startDate: startDate || undefined,
          deadline: deadline || undefined,
          team: selectedTeam || null,
          subtasks: filteredSubtasks,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg(res.data.msg || "Task created successfully");
      setMsgType("success");

      // Reset form
      setTitle("");
      setDescription("");
      setStatus("Pending");
      setStartDate("");
      setDeadline("");
      setSelectedTeam("");
      setSubtasks([{ title: "", description: "", status: "Pending", assignedTo: [] }]);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || "Error creating task");
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

      {/* Main form */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Task</h1>
          <p className="text-slate-400">Add a new task with subtasks and assign to team members</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl space-y-6"
        >
          {/* Message */}
          {msg && (
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border ${
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
              <p className={`text-sm ${msgType === "success" ? "text-green-400" : "text-red-400"}`}>
                {msg}
              </p>
            </div>
          )}

          {/* Task fields */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
              placeholder="Task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Team</label>
              <select
                value={selectedTeam}
                onChange={e => setSelectedTeam(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="">None</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-300">Subtasks</label>
              <button
                type="button"
                onClick={addSubtask}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Subtask
              </button>
            </div>

            {subtasks.map((st, idx) => (
              <div key={idx} className="p-4 bg-slate-900/50 border border-slate-600 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={st.title}
                    onChange={e => updateSubtask(idx, "title", e.target.value)}
                    placeholder="Subtask title"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  {subtasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubtask(idx)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <textarea
                  value={st.description}
                  onChange={e => updateSubtask(idx, "description", e.target.value)}
                  placeholder="Subtask description"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                />

                <select
                  value={st.status}
                  onChange={e => updateSubtask(idx, "status", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                {allUsers.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Assign Members
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allUsers.map(user => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => toggleSubtaskAssignee(idx, user._id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            st.assignedTo.includes(user._id)
                              ? "bg-purple-600 text-white"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {user.username}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Creating Task...
              </>
            ) : (
              <>
                <CheckSquare className="w-5 h-5" /> Create Task
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}