import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Building2, Plus, Edit, Trash2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { TeamMember } from '../../types';

interface Department {
  name: string;
  count: number;
}

export const AdminDepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const { hasPermission } = useAuth();
  const { confirm, confirmState, closeConfirm } = useConfirm();
  const { success, error } = useToast();

  const fetchData = async () => {
    try {
      const res = await api.departments.getAll();
      if (res.departments) {
        setDepartments(res.departments);
      }
      const teamRes = await api.team.getAll();
      if (teamRes.team) {
        setTeamMembers(teamRes.team);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: string) => {
    setEditingDept(dept);
    setFormData({ name: dept });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingDept) {
        // Rename department
        await api.departments.update(editingDept, formData.name);
        success('Department renamed successfully!');
      } else {
        // Create new department
        await api.departments.create(formData.name);
        success('Department added successfully!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to save department.');
    }
  };

  const handleDelete = async (dept: string) => {
    if (!await confirm(`Delete department "${dept}"?`, { title: 'Delete Department', isDangerous: true })) return;
    
    try {
      await api.departments.delete(dept);
      success('Department removed.');
      fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to delete department.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Departments</span>
          </h1>
          <p className="text-xs text-slate-500">Manage departments and view team members. Departments are also created when assigning team members.</p>
        </div>
        {hasPermission('team.manage') && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {departments.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No departments yet. Add team members to create departments.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Departments Overview Cards */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Department Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map(dept => (
                <div
                  key={dept.name}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{dept.name}</h3>
                      <div className="flex items-center gap-2 mt-3">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {dept.count} {dept.count === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    </div>

                    {hasPermission('team.manage') && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(dept.name)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.name)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members by Department */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Team Members</h2>
            <div className="space-y-4">
              {departments.map(dept => {
                const members = teamMembers.filter(m => m.department === dept.name);
                const isExpanded = expandedDept === dept.name;
                
                return (
                  <div key={dept.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {/* Department Header */}
                    <button
                      onClick={() => setExpandedDept(isExpanded ? null : dept.name)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{members.length} members</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    {/* Members List */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                        {members.length === 0 ? (
                          <div className="px-6 py-4 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">No members in this department</p>
                          </div>
                        ) : (
                          members.map(member => (
                            <div key={member.id} className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                onError={(e) => { e.currentTarget.src = '/avatars/avatar_default.jpg'; }}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{member.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                              </div>
                              {member.email && (
                                <a
                                  href={`mailto:${member.email}`}
                                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  {member.email}
                                </a>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? `Rename Department: ${editingDept}` : 'Add New Department'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., System Software, DevOps"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            {editingDept ? 'Rename Department' : 'Add Department'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        isDangerous={confirmState.isDangerous}
        confirmText={confirmState.isDangerous ? 'Delete' : 'Confirm'}
        cancelText="Cancel"
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
    </div>
  );
};
