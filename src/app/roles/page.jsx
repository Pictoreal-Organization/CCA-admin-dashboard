"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import {
  Shield,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await api.get("/roles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(res.data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (role) => {
    if (role.isSystem) {
      setMsg("Cannot delete system roles.");
      setMsgType("error");
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    setDeleteModal(role);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;

    try {
      const token = localStorage.getItem("adminToken");
      await api.delete(`/roles/${deleteModal._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRoles(roles.filter(r => r._id !== deleteModal._id));
      setMsg("Role deleted successfully");
      setMsgType("success");
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to delete role");
      setMsgType("error");
    } finally {
      setDeleteModal(null);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Role Management</h1>
                </div>
            </div>
            
            <button
                onClick={() => router.push("/roles/create")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
            >
                <Plus className="w-5 h-5" />
                Create Role
            </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {msg && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
                msgType === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
                {msgType === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {msg}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => (
                <div key={role._id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 group hover:border-blue-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-700/50 text-white font-bold text-xl">
                            {role.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!role.isSystem && (
                                <button 
                                    onClick={() => handleDeleteClick(role)}
                                    className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                    title="Delete Role"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <button 
                                onClick={() => router.push(`/roles/edit/${role._id}`)}
                                className="p-2 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                                title="Edit Role"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{role.name}</h3>
                    <p className="text-slate-400 text-sm mb-4 min-h-[40px]">{role.description || "No description provided."}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        {role.permissions.map((perm, i) => (
                           // Show only first 3 permissions to avoid clutter
                           i < 3 && (
                            <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-300">
                                {perm.replace('_', ' ')}
                            </span>
                           )
                        ))}
                        {role.permissions.length > 3 && (
                            <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-500">
                                +{role.permissions.length - 3} more
                            </span>
                        )}
                    </div>

                    {role.isSystem && (
                        <div className="flex items-center gap-2 text-xs text-purple-400 font-medium mt-auto pt-4 border-t border-slate-700/50">
                            <Shield className="w-3 h-3" /> System Role
                        </div>
                    )}
                </div>
            ))}
        </div>
      </main>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-2">Delete Role?</h3>
                <p className="text-slate-400 mb-6">
                    Are you sure you want to delete <strong>{deleteModal.name}</strong>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setDeleteModal(null)}
                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20"
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
