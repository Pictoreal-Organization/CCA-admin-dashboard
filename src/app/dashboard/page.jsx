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

//   const handleLogout = () => {
//     localStorage.removeItem("adminToken");
//     router.push("/login");
//   };

//   const handleSearch = (e) => {
//     setSearchQuery(e.target.value.toLowerCase());
//   };

//   // Filter data dynamically based on search query
//   const filterData = (data, keys) => {
//     if (!searchQuery) return data;
//     return data.filter((item) =>
//       keys.some((key) => {
//         const value = key.includes(".")
//           ? key.split(".").reduce((obj, k) => obj?.[k], item)
//           : item[key];
//         return String(value || "")
//           .toLowerCase()
//           .includes(searchQuery);
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
//       {/* Header */}
//       <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
//                 <Shield className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
//                 <p className="text-sm text-slate-400">Manage users and permissions</p>
//               </div>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
//             >
//               <LogOut className="w-4 h-4" />
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         {/* Stats Cards */}
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
//           <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <button
//               onClick={() => router.push("/create-member")}
//               className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all group"
//             >
//               <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                 <UserPlus className="w-6 h-6 text-blue-400" />
//               </div>
//               <span className="text-white font-medium">Add Member</span>
//             </button>

//             <button
//               onClick={() => router.push("/create-head")}
//               className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 rounded-xl transition-all group"
//             >
//               <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                 <Shield className="w-6 h-6 text-purple-400" />
//               </div>
//               <span className="text-white font-medium">Create Head</span>
//             </button>

//             <button
//               onClick={() => router.push("/create-meeting")}
//               className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition-all group"
//             >
//               <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                 <Calendar className="w-6 h-6 text-cyan-400" />
//               </div>
//               <span className="text-white font-medium">Create Meeting</span>
//             </button>

//             <button
//               onClick={() => router.push("/create-task")}
//               className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:border-green-500/40 rounded-xl transition-all group"
//             >
//               <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                 <CheckSquare className="w-6 h-6 text-green-400" />
//               </div>
//               <span className="text-white font-medium">Create Task</span>
//             </button>
//           </div>
//         </div>

//         {/* Search Bar */}
//         <div className="mb-6 flex items-center gap-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl px-4 py-3">
//           <Search className="w-5 h-5 text-slate-400" />
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={handleSearch}
//             placeholder={`Search in ${activeTab}...`}
//             className="bg-transparent outline-none text-white w-full placeholder-slate-400"
//           />
//         </div>

//         {/* Tabbed View Section */}
//         <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
//           {/* Tab Headers */}
//           <div className="flex gap-2 px-6 py-4 border-b border-slate-700/50 overflow-x-auto">
//             <button
//               onClick={() => setActiveTab("users")}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 activeTab === "users"
//                   ? "bg-blue-500 text-white"
//                   : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <Users className="w-4 h-4" />
//               All Users
//             </button>
//             <button
//               onClick={() => setActiveTab("members")}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 activeTab === "members"
//                   ? "bg-green-500 text-white"
//                   : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <UsersRound className="w-4 h-4" />
//               All Members
//             </button>
//             <button
//               onClick={() => setActiveTab("heads")}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 activeTab === "heads"
//                   ? "bg-purple-500 text-white"
//                   : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <UserCog className="w-4 h-4" />
//               All Heads
//             </button>
//             <button
//               onClick={() => setActiveTab("meetings")}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 activeTab === "meetings"
//                   ? "bg-cyan-500 text-white"
//                   : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <Calendar className="w-4 h-4" />
//               All Meetings
//             </button>
//             <button
//               onClick={() => setActiveTab("tasks")}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 activeTab === "tasks"
//                   ? "bg-orange-500 text-white"
//                   : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <CheckSquare className="w-4 h-4" />
//               All Tasks
//             </button>
//           </div>

//           {/* Tab Content */}
//           <div className="overflow-x-auto">
//             {/* All Users Tab */}
//             {activeTab === "users" && (
//               <>
//                 {filteredUsers.length === 0 ? (
//                   <div className="px-6 py-12 text-center">
//                     <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
//                     <p className="text-slate-400">No users found</p>
//                   </div>
//                 ) : (
//                   <table className="w-full">
//                     <thead className="bg-slate-900/50">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           <div className="flex items-center gap-2">
//                             <UserCircle className="w-4 h-4" />
//                             Username
//                           </div>
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           <div className="flex items-center gap-2">
//                             <Mail className="w-4 h-4" />
//                             Email
//                           </div>
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           <div className="flex items-center gap-2">
//                             <Shield className="w-4 h-4" />
//                             Role
//                           </div>
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Division
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-700/50">
//                       {filteredUsers.map((u) => (
//                         <tr key={u.email} className="hover:bg-slate-700/30 transition-colors">
//                           <td className="px-6 py-4 text-white font-medium">{u.username}</td>
//                           <td className="px-6 py-4 text-slate-300">{u.email}</td>
//                           <td className="px-6 py-4">
//                             <span
//                               className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                                 u.role === "Admin"
//                                   ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
//                                   : u.role === "Head"
//                                   ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
//                                   : "bg-green-500/20 text-green-300 border border-green-500/30"
//                               }`}
//                             >
//                               {u.role}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 text-slate-300">
//                             {u.year && u.division ? `${u.year} ${u.division}` : "N/A"}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </>
//             )}

//             {/* All Members Tab */}
//             {activeTab === "members" && (
//               <>
//                 {filteredMembers.length === 0 ? (
//                   <div className="px-6 py-12 text-center">
//                     <UsersRound className="w-12 h-12 text-slate-600 mx-auto mb-3" />
//                     <p className="text-slate-400">No members found</p>
//                   </div>
//                 ) : (
//                   <table className="w-full">
//                     <thead className="bg-slate-900/50">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Username
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Email
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Teams
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Division
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-700/50">
//                       {filteredMembers.map((m) => (
//                         <tr key={m._id} className="hover:bg-slate-700/30 transition-colors">
//                           <td className="px-6 py-4 text-white font-medium">{m.username}</td>
//                           <td className="px-6 py-4 text-slate-300">{m.email}</td>
//                           <td className="px-6 py-4">
//                             <div className="flex flex-wrap gap-1">
//                               {m.team?.map((t, i) => (
//                                 <span
//                                   key={i}
//                                   className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded"
//                                 >
//                                   {t.name || t}
//                                 </span>
//                               ))}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 text-slate-300">
//                             {m.year && m.division ? `${m.year} ${m.division}` : "N/A"}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </>
//             )}

//             {/* All Heads Tab */}
//             {activeTab === "heads" && (
//               <>
//                 {filteredHeads.length === 0 ? (
//                   <div className="px-6 py-12 text-center">
//                     <UserCog className="w-12 h-12 text-slate-600 mx-auto mb-3" />
//                     <p className="text-slate-400">No heads found</p>
//                   </div>
//                 ) : (
//                   <table className="w-full">
//                     <thead className="bg-slate-900/50">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Username
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Email
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Teams
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Password
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-700/50">
//                       {filteredHeads.map((h) => (
//                         <tr key={h._id} className="hover:bg-slate-700/30 transition-colors">
//                           <td className="px-6 py-4 text-white font-medium">{h.username}</td>
//                           <td className="px-6 py-4 text-slate-300">{h.email}</td>
//                           <td className="px-6 py-4">
//                             <div className="flex flex-wrap gap-1">
//                               {h.team?.map((t, i) => (
//                                 <span
//                                   key={i}
//                                   className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded"
//                                 >
//                                   {t.name || t}
//                                 </span>
//                               ))}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4">
//                             <code className="px-3 py-1 bg-slate-900 text-slate-300 rounded-lg text-sm font-mono border border-slate-700">
//                               {h.initialPassword}
//                             </code>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </>
//             )}

//             {/* All Meetings Tab */}
//             {activeTab === "meetings" && (
//               <>
//                 {filteredMeetings.length === 0 ? (
//                   <div className="px-6 py-12 text-center">
//                     <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
//                     <p className="text-slate-400">No meetings found</p>
//                   </div>
//                 ) : (
//                   <table className="w-full">
//                     <thead className="bg-slate-900/50">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Title
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Date & Time
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Location
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Tags
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Status
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Priority
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-700/50">
//                       {filteredMeetings.map((meeting) => (
//                         <tr key={meeting._id} className="hover:bg-slate-700/30 transition-colors">
//                           <td className="px-6 py-4 text-white font-medium">{meeting.title}</td>
//                           <td className="px-6 py-4 text-slate-300">
//                             <div className="flex items-center gap-2">
//                               <Clock className="w-4 h-4" />
//                               {new Date(meeting.dateTime).toLocaleString()}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 text-slate-300">
//                             <div className="flex items-center gap-2">
//                               <MapPin className="w-4 h-4" />
//                               {meeting.location || meeting.onlineLink || "N/A"}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4">
//                             <div className="flex flex-wrap gap-1">
//                               {meeting.tags && meeting.tags.length > 0 ? (
//                                 meeting.tags.map((tag, i) => (
//                                   <span
//                                     key={i}
//                                     className={`px-2 py-1 rounded text-xs font-medium ${
//                                       tag === "General"
//                                         ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
//                                         : tag === "Impactathon"
//                                         ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
//                                         : tag === "PictoFest"
//                                         ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
//                                         : tag === "BDD"
//                                         ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
//                                         : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
//                                     }`}
//                                   >
//                                     {tag}
//                                   </span>
//                                 ))
//                               ) : (
//                                 <span className="text-slate-400 text-xs">No tags</span>
//                               )}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4">
//                             <span
//                               className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                 meeting.status === "completed"
//                                   ? "bg-green-500/20 text-green-300"
//                                   : meeting.status === "ongoing"
//                                   ? "bg-blue-500/20 text-blue-300"
//                                   : meeting.status === "cancelled"
//                                   ? "bg-red-500/20 text-red-300"
//                                   : "bg-yellow-500/20 text-yellow-300"
//                               }`}
//                             >
//                               {meeting.status}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4">
//                             <span
//                               className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                 meeting.priority === "Urgent"
//                                   ? "bg-red-500/20 text-red-300"
//                                   : meeting.priority === "High"
//                                   ? "bg-orange-500/20 text-orange-300"
//                                   : meeting.priority === "Medium"
//                                   ? "bg-yellow-500/20 text-yellow-300"
//                                   : "bg-green-500/20 text-green-300"
//                               }`}
//                             >
//                               {meeting.priority}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </>
//             )}

//             {/* All Tasks Tab */}
//             {activeTab === "tasks" && (
//               <>
//                 {filteredTasks.length === 0 ? (
//                   <div className="px-6 py-12 text-center">
//                     <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
//                     <p className="text-slate-400">No tasks found</p>
//                   </div>
//                 ) : (
//                   <table className="w-full">
//                     <thead className="bg-slate-900/50">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Title
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Team
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Status
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Deadline
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
//                           Subtasks
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-700/50">
//                       {filteredTasks.map((task) => (
//                         <tr key={task._id} className="hover:bg-slate-700/30 transition-colors">
//                           <td className="px-6 py-4 text-white font-medium">{task.title}</td>
//                           <td className="px-6 py-4 text-slate-300">
//                             {task.team?.name || "N/A"}
//                           </td>
//                           <td className="px-6 py-4">
//                             <span
//                               className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                 task.status === "Completed"
//                                   ? "bg-green-500/20 text-green-300"
//                                   : task.status === "In Progress"
//                                   ? "bg-blue-500/20 text-blue-300"
//                                   : "bg-yellow-500/20 text-yellow-300"
//                               }`}
//                             >
//                               {task.status}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 text-slate-300">
//                             {task.deadline
//                               ? new Date(task.deadline).toLocaleDateString()
//                               : "No deadline"}
//                           </td>
//                           <td className="px-6 py-4 text-slate-300">
//                             {task.subtasks?.length > 0 ? (
//                               <ul className="list-disc list-inside space-y-1">
//                                 {task.subtasks.map((sub) => (
//                                   <li key={sub._id}>
//                                     <span className="font-medium text-white">{sub.title}</span> —{" "}
//                                     <span className="text-slate-300">
//                                       Assigned to:{" "}
//                                       {sub.assignedTo?.length > 0
//                                         ? sub.assignedTo.map((u) => u.username).join(", ")
//                                         : "N/A"}
//                                     </span>
//                                     ,{" "}
//                                     <span
//                                       className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
//                                         sub.status === "Completed"
//                                           ? "bg-green-500/20 text-green-300"
//                                           : sub.status === "In Progress"
//                                           ? "bg-blue-500/20 text-blue-300"
//                                           : "bg-yellow-500/20 text-yellow-300"
//                                       }`}
//                                     >
//                                       {sub.status}
//                                     </span>
//                                   </li>
//                                 ))}
//                               </ul>
//                             ) : (
//                               <span>No subtasks</span>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </main>
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
  Mail,
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
        console.error("Error details:", err.response?.data || err.message);
        
        // Only redirect to login if it's an auth error
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("adminToken");
          router.push("/login");
        } else {
          // For other errors, just stop loading and show empty state
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
    
    setDeleteModal({
      item,
      type,
      requiresSecurityCode,
    });
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
    const id = item._id || item.id || item.userId;

  
    try {
      let endpoint = "";
      switch (type) {
        case "user":
          endpoint = `/admin/${item._id}`;
          break;
        case "member":
          endpoint = `/admin/${item._id}`;
          break;
        case "head":
          endpoint = `/admin/${item._id}`;
          break;
        case "meeting":
          endpoint = `/meetings/delete/${item._id}`;
          break;
        case "task":
          endpoint = `/tasks/delete/${item._id}`;
          break;
        default:
          console.error("Unknown type for deletion:", type);
          return;
      }
  
      // Make the API call
      await api.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // If successful, update UI locally
      switch (type) {
        case "user":
          setUsers(users.filter((u) => u._id !== item._id));
          break;
        case "member":
          setMembers(members.filter((m) => m._id !== item._id));
          break;
        case "head":
          setHeads(heads.filter((h) => h._id !== item._id));
          break;
        case "meeting":
          setMeetings(meetings.filter((m) => m._id !== item._id));
          break;
        case "task":
          setTasks(tasks.filter((t) => t._id !== item._id));
          break;
      }
  
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
    } catch (err) {
      console.error("Error deleting:", err.response?.data || err.message);
      alert(`Failed to delete ${type}. Please try again.`);
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
        const value = key.includes(".")
          ? key.split(".").reduce((obj, k) => obj?.[k], item)
          : item[key];
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
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-400">Right-click rows to delete</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-white text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Team Heads</p>
                <p className="text-white text-2xl font-bold">{heads.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Members</p>
                <p className="text-white text-2xl font-bold">{members.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => router.push("/create-member")}
            className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all group"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-white font-medium">Add Member</span>
          </button>

          <button
            onClick={() => router.push("/create-head")}
            className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 rounded-xl transition-all group"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-white font-medium">Create Head</span>
          </button>

          <button
            onClick={() => router.push("/create-meeting")}
            className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition-all group"
          >
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-white font-medium">Create Meeting</span>
          </button>

          <button
            onClick={() => router.push("/create-task")}
            className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:border-green-500/40 rounded-xl transition-all group"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckSquare className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-white font-medium">Create Task</span>
          </button>
        </div>
        </div>

        <div className="mb-6 flex items-center gap-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl px-4 py-3">
           <Search className="w-5 h-5 text-slate-400" />
          <input
             type="text"
             value={searchQuery}
             onChange={handleSearch}
             placeholder={`Search in ${activeTab}...`}
             className="bg-transparent outline-none text-white w-full placeholder-slate-400"
           />
        </div>

        {/* Sticky tab bar — moved OUT of the table container */}
        <div
          className="sticky top-[64px] z-20 bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3 rounded-xl mx-0"
        >
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === "users" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Users className="w-4 h-4" /> All Users
            </button>

            <button
              onClick={() => setActiveTab("members")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === "members" ? "bg-green-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <UsersRound className="w-4 h-4" /> All Members
            </button>

            <button
              onClick={() => setActiveTab("heads")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === "heads" ? "bg-purple-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <UserCog className="w-4 h-4" /> All Heads
            </button>

            <button
              onClick={() => setActiveTab("meetings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === "meetings" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Calendar className="w-4 h-4" /> All Meetings
            </button>

            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === "tasks" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <CheckSquare className="w-4 h-4" /> All Tasks
            </button>
          </div>
        </div>

         <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">

          <div className="overflow-x-auto">
            {activeTab === "users" && (
              <>{filteredUsers.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No users found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Username</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Division</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, u, "user")}>
                        <td className="px-6 py-4 text-white font-medium">{u.username}</td>
                        <td className="px-6 py-4 text-slate-300">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            u.role === "Admin" ? "bg-purple-500/20 text-purple-300" : u.role === "Head" ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-300"
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{u.year && u.division ? `${u.year} ${u.division}` : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}</>
            )}

            {activeTab === "members" && (
              <>{filteredMembers.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <UsersRound className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No members found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Username</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Teams</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Division</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredMembers.map((m) => (
                      <tr key={m._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, m, "member")}>
                        <td className="px-6 py-4 text-white font-medium">{m.username}</td>
                        <td className="px-6 py-4 text-slate-300">{m.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {m.team?.map((t, i) => (
                              <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">{t.name || t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{m.year && m.division ? `${m.year} ${m.division}` : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}</>
            )}

            {activeTab === "heads" && (
              <>{filteredHeads.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <UserCog className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No heads found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Username</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Teams</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredHeads.map((h) => (
                      <tr key={h._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, h, "head")}>
                        <td className="px-6 py-4 text-white font-medium">{h.username}</td>
                        <td className="px-6 py-4 text-slate-300">{h.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {h.team?.map((t, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">{t.name || t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="px-3 py-1 bg-slate-900 text-slate-300 rounded-lg text-sm font-mono">{h.initialPassword}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}</>
            )}

            {activeTab === "meetings" && (
              <>{filteredMeetings.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No meetings found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date & Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredMeetings.map((meeting) => (
                      <tr key={meeting._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, meeting, "meeting")}>
                        <td className="px-6 py-4 text-white font-medium">{meeting.title}</td>
                        <td className="px-6 py-4 text-slate-300">{new Date(meeting.dateTime).toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-300">{meeting.location || "N/A"}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">{meeting.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}</>
            )}

            {activeTab === "tasks" && (
              <>{filteredTasks.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No tasks found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Team</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredTasks.map((task) => (
                      <tr key={task._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, task, "task")}>
                        <td className="px-6 py-4 text-white font-medium">{task.title}</td>
                        <td className="px-6 py-4 text-slate-300">{task.team?.name || "N/A"}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">{task.status}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}</>
            )}
          </div>
        </div>
      </main>

      {contextMenu && (
        <div
          className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDeleteClick}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete {contextMenu.type}
          </button>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Delete {deleteModal.type.charAt(0).toUpperCase() + deleteModal.type.slice(1)}
                </h3>
                <p className="text-slate-400 text-sm">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
              <p className="text-slate-300 text-sm mb-2">You are about to delete:</p>
              <p className="text-white font-semibold">
                {deleteModal.item.username || deleteModal.item.title || deleteModal.item.email}
              </p>
            </div>

            {deleteModal.requiresSecurityCode && (
              <div className="mb-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Enter Security Code
                </label>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                  <p className="text-yellow-300 text-sm mb-1">Security Code:</p>
                  <p className="text-yellow-100 text-2xl font-mono font-bold tracking-wider">
                    {generatedCode}
                  </p>
                </div>
                <input
                  type="text"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  placeholder="Enter the code above"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-lg"
                  autoFocus
                />
              </div>
            )}

            {!deleteModal.requiresSecurityCode && (
              <p className="text-slate-400 text-sm mb-4">
                Are you sure you want to delete this {deleteModal.type}?
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal(null);
                  setSecurityCode("");
                  setGeneratedCode("");
                }}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}