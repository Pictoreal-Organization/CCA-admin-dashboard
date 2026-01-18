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
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Users as UsersIcon,
  Tag,
  PlusCircle,
  X,
  MapPin,
  Clock,
  AlertCircle,
  Edit
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  // Data States
  const [users, setUsers] = useState([]);

  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [roles, setRoles] = useState([]); // ✅ Roles State
  const [tags, setTags] = useState([]); // ✅ New Tags State
  const [teams, setTeams] = useState([]); // Teams for filtering
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("all"); // Team filter for members section
  const [selectedHeadTeamFilter, setSelectedHeadTeamFilter] = useState("all"); // Team filter for heads section
  const [selectedCoordinatorTagFilter, setSelectedCoordinatorTagFilter] = useState("all"); // Tag filter for coordinators
  const [selectedMeetingPriorityFilter, setSelectedMeetingPriorityFilter] = useState("all"); // Priority filter for meetings
  const [selectedMeetingTeamFilter, setSelectedMeetingTeamFilter] = useState("all"); // Team filter for meetings
  const [selectedMeetingTagFilter, setSelectedMeetingTagFilter] = useState("all"); // Tag filter for meetings
  const [selectedTaskTeamFilter, setSelectedTaskTeamFilter] = useState("all"); // Team filter for tasks
  const [selectedTaskTagFilter, setSelectedTaskTagFilter] = useState("all"); // Tag filter for tasks
  const [userSortOrder, setUserSortOrder] = useState("asc");

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");

  // UI States
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [newTagName, setNewTagName] = useState(""); // ✅ State for adding tag
  const [isAddingTag, setIsAddingTag] = useState(false);

  const [memberAttendance, setMemberAttendance] = useState({}); // Store attendance data for each member
  const [loadingAttendance, setLoadingAttendance] = useState({}); // Track loading state for each member


  // Modals & Context Menu
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [securityCode, setSecurityCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  // Meeting Details Modal
  const [isMeetingDetailModalOpen, setIsMeetingDetailModalOpen] = useState(false);
  const [currentMeetingDetails, setCurrentMeetingDetails] = useState(null);
  const [fetchingMeetingDetails, setFetchingMeetingDetails] = useState(false);

  // Task Details Modal
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [currentTaskDetails, setCurrentTaskDetails] = useState(null);
  const [fetchingTaskDetails, setFetchingTaskDetails] = useState(false);

  // Role Management State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permissions: [] });
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchAllData = async () => {
      try {
        // Added tags fetch to the Promise.all
        const [usersRes, meetingsRes, tasksRes, tagsRes, teamsRes, rolesRes] =
          await Promise.all([
            api.get("/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
            api.get("/admin/meetings", { headers: { Authorization: `Bearer ${token}` } }),
            api.get("/admin/tasks", { headers: { Authorization: `Bearer ${token}` } }),
            api.get("/tags", { headers: { Authorization: `Bearer ${token}` } }),
            api.get("/admin/visible-teams", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
            api.get("/roles", { headers: { Authorization: `Bearer ${token}` } })
          ]);

        setUsers(usersRes.data || []);
        // setMembers and setHeads removed as we will derive them from users + roles
        setMeetings(meetingsRes.data || []);
        setTasks(tasksRes.data || []);
        setTags(tagsRes.data || []);
        setTeams(teamsRes.data || []);
        setRoles(rolesRes.data || []); // needs state

        // Enhanced debug logging
        console.log("✅ Data fetched successfully:");
        console.log("  - Roles:", rolesRes.data?.length || 0);
        console.log("  - Teams:", teamsRes.data?.length || 0);
        console.log("  - Meetings:", meetingsRes.data?.length || 0);
        console.log("  - Tasks:", tasksRes.data?.length || 0);
        console.log("  - Tags:", tagsRes.data?.length || 0);

        // Debug: Check if meetings have team data
        const meetingsWithTeams = meetingsRes.data?.filter(m => m.team) || [];
        const meetingsWithoutTeams = meetingsRes.data?.filter(m => !m.team) || [];
        console.log("  - Meetings with teams:", meetingsWithTeams.length);
        console.log("  - Meetings without teams:", meetingsWithoutTeams.length);

        // Sample meeting data
        if (meetingsRes.data?.length > 0) {
          console.log("  - Sample meeting:", {
            title: meetingsRes.data[0].title,
            team: meetingsRes.data[0].team,
            tags: meetingsRes.data[0].tags
          });
        }

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

  // --- ACTIONS ---

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    setIsAddingTag(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.post("/tags/create", { name: newTagName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTags([...tags, res.data.tag]);
      setNewTagName("");
      alert("Tag added successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to add tag");
    } finally {
      setIsAddingTag(false);
    }
  };

  // --- ROLE MANAGEMENT LOGIC ---

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name) return;
    setIsCreatingRole(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.post("/roles", roleForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles([...roles, res.data]);
      setRoleForm({ name: "", description: "", permissions: [] });
      setIsRoleModalOpen(false);
      alert("Role created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to create role");
    } finally {
      setIsCreatingRole(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    const role = roles.find(r => r._id === roleId);
    if (!role) return;
    if (role.isSystem) {
      alert("Cannot delete system roles.");
      return;
    }

    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;

    try {
      const token = localStorage.getItem("adminToken");
      await api.delete(`/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(roles.filter(r => r._id !== roleId));
      alert("Role deleted successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to delete role");
    }
  };

  // --- STATS & DETAILS LOGIC ---
  const getUserStats = (userId) => {
    const meetingCounts = { Urgent: 0, High: 0, Medium: 0, Low: 0 };

    // Get attendance data for this member
    const attendanceData = memberAttendance[userId] || [];

    // Extract meeting IDs where the member is marked as present
    const presentMeetingIds = attendanceData
      .map(att => {
        const meetingId = att.meeting?._id || att.meeting;
        return meetingId ? String(meetingId) : null;
      })
      .filter(Boolean);

    // Count only meetings where member is marked as present
    meetings.forEach((meet) => {
      const isPresent = presentMeetingIds.includes(String(meet._id));

      if (isPresent) {
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

  const getMemberDetails = (userId) => {
    // Get attendance data for this member
    const attendanceData = memberAttendance[userId] || [];

    // Extract meeting IDs where the member is marked as present
    // Handle both populated objects and ObjectId strings
    const presentMeetingIds = attendanceData
      .map(att => {
        const meetingId = att.meeting?._id || att.meeting;
        return meetingId ? String(meetingId) : null;
      })
      .filter(Boolean);

    // Filter meetings to show only those where member is present
    const userMeetings = meetings.filter((meet) => {
      return presentMeetingIds.includes(String(meet._id));
    });

    const userTasks = tasks.map(task => {
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

  const fetchMemberAttendance = async (memberId) => {
    // If already fetched, don't fetch again
    if (memberAttendance[memberId]) {
      return;
    }

    setLoadingAttendance(prev => ({ ...prev, [memberId]: true }));
    const token = localStorage.getItem("adminToken");

    try {
      const res = await api.get(`/attendance/member/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMemberAttendance(prev => ({
        ...prev,
        [memberId]: res.data || []
      }));
    } catch (err) {
      console.error("Failed to fetch member attendance:", err);
      // Set empty array on error
      setMemberAttendance(prev => ({
        ...prev,
        [memberId]: []
      }));
    } finally {
      setLoadingAttendance(prev => ({ ...prev, [memberId]: false }));
    }
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
    setContextMenu({ x: e.clientX, y: e.clientY, item, type });
  };

  // Initial Trigger for Delete
  const handleDeleteClick = (itemOverride = null, typeOverride = null) => {
    const item = itemOverride || contextMenu?.item;
    const type = typeOverride || contextMenu?.type;

    if (!item || !type) return;

    // Tags don't necessarily need a security code, but users/heads do
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
        case "tag": // ✅ Delete Tag Endpoint
          endpoint = `/tags/delete/${item._id}`; break;
        default: return;
      }

      await api.delete(endpoint, { headers: { Authorization: `Bearer ${token}` } });

      const removeFilter = (list) => list.filter((i) => i._id !== item._id);
      switch (type) {
        case "user": setUsers(removeFilter(users)); break;
        // derived lists will auto-update when users changes
        case "member": setUsers(removeFilter(users)); break;
        case "head": setUsers(removeFilter(users)); break;
        case "meeting": setMeetings(removeFilter(meetings)); break;
        case "task": setTasks(removeFilter(tasks)); break;
        case "tag": setTags(removeFilter(tags)); break; // ✅ Update Tags State
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

  // Derive members and heads from users
  const members = users.filter((u) => u.role === "Member" || u.role === "member");
  const heads = users.filter((u) => u.role === "Head" || u.role === "head");

  const filteredUsers = filterData(users, ["username", "name", "rollNo", "email", "role", "year", "division"]);
  const filteredMembersBase = filterData(members, ["username", "name", "rollNo", "email", "team", "year", "division"]);

  // Apply team filter to members
  const filteredMembers = selectedTeamFilter === "all"
    ? filteredMembersBase
    : filteredMembersBase.filter(member => {
      if (!member.team || member.team.length === 0) return false;
      return member.team.some(team => {
        const teamId = typeof team === 'object' ? team._id : team;
        return teamId === selectedTeamFilter;
      });
    });

  // Filter heads by team
  let headsToDisplay = filterData(heads, ["username", "name", "rollNo", "email", "team"]);
  if (selectedHeadTeamFilter !== "all") {
    headsToDisplay = headsToDisplay.filter(h =>
      h.team?.some(t => (t._id || t) === selectedHeadTeamFilter)
    );
  }
  const filteredHeads = headsToDisplay;

  // Filter meetings by priority, team, and tag
  let meetingsToDisplay = meetings;
  if (selectedMeetingPriorityFilter !== "all") {
    meetingsToDisplay = meetingsToDisplay.filter(m => m.priority === selectedMeetingPriorityFilter);
  }
  if (selectedMeetingTeamFilter !== "all") {
    meetingsToDisplay = meetingsToDisplay.filter(m => {
      if (!m.team) return false; // Exclude meetings without team
      const teamId = typeof m.team === 'object' ? m.team._id : m.team;
      return teamId === selectedMeetingTeamFilter;
    });
  }
  if (selectedMeetingTagFilter !== "all") {
    meetingsToDisplay = meetingsToDisplay.filter(m =>
      m.tags?.some(tag => (tag._id || tag) === selectedMeetingTagFilter)
    );
  }
  const filteredMeetings = filterData(meetingsToDisplay, ["title", "location", "status", "priority", "tags"]);

  // Filter tasks by team and tag
  let tasksToDisplay = tasks;
  if (selectedTaskTeamFilter !== "all") {
    tasksToDisplay = tasksToDisplay.filter(t => (t.team?._id || t.team) === selectedTaskTeamFilter);
  }
  if (selectedTaskTagFilter !== "all") {
    tasksToDisplay = tasksToDisplay.filter(t =>
      t.tags?.some(tag => (tag._id || tag) === selectedTaskTagFilter)
    );
  }
  const filteredTasks = filterData(tasksToDisplay, ["title", "team.name", "status"]);
  const filteredTags = filterData(tags, ["name"]); // ✅ Filter Tags

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    if (userSortOrder === "asc") return nameA.localeCompare(nameB);
    return nameB.localeCompare(nameA);
  });

  const handleMeetingClick = async (meetingId) => {
    setFetchingMeetingDetails(true);
    setIsMeetingDetailModalOpen(true);
    setCurrentMeetingDetails(null);

    const token = localStorage.getItem("adminToken");

    try {
      const [meetingRes, attendanceRes] = await Promise.all([
        api.get(`/meetings/${meetingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),

        api.get(`/attendance/meeting/${meetingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const attendanceData = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];

      const transformedAttendance = {
        present: attendanceData
          .filter(item => item.status === "present")
          .map(item => item.member || item),
        absent: attendanceData
          .filter(item => item.status === "absent")
          .map(item => item.member || item)
      };

      const meetingData = meetingRes.data || {};

      setCurrentMeetingDetails({
        ...meetingData,
        attendance: transformedAttendance
      });

    } catch (err) {
      console.error("Failed to fetch meeting details:", err);
      alert("Failed to load meeting details.");
      setIsMeetingDetailModalOpen(false);
    } finally {
      setFetchingMeetingDetails(false);
    }
  };

  const handleTaskClick = async (taskId) => {
    setFetchingTaskDetails(true);
    setIsTaskDetailModalOpen(true);
    setCurrentTaskDetails(null);

    const token = localStorage.getItem("adminToken");

    try {
      const res = await api.get(`/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCurrentTaskDetails(res.data);
    } catch (err) {
      console.error("Failed to fetch task details:", err);
      alert("Failed to load task details.");
      setIsTaskDetailModalOpen(false);
    } finally {
      setFetchingTaskDetails(false);
    }
  };

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
            <button key="all-users" onClick={() => setActiveTab("users")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "users" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}><Users className="w-4 h-4" /> All Users</button>

            {roles.map(role => (
              <button
                key={role._id}
                onClick={() => setActiveTab(role.slug === 'member' ? 'members' : role.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === role.slug || (role.slug === 'member' && activeTab === 'members') ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
              >
                <UsersRound className="w-4 h-4" /> {role.name}
              </button>
            ))}

            <div className="w-px h-6 bg-slate-700/50 mx-2 self-center"></div>

            <button onClick={() => setActiveTab("meetings")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "meetings" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}><Calendar className="w-4 h-4" /> All Meetings</button>
            <button onClick={() => setActiveTab("tasks")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "tasks" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}><CheckSquare className="w-4 h-4" /> All Tasks</button>
            <button onClick={() => setActiveTab("tags")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "tags" ? "bg-pink-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}><Tag className="w-4 h-4" /> Meeting Tags</button>

            <div className="w-px h-6 bg-slate-700/50 mx-2 self-center"></div>

            <button onClick={() => setActiveTab("manage-roles")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "manage-roles" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}><Shield className="w-4 h-4" /> Manage Roles</button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">

            {/* === GENERIC USER TAB (Admin View Only mostly, or Users Tab) === */}
            {activeTab === "users" && (
              <>{filteredUsers.length === 0 ? (
                <div className="px-6 py-12 text-center"><Users className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No users found</p></div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Roll No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Division</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, u, "user")}>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{u.rollNo || "N/A"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${u.role === "Admin" ? "bg-purple-500/20 text-purple-300" : u.role === "Head" ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-300"}`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{u.year && u.division ? `${u.year} ${u.division}` : "N/A"}</td>
                        <td className="px-6 py-4 text-right">
                          {/* Actions for NON-ADMIN users */}
                          {u.role !== 'Admin' && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/edit-member?id=${u._id}`); }}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(u, 'user'); }}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}</>
            )}

            {/* === MEMBERS TAB === */}
            {activeTab === "members" && (
              <>{filteredMembers.length === 0 ? <div className="px-6 py-12 text-center"><UsersRound className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No members found</p></div> : (
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 w-8"></th>
                      <th className="px-6 py-4 text-left text-sm text-slate-300">Name</th>
                      <th className="px-6 py-4 text-left text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <span>Teams</span>
                          <select
                            value={selectedTeamFilter}
                            onChange={(e) => setSelectedTeamFilter(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="ml-2 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                          >
                            <option value="all">All Teams</option>
                            {teams.map((team) => (
                              <option key={team._id} value={team._id}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm text-slate-300">Department</th>
                      <th className="px-6 py-4 text-center text-sm text-slate-300">Meetings <br /><span className="text-[10px] text-slate-500">(U/H/M/L)</span></th>
                      <th className="px-6 py-4 text-center text-sm text-slate-300">Tasks</th>
                      <th className="px-6 py-4 text-right text-sm text-slate-300">Actions</th>
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
                              <div className="text-white font-medium">{m.name}</div>
                              <div className="text-xs text-slate-400">{m.email}</div>
                            </td>
                            <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{m.team?.map((t, i) => (<span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">{t.name || t}</span>))}</div></td>
                            <td className="px-6 py-4 text-slate-300">{m.year && m.division ? `${m.year} ${m.division}` : "N/A"}</td>
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
                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => router.push(`/edit-member?id=${m._id}`)}
                                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                  title="Edit Member"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(m, 'member')}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Delete Member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-900/40">
                              <td colSpan="6" className="px-6 py-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-4 text-cyan-400">
                                      <Calendar className="w-5 h-5" />
                                      <h3 className="font-bold">Meetings Attended</h3>
                                    </div>
                                    {loadingAttendance[m._id] ? (
                                      <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                                        <span className="ml-2 text-slate-400">Loading attendance...</span>
                                      </div>
                                    ) : userMeetings.length > 0 ? (
                                      <ul className="space-y-3">
                                        {userMeetings.map(meet => (
                                          <li key={meet._id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                            <div className="font-medium text-white mb-1">{meet.title}</div>
                                            {meet.dateTime && (
                                              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(meet.dateTime).toLocaleString()}
                                              </div>
                                            )}
                                            {meet.location && (
                                              <div className="text-xs text-slate-400 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {meet.location}
                                              </div>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-slate-500 text-sm italic">No meetings attended (marked as present).</p>
                                    )}
                                  </div>
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
                                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${sub.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
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

            {/* === HEADS TAB === */}
            {activeTab === "head" && (
              <>{filteredHeads.length === 0 ? <div className="px-6 py-12 text-center"><UserCog className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No heads found</p></div> : (
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm text-slate-300">Name</th>
                      <th className="px-6 py-4 text-left text-sm text-slate-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <span>Teams</span>
                          <select
                            value={selectedHeadTeamFilter}
                            onChange={(e) => setSelectedHeadTeamFilter(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="ml-2 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="all">All Teams</option>
                            {teams.map((team) => (
                              <option key={team._id} value={team._id}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-right text-sm text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">{filteredHeads.map((h) => (
                    <tr key={h._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, h, "head")}>
                      <td className="px-6 py-4 text-white font-medium">{h.name}</td>
                      <td className="px-6 py-4 text-slate-300">{h.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {h.team?.map((t, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                              {t.name || t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/edit-member?id=${h._id}`)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit Head"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(h, 'head')}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Head"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              )}</>
            )}

            {/* === MEETINGS TAB === */}
            {activeTab === "meetings" && (
              <>
                {meetings.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No meetings found</p>
                    <p className="text-slate-500 text-sm mt-2">Total meetings in database: {meetings.length}</p>
                  </div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-slate-900/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">Title</th>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">Date & Time</th>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">Location</th>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <div className="flex items-center gap-2">
                              <span>Priority</span>
                              <select
                                value={selectedMeetingPriorityFilter}
                                onChange={(e) => setSelectedMeetingPriorityFilter(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="ml-2 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                              >
                                <option value="all">All</option>
                                <option value="Urgent">Urgent</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <div className="flex items-center gap-2">
                              <span>Team</span>
                              <select
                                value={selectedMeetingTeamFilter}
                                onChange={(e) => setSelectedMeetingTeamFilter(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="ml-2 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                              >
                                <option value="all">All Teams</option>
                                {teams.map((team) => (
                                  <option key={team._id} value={team._id}>
                                    {team.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <div className="flex items-center gap-2">
                              <span>Tag</span>
                              <select
                                value={selectedMeetingTagFilter}
                                onChange={(e) => setSelectedMeetingTagFilter(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="ml-2 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                              >
                                <option value="all">All Tags</option>
                                {tags.map((tag) => (
                                  <option key={tag._id} value={tag._id}>
                                    {tag.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-700/50">
                        {filteredMeetings.map((meeting) => (
                          <tr
                            key={meeting._id}
                            onClick={() => handleMeetingClick(meeting._id)}
                            className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                            onContextMenu={(e) => handleContextMenu(e, meeting, "meeting")}
                          >
                            <td className="px-6 py-4 text-white font-medium">{meeting.title}</td>
                            <td className="px-6 py-4 text-slate-300">
                              {new Date(meeting.dateTime).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              {meeting.location || (meeting.onlineLink ? "Online" : "N/A")}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${meeting.priority === "Urgent" ? "bg-red-500/20 text-red-300" :
                                meeting.priority === "High" ? "bg-orange-500/20 text-orange-300" :
                                  meeting.priority === "Medium" ? "bg-yellow-500/20 text-yellow-300" :
                                    "bg-green-500/20 text-green-300"
                                }`}>
                                {meeting.priority || "Medium"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              {meeting.team?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              {meeting.tags && meeting.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {meeting.tags.map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded">
                                      {typeof tag === 'object' ? tag.name : tag}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-500 text-xs">No tags</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                                {meeting.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}

            {/* === MANAGE ROLES TAB === */}
            {activeTab === "manage-roles" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Role Management</h2>
                  <button
                    onClick={() => setIsRoleModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> Create New Role
                  </button>
                </div>

                <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-900/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Description</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Type</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {roles.map(role => (
                        <tr key={role._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{role.name}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{role.description || "No description"}</td>
                          <td className="px-6 py-4">
                            {role.isSystem ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                                System
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                                Custom
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!role.isSystem && (
                              <button
                                onClick={() => handleDeleteRole(role._id)}
                                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Delete Role"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Create Role Modal */}
                {isRoleModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Create New Role</h3>
                        <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <form onSubmit={handleCreateRole} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Role Name</label>
                          <input
                            type="text"
                            value={roleForm.name}
                            onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Content Creator"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                          <textarea
                            value={roleForm.description}
                            onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                            placeholder="Role description..."
                          />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setIsRoleModalOpen(false)}
                            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isCreatingRole}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            {isCreatingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Role
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === GENERIC ROLE TABS (For Head, Coordinator, etc - excluding Member which has own tab) === */}
            {roles.some(r => r.slug === activeTab && r.slug !== 'member') && (
              (() => {
                const currentRole = roles.find(r => r.slug === activeTab);
                let roleUsers = filterData(users.filter(u => {
                  const uRole = u.role?.name || u.role;
                  return uRole === currentRole.name;
                }), ["username", "name", "rollNo", "email", "team"]);

                // Apply tag filter for coordinators
                if (activeTab === 'coordinator' && selectedCoordinatorTagFilter !== "all") {
                  roleUsers = roleUsers.filter(u => (u.tag?._id || u.tag) === selectedCoordinatorTagFilter);
                }

                return (
                  <>
                    {roleUsers.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <UsersIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No {currentRole.name}s found</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-slate-900/50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Team / Details</th>
                            {activeTab === 'coordinator' && (
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                <div className="flex items-center gap-2">
                                  <span>Tag</span>
                                  <select
                                    value={selectedCoordinatorTagFilter}
                                    onChange={(e) => setSelectedCoordinatorTagFilter(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="ml-2 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                                  >
                                    <option value="all">All Tags</option>
                                    {tags.map((tag) => (
                                      <option key={tag._id} value={tag._id}>
                                        {tag.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </th>
                            )}
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {roleUsers.map(u => (
                            <tr key={u._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, u, "user")}>
                              <td className="px-6 py-4">
                                <div className="text-white font-medium">{u.name}</div>
                                <div className="text-xs text-slate-400">{u.username}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-300">{u.email}</td>
                              <td className="px-6 py-4 text-slate-300">
                                {u.team && u.team.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {u.team.map((t, i) => (
                                      <span key={i} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                                        {typeof t === 'object' ? t.name : t}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic">No assigned team</span>
                                )}
                              </td>
                              {activeTab === 'coordinator' && (
                                <td className="px-6 py-4">
                                  {u.tag ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-500/20 text-pink-300">
                                      {typeof u.tag === 'object' ? u.tag.name : u.tag}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 text-xs italic">No tag</span>
                                  )}
                                </td>
                              )}
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); router.push(`/edit-member?id=${u._id}`); }}
                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                    title="Edit User"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(u, 'user'); }}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                );
              })()
            )}

            {/* === TASKS TAB === */}
            {activeTab === "tasks" && (
              <>
                {filteredTasks.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No tasks found</p>
                  </div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-slate-900/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">Title</th>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <div className="flex items-center gap-2">
                              <span>Team</span>
                              <select
                                value={selectedTaskTeamFilter}
                                onChange={(e) => setSelectedTaskTeamFilter(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="ml-2 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                              >
                                <option value="all">All Teams</option>
                                {teams.map((team) => (
                                  <option key={team._id} value={team._id}>
                                    {team.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">Status</th>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <div className="flex items-center gap-2">
                              <span>Tag</span>
                              <select
                                value={selectedTaskTagFilter}
                                onChange={(e) => setSelectedTaskTagFilter(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="ml-2 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                              >
                                <option value="all">All Tags</option>
                                {tags.map((tag) => (
                                  <option key={tag._id} value={tag._id}>
                                    {tag.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">Deadline</th>
                          <th className="px-6 py-4 text-left text-sm text-slate-300">Completed Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {filteredTasks.map((task) => (
                          <tr
                            key={task._id}
                            onClick={() => handleTaskClick(task._id)}
                            className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                            onContextMenu={(e) => handleContextMenu(e, task, "task")}
                          >
                            <td className="px-6 py-4 text-white font-medium">{task.title}</td>
                            <td className="px-6 py-4 text-slate-300">{task.team?.name || "N/A"}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                                {task.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {task.tags && task.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {task.tags.map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded">
                                      {typeof tag === 'object' ? tag.name : tag}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-500 text-xs">No tags</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}

            {/* === TAGS TAB === */}
            {activeTab === "tags" && (
              <div className="p-6">
                {/* Create Tag Section */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-pink-500" /> Manage Meeting Tags</h3>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Enter new tag name..."
                      className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 w-full max-w-md focus:outline-none focus:border-pink-500"
                    />
                    <button
                      onClick={handleAddTag}
                      disabled={isAddingTag}
                      className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      {isAddingTag ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Tags List */}
                {filteredTags.length === 0 ? (
                  <div className="text-center py-8"><Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No tags found.</p></div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredTags.map((tag) => (
                      <div key={tag._id} className="group flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg hover:border-pink-500/50 transition-all">
                        <span className="text-white font-medium truncate mr-2" title={tag.name}>{tag.name}</span>
                        <button
                          onClick={() => handleDeleteClick(tag, "tag")}
                          className="text-slate-500 hover:text-red-400 p-1 rounded-full hover:bg-slate-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main >

      {contextMenu && (
        <div className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-2 z-50" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(e) => e.stopPropagation()}>
          {contextMenu.type === "member" && (
            <button
              onClick={() => {
                router.push(`/edit-member?id=${contextMenu.item._id}`);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-blue-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Edit Member
            </button>
          )}
          <button onClick={() => handleDeleteClick()} className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete {contextMenu.type}</button>
        </div>
      )
      }

      {/* Meeting Detail Modal */}
      {
        isMeetingDetailModalOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsMeetingDetailModalOpen(false);
              }
            }}
          >
            <div
              className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Meeting Details</h2>
                    <p className="text-sm text-slate-400">View meeting information and attendance</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMeetingDetailModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto flex-1 p-6">
                {fetchingMeetingDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                    <span className="ml-3 text-slate-400">Loading meeting details...</span>
                  </div>
                ) : currentMeetingDetails ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        Meeting Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Title</p>
                          <p className="text-white font-semibold">{currentMeetingDetails.title || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Status</p>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                            {currentMeetingDetails.status || "N/A"}
                          </span>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Start Time
                          </p>
                          <p className="text-white">
                            {currentMeetingDetails.dateTime
                              ? new Date(currentMeetingDetails.dateTime).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        {currentMeetingDetails.endTime && (
                          <div>
                            <p className="text-slate-400 text-sm mb-1 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              End Time
                            </p>
                            <p className="text-white">
                              {new Date(currentMeetingDetails.endTime).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-400 text-sm mb-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Location
                          </p>
                          <p className="text-white">{currentMeetingDetails.location || "N/A"}</p>
                        </div>
                        {currentMeetingDetails.onlineLink && (
                          <div>
                            <p className="text-slate-400 text-sm mb-1">Online Link</p>
                            <a
                              href={currentMeetingDetails.onlineLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 underline break-all"
                            >
                              {currentMeetingDetails.onlineLink}
                            </a>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Priority</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentMeetingDetails.priority === "Urgent" ? "bg-red-500/20 text-red-300" :
                            currentMeetingDetails.priority === "High" ? "bg-orange-500/20 text-orange-300" :
                              currentMeetingDetails.priority === "Medium" ? "bg-yellow-500/20 text-yellow-300" :
                                "bg-green-500/20 text-green-300"
                            }`}>
                            {currentMeetingDetails.priority || "Medium"}
                          </span>
                        </div>
                      </div>
                      {currentMeetingDetails.description && (
                        <div className="mt-4">
                          <p className="text-slate-400 text-sm mb-1">Description</p>
                          <p className="text-white">{currentMeetingDetails.description}</p>
                        </div>
                      )}
                      {currentMeetingDetails.agenda && (
                        <div className="mt-4">
                          <p className="text-slate-400 text-sm mb-1">Agenda</p>
                          <p className="text-white whitespace-pre-wrap">{currentMeetingDetails.agenda}</p>
                        </div>
                      )}
                      {currentMeetingDetails.tags && currentMeetingDetails.tags.length > 0 && (
                        <div className="mt-4">
                          <p className="text-slate-400 text-sm mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {currentMeetingDetails.tags.map((tag, idx) => (
                              <span key={idx} className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs">
                                {tag.name || tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Attendance */}
                    {currentMeetingDetails.attendance && (
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <CheckSquare className="w-5 h-5 text-green-400" />
                          Attendance - Participants List
                        </h3>
                        <div className="space-y-6">
                          {currentMeetingDetails.attendance.present && currentMeetingDetails.attendance.present.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <p className="text-white font-semibold">
                                  Present ({currentMeetingDetails.attendance.present.length})
                                </p>
                              </div>
                              <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
                                <ul className="space-y-2">
                                  {currentMeetingDetails.attendance.present.map((member, idx) => {
                                    const memberData = member.member || member;
                                    const userName = memberData.name || memberData.username || memberData.email || 'Unknown';
                                    const userEmail = memberData.email || '';
                                    const userRollNo = memberData.rollNo ? ` (${memberData.rollNo})` : '';
                                    const userId = memberData._id || idx;

                                    return (
                                      <li key={userId} className="flex items-center gap-3 py-2 border-b border-slate-700/30 last:border-0">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <div className="flex-1">
                                          <p className="text-white font-medium">
                                            {userName}{userRollNo}
                                          </p>
                                          {userEmail && userName !== userEmail && (
                                            <p className="text-slate-400 text-xs">{userEmail}</p>
                                          )}
                                          {memberData.year && memberData.division && (
                                            <p className="text-slate-500 text-xs">{memberData.year} {memberData.division}</p>
                                          )}
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>
                          )}
                          {(!currentMeetingDetails.attendance.present || currentMeetingDetails.attendance.present.length === 0) &&
                            (!currentMeetingDetails.attendance.absent || currentMeetingDetails.attendance.absent.length === 0) && (
                              <div className="text-center py-8">
                                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm italic">No attendance data available</p>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                    {/* Debug Info */}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-12 h-12 text-slate-600 mb-3" />
                    <p className="text-slate-400">Failed to load meeting details</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-700/50 bg-slate-900/50">
                <button
                  onClick={() => setIsMeetingDetailModalOpen(false)}
                  className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Task Detail Modal */}
      {
        isTaskDetailModalOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsTaskDetailModalOpen(false);
              }
            }}
          >
            <div
              className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Task Details</h2>
                    <p className="text-sm text-slate-400">View task information and assigned members</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTaskDetailModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto flex-1 p-6">
                {fetchingTaskDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <span className="ml-3 text-slate-400">Loading task details...</span>
                  </div>
                ) : currentTaskDetails ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-orange-400" />
                        Task Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Title</p>
                          <p className="text-white font-semibold">{currentTaskDetails.title || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Status</p>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                            {currentTaskDetails.status || "N/A"}
                          </span>
                        </div>
                        {currentTaskDetails.team && (
                          <div>
                            <p className="text-slate-400 text-sm mb-1">Team</p>
                            <p className="text-white">{typeof currentTaskDetails.team === 'object' ? currentTaskDetails.team.name : currentTaskDetails.team}</p>
                          </div>
                        )}
                        {currentTaskDetails.deadline && (
                          <div>
                            <p className="text-slate-400 text-sm mb-1 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Deadline
                            </p>
                            <p className="text-white">
                              {new Date(currentTaskDetails.deadline).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {currentTaskDetails.priority && (
                          <div>
                            <p className="text-slate-400 text-sm mb-1">Priority</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentTaskDetails.priority === "Urgent" ? "bg-red-500/20 text-red-300" :
                              currentTaskDetails.priority === "High" ? "bg-orange-500/20 text-orange-300" :
                                currentTaskDetails.priority === "Medium" ? "bg-yellow-500/20 text-yellow-300" :
                                  "bg-green-500/20 text-green-300"
                              }`}>
                              {currentTaskDetails.priority}
                            </span>
                          </div>
                        )}
                      </div>
                      {currentTaskDetails.description && (
                        <div className="mt-4">
                          <p className="text-slate-400 text-sm mb-1">Description</p>
                          <p className="text-white whitespace-pre-wrap">{currentTaskDetails.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Subtasks */}
                    {currentTaskDetails.subtasks && currentTaskDetails.subtasks.length > 0 && (
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-orange-400" />
                          Subtasks ({currentTaskDetails.subtasks.length})
                        </h3>
                        <div className="space-y-4">
                          {currentTaskDetails.subtasks.map((subtask, idx) => (
                            <div key={subtask._id || idx} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <p className="text-white font-semibold mb-1">{subtask.title || "Untitled Subtask"}</p>
                                  {subtask.description && (
                                    <p className="text-slate-400 text-sm">{subtask.description}</p>
                                  )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${subtask.status === "Completed" ? "bg-green-500/20 text-green-300" :
                                  subtask.status === "In Progress" ? "bg-yellow-500/20 text-yellow-300" :
                                    "bg-slate-500/20 text-slate-300"
                                  }`}>
                                  {subtask.status || "Pending"}
                                </span>
                              </div>

                              {/* Assigned Members */}
                              <div className="mt-3 pt-3 border-t border-slate-700/50">
                                <p className="text-slate-300 text-sm mb-3 flex items-center gap-2 font-semibold">
                                  <UsersIcon className="w-4 h-4 text-orange-400" />
                                  Assigned To
                                  {(subtask.assignedTo || subtask.assignedMembers) && (subtask.assignedTo || subtask.assignedMembers).length > 0 && (
                                    <span className="text-slate-400 font-normal">({(subtask.assignedTo || subtask.assignedMembers).length} member{(subtask.assignedTo || subtask.assignedMembers).length !== 1 ? 's' : ''})</span>
                                  )}
                                </p>
                                {(subtask.assignedTo || subtask.assignedMembers) && (subtask.assignedTo || subtask.assignedMembers).length > 0 ? (
                                  <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
                                    <ul className="space-y-2">
                                      {(subtask.assignedTo || subtask.assignedMembers || []).map((member, memberIdx) => {
                                        const memberData = member.member || member;
                                        const memberName = memberData.name || memberData.username || memberData.email || 'Unknown';
                                        const memberEmail = memberData.email || '';
                                        const memberRollNo = memberData.rollNo ? ` (${memberData.rollNo})` : '';
                                        const memberId = memberData._id || memberIdx;

                                        return (
                                          <li key={memberId} className="flex items-center gap-3 py-2 border-b border-slate-700/30 last:border-0">
                                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                            <div className="flex-1">
                                              <p className="text-white text-sm font-medium">
                                                {memberName}{memberRollNo}
                                              </p>
                                              {memberEmail && memberName !== memberEmail && (
                                                <p className="text-slate-400 text-xs">{memberEmail}</p>
                                              )}
                                              {memberData.year && memberData.division && (
                                                <p className="text-slate-500 text-xs">{memberData.year} {memberData.division}</p>
                                              )}
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                ) : (
                                  <div className="bg-slate-900/30 border border-slate-700/20 rounded-lg p-3 text-center">
                                    <p className="text-slate-500 text-sm italic">No members assigned to this subtask</p>
                                  </div>
                                )}
                              </div>

                              {subtask.deadline && (
                                <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Deadline: {new Date(subtask.deadline).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!currentTaskDetails.subtasks || currentTaskDetails.subtasks.length === 0) && (
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 text-center">
                        <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No subtasks assigned to this task</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-12 h-12 text-slate-600 mb-3" />
                    <p className="text-slate-400">Failed to load task details</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-700/50 bg-slate-900/50">
                <button
                  onClick={() => setIsTaskDetailModalOpen(false)}
                  className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        deleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center"><Trash2 className="w-6 h-6 text-red-400" /></div>
                <div><h3 className="text-xl font-bold text-white">Delete {deleteModal.type.charAt(0).toUpperCase() + deleteModal.type.slice(1)}</h3><p className="text-slate-400 text-sm">This action cannot be undone</p></div>
              </div>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
                <p className="text-slate-300 text-sm mb-2">You are about to delete:</p>
                <p className="text-white font-semibold">{deleteModal.item.username || deleteModal.item.title || deleteModal.item.email || deleteModal.item.name}</p>
              </div>
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
        )
      }
    </div >
  );
}
