"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import {
  Shield,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Categorized Permissions for easier UI
const PERMISSION_GROUPS = {
  Meetings: [
    "MEETING_CREATE", "MEETING_UPDATE", "MEETING_DELETE", "MEETING_VIEW"
  ],
  Tasks: [
    "TASK_CREATE", "TASK_UPDATE", "TASK_DELETE", "TASK_VIEW"
  ],
  Users: [
    "USER_MANAGE", "USER_VIEW"
  ],
  Roles: [
    "ROLE_MANAGE", "ROLE_VIEW"
  ],
  Attendance: [
    "ATTENDANCE_MARK", "ATTENDANCE_VIEW"
  ]
};

export default function CreateRolePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const handlePermissionToggle = (perm) => {
    setPermissions(prev => 
      prev.includes(perm) 
        ? prev.filter(p => p !== perm) 
        : [...prev, perm]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");

    try {
      const token = localStorage.getItem("adminToken");
      await api.post("/roles", {
        name,
        description,
        permissions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMsg("Role created successfully!");
      setMsgType("success");
      setTimeout(() => router.push("/roles"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to create role");
      setMsgType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            <button 
              onClick={() => router.push("/roles")}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white">Create New Role</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" /> Role Details
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Role Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Event Manager"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                            placeholder="Briefly describe what this role does..."
                        />
                    </div>
                </div>
            </div>

            {/* Permissions */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Permissions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
                        <div key={group}>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">{group}</h3>
                            <div className="space-y-2">
                                {perms.map(perm => (
                                    <label key={perm} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                            permissions.includes(perm) ? 'bg-blue-600 border-blue-600' : 'border-slate-500'
                                        }`}>
                                            {permissions.includes(perm) && <CheckCircle className="w-4 h-4 text-white" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden"
                                            checked={permissions.includes(perm)}
                                            onChange={() => handlePermissionToggle(perm)}
                                        />
                                        <span className="text-slate-300 text-sm">{perm.replace(/_/g, ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                {msg && (
                    <div className={`text-sm font-medium ${msgType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {msg}
                    </div>
                )}
                <div className="flex gap-4 ml-auto">
                    <button 
                        type="button" 
                        onClick={() => router.push("/roles")}
                        className="px-6 py-3 text-slate-400 hover:text-white transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Create Role
                    </button>
                </div>
            </div>
        </form>
      </main>
    </div>
  );
}
