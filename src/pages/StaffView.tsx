import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Search,
  Lock,
  X,
  RefreshCw,
  Info
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Add Staff Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<Role>('ROLE_CASHIER');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<User[]>('/auth/users');
      setStaffList(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch store personnel list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);
    try {
      await api.post('/auth/register', {
        fullName: newFullName.trim(),
        username: newUsername.trim(),
        password: newPassword,
        role: newRole,
      });

      setSuccessMessage(`Staff member "${newFullName}" onboarded successfully.`);
      setIsAddModalOpen(false);
      setNewFullName('');
      setNewUsername('');
      setNewPassword('');
      setNewRole('ROLE_CASHIER');
      fetchStaff();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create staff account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deletingUser) return;
    if (deletingUser.id === currentUser?.id || deletingUser.username === currentUser?.username) {
      setError('Action rejected: You cannot delete or deactivate your own administrator account.');
      setDeletingUser(null);
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const res = await api.delete(`/auth/users/${deletingUser.id}`);
      setSuccessMessage(res.data?.message || `Staff account for "${deletingUser.fullName}" updated.`);
      setDeletingUser(null);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete staff member.');
      setDeletingUser(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id || targetUser.username === currentUser?.username) {
      setError('You cannot deactivate your own administrator account.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      await api.patch(`/auth/users/${targetUser.id}/toggle-status`);
      setSuccessMessage(`Account status for "${targetUser.fullName}" updated.`);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchTerm.toLowerCase();
    return s.fullName.toLowerCase().includes(q) || s.username.toLowerCase().includes(q);
  });

  const totalStaff = staffList.length;
  const totalCashiers = staffList.filter((s) => s.role === 'ROLE_CASHIER').length;
  const totalAdmins = staffList.filter((s) => s.role === 'ROLE_ADMIN').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Staff & Access Management</h1>
              <p className="text-sm text-slate-500">
                Admin-controlled directory of cashiers and store operations managers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStaff}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setModalError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-500 shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Notice: </span>
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Success: </span>
            {successMessage}
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Store Staff</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalStaff}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Database authorized users</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Cashier Counter Staff</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{totalCashiers}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Assigned to POS Terminal</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Store Operations Managers</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{totalAdmins}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Full administrative rights</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Staff Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search staff by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredStaff.length}</span> staff member(s)
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">Staff Member</th>
                <th scope="col" className="px-6 py-3.5">Role</th>
                <th scope="col" className="px-6 py-3.5">Account Status</th>
                <th scope="col" className="px-6 py-3.5">Onboarded</th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading personnel records...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No staff members match "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const isCurrentSelf = staff.id === currentUser?.id || staff.username === currentUser?.username;
                  const isActive = staff.active ?? true;

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Username */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                            {staff.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center space-x-2">
                              <span>{staff.fullName}</span>
                              {isCurrentSelf && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                                  You (Active Admin)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">@{staff.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {staff.role === 'ROLE_ADMIN' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                            <span>Store Manager</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                            <span>Cashier (POS Staff)</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                            ● Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            ○ Deactivated
                          </span>
                        )}
                      </td>

                      {/* Onboarded Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'System Seeded'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        {isCurrentSelf ? (
                          <span
                            title="Administrators cannot delete or disable their own account."
                            className="inline-flex items-center space-x-1 text-slate-400 italic bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-[11px] cursor-not-allowed"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Cannot Delete Self</span>
                          </span>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleToggleStatus(staff)}
                              disabled={actionLoading}
                              title={isActive ? 'Deactivate account' : 'Reactivate account'}
                              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                isActive
                                  ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setDeletingUser(staff)}
                              disabled={actionLoading}
                              title="Delete or Deactivate Staff"
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Add New Staff Member</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. ramesh_cashier"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  System Role *
                </label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ROLE_CASHIER">Cashier (POS Billing & Receipts)</option>
                  <option value="ROLE_ADMIN">Store Manager (Admin with full rights)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-3 text-red-600 mb-3">
                <div className="p-2.5 bg-red-100 rounded-xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Remove Staff Member</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to remove <strong className="text-slate-900">{deletingUser.fullName}</strong> (@{deletingUser.username})?
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start space-x-2">
                <Info className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                <span>
                  If this staff member has historical orders or waste logs, their account will be deactivated to preserve business records and audits.
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={actionLoading}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStaff}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
