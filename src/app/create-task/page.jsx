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
    X,
    Search,
    Users,
} from "lucide-react";

export default function CreateTask() {
    const router = useRouter();

    // Task state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Pending");
    const [deadline, setDeadline] = useState("");
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [scope, setScope] = useState("General"); 

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

    // Member selection MODAL state
    const [isUserModalOpen, setIsUserModalOpen] = useState(false); 
    const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState(null); 
    const [modalSearchTerm, setModalSearchTerm] = useState(""); 

    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

    // --- Data Fetching Effects ---

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
            }
        };
        fetchTeams();
    }, [token]);

    // Fetch all users
    useEffect(() => {
        const fetchAllUsers = async () => {
            if (!token) return;
            try {
                const res = await api.get("/admin/users", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAllUsers(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAllUsers();
    }, [token]);

    // --- Subtask Handlers ---

    const addSubtask = () =>
        setSubtasks([...subtasks, { title: "", description: "", status: "Pending", assignedTo: [] }]);
    
    const removeSubtask = index => setSubtasks(subtasks.filter((_, i) => i !== index));
    
    const updateSubtask = (index, field, value) => {
        const updated = [...subtasks];
        updated[index][field] = value;
        setSubtasks(updated);
    };

    // New dedicated function to remove an assignee directly from a chip
    const handleRemoveAssigneeFromChip = (subtaskIndex, userId) => {
        const updated = [...subtasks];
        updated[subtaskIndex].assignedTo = updated[subtaskIndex].assignedTo.filter(id => id !== userId);
        setSubtasks(updated);
    };

    // --- Modal Handlers ---

    // 1. Open Modal
    const handleOpenModal = (index) => {
        setCurrentSubtaskIndex(index);
        setModalSearchTerm("");
        setIsUserModalOpen(true);
    };

    // 2. Toggle user assignment state within the modal (used by checkboxes)
    const handleToggleModalSelection = (userId) => {
        if (currentSubtaskIndex === null) return;
        
        const updated = [...subtasks];
        const assignedToList = updated[currentSubtaskIndex].assignedTo;

        if (assignedToList.includes(userId)) {
            // Remove user
            updated[currentSubtaskIndex].assignedTo = assignedToList.filter(id => id !== userId);
        } else {
            // Add user
            updated[currentSubtaskIndex].assignedTo = [...assignedToList, userId];
        }
        setSubtasks(updated);
    };

    // 3. Close Modal (Done button or X button)
    const handleModalClose = () => {
        setIsUserModalOpen(false);
        setCurrentSubtaskIndex(null);
        setModalSearchTerm("");
    };

    // Filter users for the modal search
    const filteredModalUsers = allUsers.filter((user) => {
        const lowerSearch = modalSearchTerm.toLowerCase();

        // Check Name, Roll Number, Username
        if (user.name?.toLowerCase().includes(lowerSearch)) return true;
        if (user.rollNo && String(user.rollNo).toLowerCase().includes(lowerSearch)) return true;
        if (user.username?.toLowerCase().includes(lowerSearch)) return true;

        return false;
    });


    // --- Form Submission ---
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
                    assignedTo: st.assignedTo, // Already array of user IDs
                }));

            const res = await api.post(
                "/tasks/create",
                {
                    title,
                    description,
                    status,
                    deadline: deadline || undefined,
                    team: selectedTeam || null,
                    subtasks: filteredSubtasks,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMsg(res.data.msg || "Task created successfully");
            setMsgType("success");

            // Clear message after 5 seconds
            setTimeout(() => {
                setMsg("");
                setMsgType("");
            }, 5000); 

            // Reset form
            setTitle("");
            setDescription("");
            setScope("General");
            setStatus("Pending");
            setDeadline("");
            setSelectedTeam("");
            setSubtasks([{ title: "", description: "", status: "Pending", assignedTo: [] }]);

        } catch (err) {
            console.error(err);
            
            // ERROR MESSAGE LOGIC WITH TIMEOUT
            setMsg(err.response?.data?.error || "Error creating task");
            setMsgType("error");

            // Clear error message after 5 seconds
            setTimeout(() => {
                setMsg("");
                setMsgType("");
            }, 5000);

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

                    {/* Scope Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Task Scope
                        </label>
                        <div className="flex gap-2">
                            {["General", "Team Specific"].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                        setScope(s);
                                        // Clear team selection if switching to General
                                        if (s === "General") setSelectedTeam("");
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm ${
                                        scope === s
                                            ? "bg-purple-600 text-white"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Team Selector */}
                    {scope === "Team Specific" && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Team</label>
                            <div className="flex flex-wrap gap-2">
                                {teams.map(team => {
                                    const isSelected = selectedTeam === team._id;
                                    return (
                                        <button
                                            key={team._id}
                                            type="button"
                                            onClick={() => setSelectedTeam(team._id)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isSelected
                                                ? "bg-purple-600 text-white"
                                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                                }`}
                                        >
                                            {team.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
                                        required
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
                                    placeholder="Subtask description (optional)"
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

                                {/* Assignment Section */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">
                                        Assigned Members ({st.assignedTo.length})
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {/* Display selected members as chips */}
                                        {st.assignedTo.map(userId => {
                                            const user = allUsers.find(u => u._id === userId);
                                            if (!user) return null;
                                            return (
                                                <span
                                                    key={user._id}
                                                    className="flex items-center gap-1 bg-purple-600 text-white text-xs px-2 py-1 rounded-full"
                                                >
                                                    {user.name || "Unknown"}
                                                    <button
                                                        type="button"
                                                        // Use the corrected function here
                                                        onClick={() => handleRemoveAssigneeFromChip(idx, user._id)}
                                                        className="w-3 h-3 flex items-center justify-center text-white hover:text-purple-200"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Button to open the full modal */}
                                    <button
                                        type="button"
                                        onClick={() => handleOpenModal(idx)}
                                        className="w-full px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                        disabled={allUsers.length === 0}
                                    >
                                        <Users className="w-3 h-3"/> {st.assignedTo.length > 0 ? "Edit Members" : "Select Members"}
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>

                    {/* Deadline */}
                    <div className="grid grid-cols-2 gap-4">
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
            
            {/* -------------------------------------------------------- */}
            {/* USER ASSIGNMENT MODAL */}
            {/* -------------------------------------------------------- */}
            {isUserModalOpen && currentSubtaskIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">
                                Assign Members to Subtask #{currentSubtaskIndex + 1}
                            </h3>
                            <button onClick={handleModalClose} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4 sticky top-0 bg-slate-800 z-10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, roll number, or username..."
                                    value={modalSearchTerm}
                                    onChange={(e) => setModalSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* User List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {filteredModalUsers.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-4">No users found matching "{modalSearchTerm}".</p>
                            ) : (
                                filteredModalUsers.map((user) => {
                                    const isAssigned = subtasks[currentSubtaskIndex]?.assignedTo.includes(user._id);
                                    
                                    return (
                                        <label
                                            key={user._id}
                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors 
                                                ${isAssigned
                                                    ? "bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500"
                                                    : "bg-slate-700/50 hover:bg-slate-700 border border-slate-700"
                                                }`}
                                        >
                                            <div className="text-white flex-1 min-w-0">
                                                <p className="font-medium truncate">{user.name || "No Name"}</p>
                                                <p className="text-xs text-slate-400">{user.rollNo ? user.rollNo : user.username}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={isAssigned}
                                                onChange={() => handleToggleModalSelection(user._id)}
                                                className="w-4 h-4 accent-purple-500 flex-shrink-0 ml-4"
                                            />
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleModalClose}
                                className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleModalClose}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                Done ({subtasks[currentSubtaskIndex]?.assignedTo.length || 0})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}