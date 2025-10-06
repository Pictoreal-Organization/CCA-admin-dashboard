"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { Users, UserPlus, Shield, Mail, Key, LogOut, Loader2, UserCircle, Calendar, CheckSquare, UsersRound, UserCog, Clock, MapPin } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [heads, setHeads] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'members', 'heads', 'meetings', 'tasks'

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) router.push('/login');

    const fetchAllData = async () => {
      try {
        const [usersRes, membersRes, headsRes, meetingsRes, tasksRes] = await Promise.all([
          api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/admin/members', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/admin/heads', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/admin/meetings', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/admin/tasks', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setUsers(usersRes.data);
        setMembers(membersRes.data);
        setHeads(headsRes.data);
        setMeetings(meetingsRes.data);
        setTasks(tasksRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    };

    fetchAllData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/login');
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
                <p className="text-sm text-slate-400">Manage users and permissions</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
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
              onClick={() => router.push('/create-member')}
              className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-white font-medium">Add Member</span>
            </button>

            <button
              onClick={() => router.push('/create-head')}
              className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-white font-medium">Create Head</span>
            </button>

            <button
              onClick={() => router.push('/create-meeting')}
              className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-white font-medium">Create Meeting</span>
            </button>

            <button
              onClick={() => router.push('/create-task')}
              className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:border-green-500/40 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckSquare className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-white font-medium">Create Task</span>
            </button>
          </div>
        </div>

        {/* Tabbed View Section */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Tab Headers */}
          <div className="flex gap-2 px-6 py-4 border-b border-slate-700/50 overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              All Users
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'members'
                  ? 'bg-green-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UsersRound className="w-4 h-4" />
              All Members
            </button>
            <button
              onClick={() => setActiveTab('heads')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'heads'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCog className="w-4 h-4" />
              All Heads
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'meetings'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              All Meetings
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              All Tasks
            </button>
          </div>

          {/* Tab Content */}
          <div className="overflow-x-auto">
            {/* All Users Tab */}
            {activeTab === 'users' && (
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4" />
                        Username
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Role
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Division
                    </th>
                    {/* <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Initial Password
                      </div>
                    </th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map(u => (
                    <tr key={u.email} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{u.username}</td>
                      <td className="px-6 py-4 text-slate-300">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          u.role === 'Admin' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                            : u.role === 'Head'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {u.year && u.division ? `${u.year} ${u.division}` : 'N/A'}
                      </td>
                      {/* <td className="px-6 py-4">
                        <code className="px-3 py-1 bg-slate-900 text-slate-300 rounded-lg text-sm font-mono border border-slate-700">
                          {u.password}
                        </code>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* All Members Tab */}
            {activeTab === 'members' && (
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Teams</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Division</th>
                    {/* <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Password</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {members.map(m => (
                    <tr key={m._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{m.username}</td>
                      <td className="px-6 py-4 text-slate-300">{m.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {m.team?.map((t, i) => (
                            <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                              {t.name || t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {m.year && m.division ? `${m.year} ${m.division}` : 'N/A'}
                      </td>
                      {/* <td className="px-6 py-4">
                        <code className="px-3 py-1 bg-slate-900 text-slate-300 rounded-lg text-sm font-mono border border-slate-700">
                          {m.initialPassword}
                        </code>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* All Heads Tab */}
            {activeTab === 'heads' && (
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
                  {heads.map(h => (
                    <tr key={h._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{h.username}</td>
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
                      <td className="px-6 py-4">
                        <code className="px-3 py-1 bg-slate-900 text-slate-300 rounded-lg text-sm font-mono border border-slate-700">
                          {h.initialPassword}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* All Meetings Tab */}
            {activeTab === 'meetings' && (
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {meetings.map(meeting => (
                    <tr key={meeting._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{meeting.title}</td>
                      <td className="px-6 py-4 text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(meeting.dateTime).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          meeting.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          meeting.status === 'ongoing' ? 'bg-blue-500/20 text-blue-300' :
                          meeting.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {meeting.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          meeting.priority === 'Urgent' ? 'bg-red-500/20 text-red-300' :
                          meeting.priority === 'High' ? 'bg-orange-500/20 text-orange-300' :
                          meeting.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {meeting.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* All Tasks Tab */}
            {activeTab === 'tasks' && (
            <table className="w-full">
                <thead className="bg-slate-900/50">
                <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Team</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Deadline</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Subtasks</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                {tasks.map(task => (
                    <tr key={task._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{task.title}</td>
                    <td className="px-6 py-4 text-slate-300">{task.team?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                        task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-yellow-500/20 text-yellow-300'
                        }`}>
                        {task.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                        {task.subtasks?.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                            {task.subtasks.map(sub => (
                            <li key={sub._id}>
                                <span className="font-medium text-white">{sub.title}</span> — 
                                <span className="text-slate-300">
                                    Assigned to: {sub.assignedTo?.length > 0 
                                    ? sub.assignedTo.map(u => u.username).join(', ') 
                                    : 'N/A'}
                                </span>, 
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                sub.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                                sub.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-yellow-500/20 text-yellow-300'
                                }`}>
                                {sub.status}
                                </span>
                            </li>
                            ))}
                        </ul>
                        ) : (
                        <span>No subtasks</span>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}

          </div>

          {/* Empty State */}
          {((activeTab === 'users' && users.length === 0) ||
            (activeTab === 'members' && members.length === 0) ||
            (activeTab === 'heads' && heads.length === 0) ||
            (activeTab === 'meetings' && meetings.length === 0) ||
            (activeTab === 'tasks' && tasks.length === 0)) && (
            <div className="px-6 py-12 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No data found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}