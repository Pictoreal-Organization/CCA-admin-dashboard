// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import api from "../../lib/api";
// import {
//   Users,
//   UserPlus,
//   Shield,
//   Mail,
//   LogOut,
//   Loader2,
//   UserCircle,
//   Calendar,
//   CheckSquare,
//   UsersRound,
//   UserCog,
//   Clock,
//   MapPin,
//   Search,
//   Trash2,
// } from "lucide-react";

// export default function Dashboard() {

//   const router = useRouter();
//   const [users, setUsers] = useState([]);
//   const [members, setMembers] = useState([]);
//   const [heads, setHeads] = useState([]);
//   const [meetings, setMeetings] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("users");
//   const [searchQuery, setSearchQuery] = useState("");

//   const [contextMenu, setContextMenu] = useState(null);
//   const [deleteModal, setDeleteModal] = useState(null);
//   const [securityCode, setSecurityCode] = useState("");
//   const [generatedCode, setGeneratedCode] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("adminToken");
//     if (!token) {
//       router.push("/login");
//       return;
//     }

//     const fetchAllData = async () => {
//       try {
//         const [usersRes, membersRes, headsRes, meetingsRes, tasksRes] =
//           await Promise.all([
//             api.get("/admin/users", {
//               headers: { Authorization: `Bearer ${token}` },
//             }),
//             api.get("/admin/members", {
//               headers: { Authorization: `Bearer ${token}` },
//             }),
//             api.get("/admin/heads", {
//               headers: { Authorization: `Bearer ${token}` },
//             }),
//             api.get("/admin/meetings", {
//               headers: { Authorization: `Bearer ${token}` },
//             }),
//             api.get("/admin/tasks", {
//               headers: { Authorization: `Bearer ${token}` },
//             }),
//           ]);

//         setUsers(usersRes.data || []);
//         setMembers(membersRes.data || []);
//         setHeads(headsRes.data || []);
//         setMeetings(meetingsRes.data || []);
//         setTasks(tasksRes.data || []);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         console.error("Error details:", err.response?.data || err.message);
        
//         // Only redirect to login if it's an auth error
//         if (err.response?.status === 401 || err.response?.status === 403) {
//           localStorage.removeItem("adminToken");
//           router.push("/login");
//         } else {
//           // For other errors, just stop loading and show empty state
//           setLoading(false);
//         }
//       }
//     };

//     fetchAllData();
//   }, [router]);

//   useEffect(() => {
//     const handleClick = () => setContextMenu(null);
//     document.addEventListener("click", handleClick);
//     return () => document.removeEventListener("click", handleClick);
//   }, []);

//   const handleSearch = (e) => {
//     setSearchQuery(e.target.value.toLowerCase());
//   };

//   const generateSecurityCode = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   };

//   const handleContextMenu = (e, item, type) => {
//     e.preventDefault();
//     setContextMenu({
//       x: e.clientX,
//       y: e.clientY,
//       item,
//       type,
//     });
//   };

//   const handleDeleteClick = () => {
//     const { item, type } = contextMenu;
//     const requiresSecurityCode = ["user", "member", "head"].includes(type);
    
//     if (requiresSecurityCode) {
//       const code = generateSecurityCode();
//       setGeneratedCode(code);
//     }
    
//     setDeleteModal({
//       item,
//       type,
//       requiresSecurityCode,
//     });
//     setContextMenu(null);
//   };

//   const handleConfirmDelete = async () => {
//     const { item, type, requiresSecurityCode } = deleteModal;
  
//     if (requiresSecurityCode && securityCode !== generatedCode) {
//       alert("Security code doesn't match!");
//       return;
//     }
//     const token = localStorage.getItem("adminToken");
//     if (!token) {
//       router.push("/login");
//       return;
//     }
//     const id = item._id || item.id || item.userId;

  
//     try {
//       let endpoint = "";
//       switch (type) {
//         case "user":
//           endpoint = `/admin/${item._id}`;
//           break;
//         case "member":
//           endpoint = `/admin/${item._id}`;
//           break;
//         case "head":
//           endpoint = `/admin/${item._id}`;
//           break;
//         case "meeting":
//           endpoint = `/meetings/delete/${item._id}`;
//           break;
//         case "task":
//           endpoint = `/tasks/delete/${item._id}`;
//           break;
//         default:
//           console.error("Unknown type for deletion:", type);
//           return;
//       }
  
//       // Make the API call
//       await api.delete(endpoint, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
  
//       // If successful, update UI locally
//       switch (type) {
//         case "user":
//           setUsers(users.filter((u) => u._id !== item._id));
//           break;
//         case "member":
//           setMembers(members.filter((m) => m._id !== item._id));
//           break;
//         case "head":
//           setHeads(heads.filter((h) => h._id !== item._id));
//           break;
//         case "meeting":
//           setMeetings(meetings.filter((m) => m._id !== item._id));
//           break;
//         case "task":
//           setTasks(tasks.filter((t) => t._id !== item._id));
//           break;
//       }
  
//       alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
//     } catch (err) {
//       console.error("Error deleting:", err.response?.data || err.message);
//       alert(`Failed to delete ${type}. Please try again.`);
//     } finally {
//       setDeleteModal(null);
//       setSecurityCode("");
//       setGeneratedCode("");
//     }
//   };
  

//   const filterData = (data, keys) => {
//     if (!searchQuery) return data;
//     return data.filter((item) =>
//       keys.some((key) => {
//         const value = key.includes(".")
//           ? key.split(".").reduce((obj, k) => obj?.[k], item)
//           : item[key];
//         return String(value || "").toLowerCase().includes(searchQuery);
//       })
//     );
//   };

//   const filteredUsers = filterData(users, ["username", "email", "role", "year", "division"]);
//   const filteredMembers = filterData(members, ["username", "email", "team", "year", "division"]);
//   const filteredHeads = filterData(heads, ["username", "email", "team"]);
//   const filteredMeetings = filterData(meetings, ["title", "location", "status", "priority", "tags"]);
//   const filteredTasks = filterData(tasks, ["title", "team.name", "status"]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
//           <p className="text-slate-400 text-lg">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//       <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
//                 <Shield className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
//                 <p className="text-sm text-slate-400">Right-click rows to delete</p>
//               </div>
//             </div>
//             <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
//               <LogOut className="w-4 h-4" />
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
//                 <Users className="w-6 h-6 text-blue-400" />
//               </div>
//               <div>
//                 <p className="text-slate-400 text-sm">Total Users</p>
//                 <p className="text-white text-2xl font-bold">{users.length}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
//                 <Shield className="w-6 h-6 text-purple-400" />
//               </div>
//               <div>
//                 <p className="text-slate-400 text-sm">Team Heads</p>
//                 <p className="text-white text-2xl font-bold">{heads.length}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
//                 <UserCircle className="w-6 h-6 text-green-400" />
//               </div>
//               <div>
//                 <p className="text-slate-400 text-sm">Members</p>
//                 <p className="text-white text-2xl font-bold">{members.length}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8">
//         <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <button
//             onClick={() => router.push("/create-member")}
//             className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all group"
//           >
//             <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//               <UserPlus className="w-6 h-6 text-blue-400" />
//             </div>
//             <span className="text-white font-medium">Add Member</span>
//           </button>

//           <button
//             onClick={() => router.push("/create-head")}
//             className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 rounded-xl transition-all group"
//           >
//             <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//               <Shield className="w-6 h-6 text-purple-400" />
//             </div>
//             <span className="text-white font-medium">Create Head</span>
//           </button>

//           <button
//             onClick={() => router.push("/create-meeting")}
//             className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition-all group"
//           >
//             <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//               <Calendar className="w-6 h-6 text-cyan-400" />
//             </div>
//             <span className="text-white font-medium">Create Meeting</span>
//           </button>

//           <button
//             onClick={() => router.push("/create-task")}
//             className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:border-green-500/40 rounded-xl transition-all group"
//           >
//             <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//               <CheckSquare className="w-6 h-6 text-green-400" />
//             </div>
//             <span className="text-white font-medium">Create Task</span>
//           </button>
//         </div>
//         </div>

//         <div className="mb-6 flex items-center gap-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl px-4 py-3">
//            <Search className="w-5 h-5 text-slate-400" />
//           <input
//              type="text"
//              value={searchQuery}
//              onChange={handleSearch}
//              placeholder={`Search in ${activeTab}...`}
//              className="bg-transparent outline-none text-white w-full placeholder-slate-400"
//            />
//         </div>

//         {/* Sticky tab bar — moved OUT of the table container */}
//         <div
//           className="sticky top-[64px] z-20 bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3 rounded-xl mx-0"
//         >
//           <div className="flex gap-2 overflow-x-auto">
//             <button
//               onClick={() => setActiveTab("users")}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 activeTab === "users" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <Users className="w-4 h-4" /> All Users
//             </button>

//             <button
//               onClick={() => setActiveTab("members")}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 activeTab === "members" ? "bg-green-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <UsersRound className="w-4 h-4" /> All Members
//             </button>

//             <button
//               onClick={() => setActiveTab("heads")}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 activeTab === "heads" ? "bg-purple-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <UserCog className="w-4 h-4" /> All Heads
//             </button>

//             <button
//               onClick={() => setActiveTab("meetings")}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 activeTab === "meetings" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <Calendar className="w-4 h-4" /> All Meetings
//             </button>

//             <button
//               onClick={() => setActiveTab("tasks")}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 activeTab === "tasks" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <CheckSquare className="w-4 h-4" /> All Tasks
//             </button>
//           </div>
//         </div>

//          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">

//           <div className="overflow-x-auto">
//             {activeTab === "users" && (
//               <>{filteredUsers.length === 0 ? (
//                 <div className="px-6 py-12 text-center">
//                   <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
//                   <p className="text-slate-400">No users found</p>
//                 </div>
//               ) : (
//                 <table className="w-full">
//                   <thead className="bg-slate-900/50">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Username</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Division</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-700/50">
//                     {filteredUsers.map((u) => (
//                       <tr key={u._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, u, "user")}>
//                         <td className="px-6 py-4 text-white font-medium">{u.username}</td>
//                         <td className="px-6 py-4 text-slate-300">{u.email}</td>
//                         <td className="px-6 py-4">
//                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                             u.role === "Admin" ? "bg-purple-500/20 text-purple-300" : u.role === "Head" ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-300"
//                           }`}>{u.role}</span>
//                         </td>
//                         <td className="px-6 py-4 text-slate-300">{u.year && u.division ? `${u.year} ${u.division}` : "N/A"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}</>
//             )}

//             {activeTab === "members" && (
//               <>{filteredMembers.length === 0 ? (
//                 <div className="px-6 py-12 text-center">
//                   <UsersRound className="w-12 h-12 text-slate-600 mx-auto mb-3" />
//                   <p className="text-slate-400">No members found</p>
//                 </div>
//               ) : (
//                 <table className="w-full">
//                   <thead className="bg-slate-900/50">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Username</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Teams</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Division</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-700/50">
//                     {filteredMembers.map((m) => (
//                       <tr key={m._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, m, "member")}>
//                         <td className="px-6 py-4 text-white font-medium">{m.username}</td>
//                         <td className="px-6 py-4 text-slate-300">{m.email}</td>
//                         <td className="px-6 py-4">
//                           <div className="flex flex-wrap gap-1">
//                             {m.team?.map((t, i) => (
//                               <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">{t.name || t}</span>
//                             ))}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 text-slate-300">{m.year && m.division ? `${m.year} ${m.division}` : "N/A"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}</>
//             )}

//             {activeTab === "heads" && (
//               <>{filteredHeads.length === 0 ? (
//                 <div className="px-6 py-12 text-center">
//                   <UserCog className="w-12 h-12 text-slate-600 mx-auto mb-3" />
//                   <p className="text-slate-400">No heads found</p>
//                 </div>
//               ) : (
//                 <table className="w-full">
//                   <thead className="bg-slate-900/50">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Username</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Teams</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Password</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-700/50">
//                     {filteredHeads.map((h) => (
//                       <tr key={h._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, h, "head")}>
//                         <td className="px-6 py-4 text-white font-medium">{h.username}</td>
//                         <td className="px-6 py-4 text-slate-300">{h.email}</td>
//                         <td className="px-6 py-4">
//                           <div className="flex flex-wrap gap-1">
//                             {h.team?.map((t, i) => (
//                               <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">{t.name || t}</span>
//                             ))}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <code className="px-3 py-1 bg-slate-900 text-slate-300 rounded-lg text-sm font-mono">{h.initialPassword}</code>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}</>
//             )}

//             {activeTab === "meetings" && (
//               <>{filteredMeetings.length === 0 ? (
//                 <div className="px-6 py-12 text-center">
//                   <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
//                   <p className="text-slate-400">No meetings found</p>
//                 </div>
//               ) : (
//                 <table className="w-full">
//                   <thead className="bg-slate-900/50">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date & Time</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Location</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-700/50">
//                     {filteredMeetings.map((meeting) => (
//                       <tr key={meeting._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, meeting, "meeting")}>
//                         <td className="px-6 py-4 text-white font-medium">{meeting.title}</td>
//                         <td className="px-6 py-4 text-slate-300">{new Date(meeting.dateTime).toLocaleString()}</td>
//                         <td className="px-6 py-4 text-slate-300">{meeting.location || "N/A"}</td>
//                         <td className="px-6 py-4">
//                           <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">{meeting.status}</span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}</>
//             )}

//             {activeTab === "tasks" && (
//               <>{filteredTasks.length === 0 ? (
//                 <div className="px-6 py-12 text-center">
//                   <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
//                   <p className="text-slate-400">No tasks found</p>
//                 </div>
//               ) : (
//                 <table className="w-full">
//                   <thead className="bg-slate-900/50">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Team</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Deadline</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-700/50">
//                     {filteredTasks.map((task) => (
//                       <tr key={task._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, task, "task")}>
//                         <td className="px-6 py-4 text-white font-medium">{task.title}</td>
//                         <td className="px-6 py-4 text-slate-300">{task.team?.name || "N/A"}</td>
//                         <td className="px-6 py-4">
//                           <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">{task.status}</span>
//                         </td>
//                         <td className="px-6 py-4 text-slate-300">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}</>
//             )}
//           </div>
//         </div>
//       </main>

//       {contextMenu && (
//         <div
//           className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-2 z-50"
//           style={{ left: contextMenu.x, top: contextMenu.y }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <button
//             onClick={handleDeleteClick}
//             className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
//           >
//             <Trash2 className="w-4 h-4" />
//             Delete {contextMenu.type}
//           </button>
//         </div>
//       )}

//       {deleteModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
//           <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
//                 <Trash2 className="w-6 h-6 text-red-400" />
//               </div>
//               <div>
//                 <h3 className="text-xl font-bold text-white">
//                   Delete {deleteModal.type.charAt(0).toUpperCase() + deleteModal.type.slice(1)}
//                 </h3>
//                 <p className="text-slate-400 text-sm">This action cannot be undone</p>
//               </div>
//             </div>

//             <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
//               <p className="text-slate-300 text-sm mb-2">You are about to delete:</p>
//               <p className="text-white font-semibold">
//                 {deleteModal.item.username || deleteModal.item.title || deleteModal.item.email}
//               </p>
//             </div>

//             {deleteModal.requiresSecurityCode && (
//               <div className="mb-4">
//                 <label className="block text-slate-300 text-sm font-medium mb-2">
//                   Enter Security Code
//                 </label>
//                 <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
//                   <p className="text-yellow-300 text-sm mb-1">Security Code:</p>
//                   <p className="text-yellow-100 text-2xl font-mono font-bold tracking-wider">
//                     {generatedCode}
//                   </p>
//                 </div>
//                 <input
//                   type="text"
//                   value={securityCode}
//                   onChange={(e) => setSecurityCode(e.target.value)}
//                   placeholder="Enter the code above"
//                   className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-lg"
//                   autoFocus
//                 />
//               </div>
//             )}

//             {!deleteModal.requiresSecurityCode && (
//               <p className="text-slate-400 text-sm mb-4">
//                 Are you sure you want to delete this {deleteModal.type}?
//               </p>
//             )}

//             <div className="flex gap-3">
//               <button
//                 onClick={() => {
//                   setDeleteModal(null);
//                   setSecurityCode("");
//                   setGeneratedCode("");
//                 }}
//                 className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmDelete}
//                 className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import {
  Users,
  UserPlus,
  Shield,
  LogOut,
  Loader2,
  UserCircle,
  Calendar,
  CheckSquare,
  UsersRound,
  UserCog,
  Clock,
  MapPin,
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Users as UsersIcon
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [heads, setHeads] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  
  // ✅ New State for Expanded Row
  const [expandedUserId, setExpandedUserId] = useState(null);

  const [contextMenu, setContextMenu] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [securityCode, setSecurityCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchAllData = async () => {
      try {
        const [usersRes, membersRes, headsRes, meetingsRes, tasksRes] =
          await Promise.all([
            api.get("/admin/users", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/admin/members", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/admin/heads", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/admin/meetings", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/admin/tasks", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setUsers(usersRes.data || []);
        setMembers(membersRes.data || []);
        setHeads(headsRes.data || []);
        setMeetings(meetingsRes.data || []);
        setTasks(tasksRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("adminToken");
          router.push("/login");
        } else {
          setLoading(false);
        }
      }
    };

    fetchAllData();
  }, [router]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // --- STATS & DETAILS LOGIC ---
  const getUserStats = (userId) => {
    const meetingCounts = { Urgent: 0, High: 0, Medium: 0, Low: 0 };
    
    meetings.forEach((meet) => {
      const isInvited = meet.invitedMembers?.some((m) => (m._id || m) === userId);
      const isInTeam = meet.team?.some((t) => 
        t.members?.some((m) => (m._id || m) === userId) ||
        t.heads?.some((h) => (h._id || h) === userId)
      );

      if (isInvited || isInTeam) {
        const priority = meet.priority || "Medium"; 
        if (meetingCounts[priority] !== undefined) meetingCounts[priority]++;
      }
    });

    let completedTasks = 0;
    tasks.forEach((task) => {
      task.subtasks?.forEach((sub) => {
        const isAssigned = sub.assignedTo?.some((u) => (u._id || u) === userId);
        if (isAssigned && sub.status === "Completed") completedTasks++;
      });
    });

    return { meetingCounts, completedTasks };
  };

  // ✅ New Helper: Get Detailed Meeting & Task Data for a User
  const getMemberDetails = (userId) => {
    // 1. Filter Meetings
    const userMeetings = meetings.filter((meet) => {
      const isInvited = meet.invitedMembers?.some((m) => (m._id || m) === userId);
      const isInTeam = meet.team?.some((t) => 
        t.members?.some((m) => (m._id || m) === userId)
      );
      return isInvited || isInTeam;
    });

    // 2. Filter Tasks (Find main tasks where user has at least one subtask)
    const userTasks = tasks.map(task => {
      // Find subtasks assigned to this user
      const mySubtasks = task.subtasks?.filter(sub => 
        sub.assignedTo?.some(u => (u._id || u) === userId)
      );
      
      if (mySubtasks && mySubtasks.length > 0) {
        return { ...task, mySubtasks };
      }
      return null;
    }).filter(t => t !== null);

    return { userMeetings, userTasks };
  };

  const toggleExpand = (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const generateSecurityCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type,
    });
  };

  const handleDeleteClick = () => {
    const { item, type } = contextMenu;
    const requiresSecurityCode = ["user", "member", "head"].includes(type);
    
    if (requiresSecurityCode) {
      const code = generateSecurityCode();
      setGeneratedCode(code);
    }
    
    setDeleteModal({ item, type, requiresSecurityCode });
    setContextMenu(null);
  };

  const handleConfirmDelete = async () => {
    const { item, type, requiresSecurityCode } = deleteModal;
  
    if (requiresSecurityCode && securityCode !== generatedCode) {
      alert("Security code doesn't match!");
      return;
    }
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/login");
      return;
    }
  
    try {
      let endpoint = "";
      switch (type) {
        case "user": case "member": case "head":
          endpoint = `/admin/${item._id}`; break;
        case "meeting":
          endpoint = `/meetings/delete/${item._id}`; break;
        case "task":
          endpoint = `/tasks/delete/${item._id}`; break;
        default: return;
      }
  
      await api.delete(endpoint, { headers: { Authorization: `Bearer ${token}` } });
  
      const removeFilter = (list) => list.filter((i) => i._id !== item._id);
      switch (type) {
        case "user": setUsers(removeFilter(users)); break;
        case "member": setMembers(removeFilter(members)); break;
        case "head": setHeads(removeFilter(heads)); break;
        case "meeting": setMeetings(removeFilter(meetings)); break;
        case "task": setTasks(removeFilter(tasks)); break;
      }
      alert(`${type} deleted successfully!`);
    } catch (err) {
      alert(`Failed to delete ${type}.`);
    } finally {
      setDeleteModal(null);
      setSecurityCode("");
      setGeneratedCode("");
    }
  };
  
  const filterData = (data, keys) => {
    if (!searchQuery) return data;
    return data.filter((item) =>
      keys.some((key) => {
        const value = key.includes(".") ? key.split(".").reduce((obj, k) => obj?.[k], item) : item[key];
        return String(value || "").toLowerCase().includes(searchQuery);
      })
    );
  };

  const filteredUsers = filterData(users, ["username", "email", "role", "year", "division"]);
  const filteredMembers = filterData(members, ["username", "email", "team", "year", "division"]);
  const filteredHeads = filterData(heads, ["username", "email", "team"]);
  const filteredMeetings = filterData(meetings, ["title", "location", "status", "priority", "tags"]);
  const filteredTasks = filterData(tasks, ["title", "team.name", "status"]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-400">Manage Club Data</p>
              </div>
            </div>
            <button 
              onClick={() => { localStorage.removeItem("adminToken"); router.push("/login"); }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-blue-400" /></div>
            <div><p className="text-slate-400 text-sm">Total Users</p><p className="text-white text-2xl font-bold">{users.length}</p></div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center"><Shield className="w-6 h-6 text-purple-400" /></div>
            <div><p className="text-slate-400 text-sm">Team Heads</p><p className="text-white text-2xl font-bold">{heads.length}</p></div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center"><UserCircle className="w-6 h-6 text-green-400" /></div>
            <div><p className="text-slate-400 text-sm">Members</p><p className="text-white text-2xl font-bold">{members.length}</p></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => router.push("/create-member")} className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><UserPlus className="w-6 h-6 text-blue-400" /></div><span className="text-white font-medium">Add Member</span>
            </button>
            <button onClick={() => router.push("/create-head")} className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 rounded-xl transition-all group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Shield className="w-6 h-6 text-purple-400" /></div><span className="text-white font-medium">Create Head</span>
            </button>
            <button onClick={() => router.push("/create-meeting")} className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition-all group">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Calendar className="w-6 h-6 text-cyan-400" /></div><span className="text-white font-medium">Create Meeting</span>
            </button>
            <button onClick={() => router.push("/create-task")} className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:border-green-500/40 rounded-xl transition-all group">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><CheckSquare className="w-6 h-6 text-green-400" /></div><span className="text-white font-medium">Create Task</span>
            </button>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="mb-6 flex items-center gap-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl px-4 py-3">
           <Search className="w-5 h-5 text-slate-400" />
          <input type="text" value={searchQuery} onChange={handleSearch} placeholder={`Search in ${activeTab}...`} className="bg-transparent outline-none text-white w-full placeholder-slate-400" />
        </div>

        <div className="sticky top-[64px] z-20 bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3 rounded-xl mx-0">
          <div className="flex gap-2 overflow-x-auto">
            <button onClick={() => setActiveTab("users")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "users" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}><Users className="w-4 h-4" /> All Users</button>
            <button onClick={() => setActiveTab("members")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "members" ? "bg-green-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}><UsersRound className="w-4 h-4" /> All Members</button>
            <button onClick={() => setActiveTab("heads")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "heads" ? "bg-purple-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}><UserCog className="w-4 h-4" /> All Heads</button>
            <button onClick={() => setActiveTab("meetings")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "meetings" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}><Calendar className="w-4 h-4" /> All Meetings</button>
            <button onClick={() => setActiveTab("tasks")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "tasks" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}><CheckSquare className="w-4 h-4" /> All Tasks</button>
          </div>
        </div>

         <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            
            {/* === USER TAB === */}
            {activeTab === "users" && (
              <>{filteredUsers.length === 0 ? (
                <div className="px-6 py-12 text-center"><Users className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No users found</p></div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Username</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Division</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, u, "user")}>
                          <td className="px-6 py-4">
                            <div className="text-white font-medium">{u.username}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${u.role === "Admin" ? "bg-purple-500/20 text-purple-300" : u.role === "Head" ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-300"}`}>{u.role}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{u.year && u.division ? `${u.year} ${u.division}` : "N/A"}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              )}</>
            )}

            {/* === MEMBERS TAB (Expandable) === */}
            {activeTab === "members" && (
              <>{filteredMembers.length === 0 ? <div className="px-6 py-12 text-center"><UsersRound className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No members found</p></div> : (
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 w-8"></th>
                      <th className="px-6 py-4 text-left text-sm text-slate-300">Username</th>
                      <th className="px-6 py-4 text-left text-sm text-slate-300">Teams</th>
                      <th className="px-6 py-4 text-left text-sm text-slate-300">Division</th>
                      <th className="px-6 py-4 text-center text-sm text-slate-300">Meetings <br/><span className="text-[10px] text-slate-500">(U/H/M/L)</span></th>
                      <th className="px-6 py-4 text-center text-sm text-slate-300">Tasks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredMembers.map((m) => {
                       const stats = getUserStats(m._id);
                       const isExpanded = expandedUserId === m._id;
                       const { userMeetings, userTasks } = isExpanded ? getMemberDetails(m._id) : { userMeetings: [], userTasks: [] };

                       return (
                        <>
                          <tr 
                            key={m._id} 
                            onClick={() => toggleExpand(m._id)}
                            className={`transition-colors cursor-pointer ${isExpanded ? 'bg-slate-800/80' : 'hover:bg-slate-700/30'}`}
                            onContextMenu={(e) => handleContextMenu(e, m, "member")}
                          >
                            <td className="px-6 py-4 text-slate-400">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white font-medium">{m.username}</div>
                              <div className="text-xs text-slate-400">{m.email}</div>
                            </td>
                            <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{m.team?.map((t, i) => (<span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">{t.name || t}</span>))}</div></td>
                            <td className="px-6 py-4 text-slate-300">{m.year && m.division ? `${m.year} ${m.division}` : "N/A"}</td>
                            
                            {/* Stats Badges */}
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2">
                                <div className="flex flex-col items-center" title="Urgent"><span className="w-2 h-2 rounded-full bg-red-500 mb-1"></span><span className="text-sm text-slate-300">{stats.meetingCounts.Urgent}</span></div>
                                <div className="flex flex-col items-center" title="High"><span className="w-2 h-2 rounded-full bg-orange-500 mb-1"></span><span className="text-sm text-slate-300">{stats.meetingCounts.High}</span></div>
                                <div className="flex flex-col items-center" title="Medium"><span className="w-2 h-2 rounded-full bg-yellow-500 mb-1"></span><span className="text-sm text-slate-300">{stats.meetingCounts.Medium}</span></div>
                                <div className="flex flex-col items-center" title="Low"><span className="w-2 h-2 rounded-full bg-green-500 mb-1"></span><span className="text-sm text-slate-300">{stats.meetingCounts.Low}</span></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-lg border border-slate-600">
                                <CheckSquare className="w-4 h-4 text-green-400" />
                                <span className="text-white font-bold">{stats.completedTasks}</span>
                              </div>
                            </td>
                          </tr>
                          
                          {/* --- EXPANDED ROW CONTENT --- */}
                          {isExpanded && (
                            <tr className="bg-slate-900/40">
                              <td colSpan="6" className="px-6 py-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  
                                  {/* Meetings Attended */}
                                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-4 text-cyan-400">
                                      <Calendar className="w-5 h-5" />
                                      <h3 className="font-bold">Meetings Attended</h3>
                                    </div>
                                    {userMeetings.length > 0 ? (
                                      <ul className="space-y-3">
                                        {userMeetings.map(meet => (
                                          <li key={meet._id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                            <div className="font-medium text-white mb-1">{meet.title}</div>
                                            <div className="text-xs text-slate-400 flex flex-wrap gap-1">
                                              <UsersIcon className="w-3 h-3 mr-1 inline" />
                                              <span className="font-semibold">Invited:</span> 
                                              {meet.invitedMembers?.map(u => (u.username || u.email)).join(", ") || "All Team Members"}
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-slate-500 text-sm italic">No meetings found.</p>
                                    )}
                                  </div>

                                  {/* Tasks & Subtasks */}
                                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-4 text-orange-400">
                                      <Briefcase className="w-5 h-5" />
                                      <h3 className="font-bold">Assigned Tasks</h3>
                                    </div>
                                    {userTasks.length > 0 ? (
                                      <ul className="space-y-3">
                                        {userTasks.map(task => (
                                          <li key={task._id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                            <div className="font-medium text-white mb-2 border-b border-slate-700 pb-2">{task.title}</div>
                                            {task.mySubtasks.map(sub => (
                                              <div key={sub._id} className="mb-2 last:mb-0 pl-2 border-l-2 border-slate-600">
                                                <div className="flex justify-between items-start">
                                                  <span className="text-sm text-slate-200 font-medium">{sub.title}</span>
                                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                                    sub.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                                  }`}>{sub.status}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-1">
                                                  <span className="font-semibold">Assigned:</span> {sub.assignedTo?.map(u => u.username).join(", ")}
                                                </div>
                                              </div>
                                            ))}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-slate-500 text-sm italic">No tasks assigned.</p>
                                    )}
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                       );
                    })}
                  </tbody>
                </table>
              )}</>
            )}

            {/* === HEADS TAB (No Password) === */}
            {activeTab === "heads" && (
              <>{filteredHeads.length === 0 ? <div className="px-6 py-12 text-center"><UserCog className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No heads found</p></div> : (
                <table className="w-full">
                  <thead className="bg-slate-900/50"><tr><th className="px-6 py-4 text-left text-sm text-slate-300">Username</th><th className="px-6 py-4 text-left text-sm text-slate-300">Email</th><th className="px-6 py-4 text-left text-sm text-slate-300">Teams</th></tr></thead>
                  <tbody className="divide-y divide-slate-700/50">{filteredHeads.map((h) => (<tr key={h._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, h, "head")}><td className="px-6 py-4 text-white font-medium">{h.username}</td><td className="px-6 py-4 text-slate-300">{h.email}</td><td className="px-6 py-4"><div className="flex flex-wrap gap-1">{h.team?.map((t, i) => (<span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">{t.name || t}</span>))}</div></td></tr>))}</tbody>
                </table>
              )}</>
            )}

            {/* Meetings Tab */}
            {activeTab === "meetings" && (
              <>{filteredMeetings.length === 0 ? <div className="px-6 py-12 text-center"><Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No meetings found</p></div> : (
                <table className="w-full">
                  <thead className="bg-slate-900/50"><tr><th className="px-6 py-4 text-left text-sm text-slate-300">Title</th><th className="px-6 py-4 text-left text-sm text-slate-300">Date & Time</th><th className="px-6 py-4 text-left text-sm text-slate-300">Location</th><th className="px-6 py-4 text-left text-sm text-slate-300">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-700/50">{filteredMeetings.map((meeting) => (<tr key={meeting._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, meeting, "meeting")}><td className="px-6 py-4 text-white font-medium">{meeting.title}</td><td className="px-6 py-4 text-slate-300">{new Date(meeting.dateTime).toLocaleString()}</td><td className="px-6 py-4 text-slate-300">{meeting.location || "N/A"}</td><td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">{meeting.status}</span></td></tr>))}</tbody>
                </table>
              )}</>
            )}

            {/* Tasks Tab */}
            {activeTab === "tasks" && (
              <>{filteredTasks.length === 0 ? <div className="px-6 py-12 text-center"><CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No tasks found</p></div> : (
                <table className="w-full">
                  <thead className="bg-slate-900/50"><tr><th className="px-6 py-4 text-left text-sm text-slate-300">Title</th><th className="px-6 py-4 text-left text-sm text-slate-300">Team</th><th className="px-6 py-4 text-left text-sm text-slate-300">Status</th><th className="px-6 py-4 text-left text-sm text-slate-300">Deadline</th></tr></thead>
                  <tbody className="divide-y divide-slate-700/50">{filteredTasks.map((task) => (<tr key={task._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, task, "task")}><td className="px-6 py-4 text-white font-medium">{task.title}</td><td className="px-6 py-4 text-slate-300">{task.team?.name || "N/A"}</td><td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">{task.status}</span></td><td className="px-6 py-4 text-slate-300">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</td></tr>))}</tbody>
                </table>
              )}</>
            )}

          </div>
        </div>
      </main>

      {contextMenu && (
        <div className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-2 z-50" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(e) => e.stopPropagation()}>
          <button onClick={handleDeleteClick} className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete {contextMenu.type}</button>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center"><Trash2 className="w-6 h-6 text-red-400" /></div>
              <div><h3 className="text-xl font-bold text-white">Delete {deleteModal.type.charAt(0).toUpperCase() + deleteModal.type.slice(1)}</h3><p className="text-slate-400 text-sm">This action cannot be undone</p></div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4"><p className="text-slate-300 text-sm mb-2">You are about to delete:</p><p className="text-white font-semibold">{deleteModal.item.username || deleteModal.item.title || deleteModal.item.email}</p></div>
            {deleteModal.requiresSecurityCode && (
              <div className="mb-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">Enter Security Code</label>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3"><p className="text-yellow-300 text-sm mb-1">Security Code:</p><p className="text-yellow-100 text-2xl font-mono font-bold tracking-wider">{generatedCode}</p></div>
                <input type="text" value={securityCode} onChange={(e) => setSecurityCode(e.target.value)} placeholder="Enter the code above" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-lg" autoFocus />
              </div>
            )}
            {!deleteModal.requiresSecurityCode && <p className="text-slate-400 text-sm mb-4">Are you sure you want to delete this {deleteModal.type}?</p>}
            <div className="flex gap-3">
              <button onClick={() => { setDeleteModal(null); setSecurityCode(""); setGeneratedCode(""); }} className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}