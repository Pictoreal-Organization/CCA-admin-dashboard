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
    X,
    Search,
} from "lucide-react";

export default function CreateMeeting() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [agenda, setAgenda] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [endTime, setEndTime] = useState("");
    // const [duration, setDuration] = useState(60); 
    const [priority, setPriority] = useState("Medium");
    const [location, setLocation] = useState("offline");
    const [onlineLink, setOnlineLink] = useState("");
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [existingTags, setExistingTags] = useState([]);
    const [scope, setScope] = useState("general");
    const [allUsers, setAllUsers] = useState([]);

    // State for modal visibility and temporary selections
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [modalSearchTerm, setModalSearchTerm] = useState("");
    const [modalSelectedUserIds, setModalSelectedUserIds] = useState([]);

    const [invitedMembers, setInvitedMembers] = useState([]);

    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // --- Data Fetching Effect ---
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("adminToken");
            try {
                // Fetch team
                const resTeams = await api.get("/admin/visible-teams", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTeams(resTeams.data);

                // Fetch tag
                const resTags = await api.get("/tags", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setExistingTags(resTags.data);

                // Fetch ALL users (Admins, Heads, Members)
                const res = await api.get("/admin/users", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAllUsers(res.data);
            } catch (err) {
                console.error(err);
                setMsg("Failed to fetch data");
                setMsgType("error");
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = () => {
        setModalSelectedUserIds(invitedMembers); // Initialize temp list with currently invited members
        setModalSearchTerm("");
        setIsUserModalOpen(true);
    };

    // Filter users based on search term in modal 
    const filteredModalUsers = allUsers.filter((user) => {
        const lowerSearch = modalSearchTerm.toLowerCase();

        // Check Name
        if (user.name?.toLowerCase().includes(lowerSearch)) return true;

        // Check Username
        if (user.username?.toLowerCase().includes(lowerSearch)) return true;

        // Check Roll Number
        if (user.rollNo && String(user.rollNo).includes(lowerSearch)) return true;

        return false;
    });

    // Toggle selection within the modal
    const handleToggleUserSelection = (userId) => {
        setModalSelectedUserIds((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId);
            }
            return [...prev, userId];
        });
    };

    // Finalize selection and close modal
    const handleModalDone = () => {
        setInvitedMembers(modalSelectedUserIds); // Update the permanent list
        setIsUserModalOpen(false);
    };

    // Cancel and close modal
    const handleModalCancel = () => {
        setIsUserModalOpen(false);
    };

    // Remove user from invited list chip
    const handleRemoveMember = (id) => {
        setInvitedMembers((prev) => prev.filter((m) => m !== id));
    };


    // --- Form Submission  ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMsg("");

        const token = localStorage.getItem("adminToken");

        const finalLocation = location === "offline" ? onlineLink : null;
        const finalOnlineLink = location === "online" ? onlineLink : null;

        try {
            const payload = {
                title,
                description,
                agenda,
                dateTime,
                endTime, 
                // duration is omitted
                priority,
                location: finalLocation,
                onlineLink: finalOnlineLink,
                team: selectedTeam || null,
                tags: selectedTags,
                isPrivate,
                invitedMembers: isPrivate ? invitedMembers : [],
            };

            const res = await api.post(
                "/meetings/create",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMsg(res.data.msg || "Meeting created successfully");
            setMsgType("success");
            // Clear message after 5 seconds
            setTimeout(() => {
                setMsg("");
                setMsgType("");
            }, 5000);

            // Reset form fields
            setTitle("");
            setDescription("");
            setAgenda("");
            setDateTime("");
            setEndTime(""); 
            setPriority("Medium");
            setLocation("offline");
            setOnlineLink("");
            setSelectedTeam("");
            setInvitedMembers([]);
            setSelectedTags([]);
        } catch (err) {
            setMsg(err.response?.data?.msg || "Error creating meeting");
            setMsgType("error");
        } finally {
            setIsLoading(false);
        }
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
                            className={`mb-6 flex items-start gap-3 p-4 rounded-xl border ${msgType === "success"
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
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent hover:from-cyan-600 hover:to-blue-700 text-white border-cyan-700"
                                            : "bg-slate-900/50 text-slate-400 border-slate-600"
                                        }`}
                                >
                                    General
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setScope("team")}
                                    className={`px-4 py-2 rounded-xl border ${scope === "team"
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent hover:from-cyan-600 hover:to-blue-700 text-white border-cyan-700"
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
                                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent hover:from-cyan-600 hover:to-blue-700 text-white border-cyan-700"
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


                        {/* Location & Online Link Type Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Location Type
                            </label>

                            <div className="flex gap-3">

                                {/* ONLINE BUTTON */}
                                <button
                                    type="button"
                                    onClick={() => setLocation("online")}
                                    className={`px-4 py-2 rounded-xl border
                                        ${location === "online"
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent hover:from-cyan-600 hover:to-blue-700 border-cyan-400 text-white"
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
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent hover:from-cyan-600 hover:to-blue-700 border-cyan-400 text-white"
                                            : "bg-slate-900/50 border-slate-600 text-slate-300"
                                        }`}
                                >
                                    Offline
                                </button>

                            </div>
                        </div>

                        {/* Location Input */}
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
                                    placeholder="e.g., Conference Room B"
                                />
                            </div>
                        )}

                        {/* Online Link Input */}
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
                                    placeholder="e.g., Zoom/Meet URL"
                                />
                            </div>
                        )}

                        {/* Date & Time Row (Start and End) */}
                        <div className="flex gap-4">
                            {/* Start Time */}
                            <div className="relative flex-1">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Start Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={dateTime}
                                    onChange={(e) => setDateTime(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                />
                            </div>

                            {/* End Time */}
                            <div className="relative flex-1">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    End Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                />
                            </div>
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

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                            >
                                <option value="Low" className="bg-slate-900 text-white hover:bg-blue-600">Low</option>
                                <option value="Medium" className="bg-slate-900 text-white hover:bg-blue-600">Medium</option>
                                <option value="High" className="bg-slate-900 text-white hover:bg-blue-600">High</option>
                                <option value="Urgent" className="bg-slate-900 text-white hover:bg-blue-600">Urgent</option>
                            </select>
                        </div>

                        {/* Visibility: Public / Private */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Meeting Visibility
                            </label>

                            <div className="flex gap-3 mb-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPrivate(false);
                                        setInvitedMembers([]); // Clear invited members if public
                                    }}
                                    className={`px-4 py-2 rounded-xl border ${!isPrivate
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600  border-transparent hover:from-cyan-600 hover:to-blue-700 border-cyan-400 text-white"
                                            : "bg-slate-900/50 border-slate-600 text-slate-300"
                                        }`}
                                >
                                    Public
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsPrivate(true)}
                                    className={`px-4 py-2 rounded-xl border ${isPrivate
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent hover:from-cyan-600 hover:to-blue-700 border-cyan-400 text-white"
                                            : "bg-slate-900/50 border-slate-600 text-slate-300"
                                        }`}
                                >
                                    Private
                                </button>
                            </div>
                        </div>

                        {/* Private Invitation Section */}
                        {isPrivate && (
                            <div className="mt-4 relative bg-slate-700/30 p-4 rounded-xl border border-slate-700">
                                <label className="block text-sm font-medium text-slate-300 mb-3">
                                    Invite Members ({invitedMembers.length})
                                </label>

                                {/* Assign Button */}
                                <button
                                    type="button"
                                    onClick={handleOpenModal}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center gap-2 mb-4"
                                >
                                    <Users className="w-4 h-4" />
                                    Assign Users
                                </button>


                                {/* Selected Names Chips */}
                                <div className="flex flex-wrap gap-2">
                                    {invitedMembers.length === 0 ? (
                                        <p className="text-slate-400 text-sm italic">No users invited yet. Click 'Assign Users' to start.</p>
                                    ) : (
                                        invitedMembers.map((id) => {
                                            const user = allUsers.find((m) => m._id === id);
                                            // Fallback for user not found
                                            if (!user) return null;

                                            return (
                                                <div
                                                    key={id}
                                                    className="px-3 py-1 text-sm bg-slate-700/50 border border-slate-600
                                                         rounded-full text-white flex items-center gap-2"
                                                >
                                                    {user?.name || user?.username}
                                                    {user?.rollNo && (
                                                        <span className="text-xs text-gray-400">({user.rollNo})</span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMember(id)}
                                                        className="w-4 h-4 flex items-center justify-center
                                                             rounded-full bg-slate-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}


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

            {/* USER SELECTION MODAL (for private meet)*/}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">Assign Meeting Participants</h3>
                            <button onClick={handleModalCancel} className="text-slate-400 hover:text-white">
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
                                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                            </div>
                        </div>

                        {/* User List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {filteredModalUsers.length === 0 ? (
                                <p className="text-slate-500 text-sm">No users found.</p>
                            ) : (
                                filteredModalUsers.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => handleToggleUserSelection(user._id)}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${modalSelectedUserIds.includes(user._id)
                                            ? "bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500"
                                            : "bg-slate-700/50 hover:bg-slate-700 border border-slate-700"
                                            }`}
                                    >
                                        <div className="text-white">
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-xs text-slate-400">{user.rollNo || user.username}</p>
                                        </div>
                                        {modalSelectedUserIds.includes(user._id) && (
                                            <CheckCircle className="w-5 h-5 text-cyan-400" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleModalCancel}
                                className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleModalDone}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Done ({modalSelectedUserIds.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}