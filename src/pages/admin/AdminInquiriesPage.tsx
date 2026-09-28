import React, { useEffect, useState, useMemo } from 'react';
import { ContactInquiry, InquiryStatus } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  MessageSquare,
  Mail,
  Phone,
  Building2,
  Calendar,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Eye,
  Send,
  Search,
  Plus,
  Download,
  Edit3,
  FileText,
  Tag,
  CheckSquare,
  Square,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Save,
  Copy,
  Check
} from 'lucide-react';

export const AdminInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'view' | 'edit' | 'notes'>('view');
  const { hasPermission } = useAuth();
  const { confirm, confirmState, closeConfirm } = useConfirm();
  
  // Create / Manual Lead Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newInquiryForm, setNewInquiryForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    subject_category: 'AI & Cloud Infrastructure',
    message: '',
    status: 'New' as InquiryStatus,
    notes: ''
  });

  // Edit Form State (for selected inquiry)
  const [editForm, setEditForm] = useState<Partial<ContactInquiry>>({});
  const [internalNoteDraft, setInternalNoteDraft] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const { success, error } = useToast();

  const fetchInquiries = () => {
    setIsLoading(true);
    api.inquiries.getAll(statusFilter === 'all' ? undefined : statusFilter).then(res => {
      if (res.inquiries) setInquiries(res.inquiries);
    }).catch(err => {
      console.error(err);
      error('Failed to load contact messages.');
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  // Open modal and prep form
  const handleOpenDetail = (inq: ContactInquiry, tab: 'view' | 'edit' | 'notes' = 'view') => {
    // Check permission for edit and notes tabs
    if ((tab === 'edit' || tab === 'notes') && !hasPermission('inquiries.manage')) {
      error('You do not have permission to edit inquiries.');
      return;
    }
    setSelectedInquiry(inq);
    setActiveModalTab(tab);
    setEditForm({
      full_name: inq.full_name,
      email: inq.email,
      phone: inq.phone || '',
      company: inq.company || '',
      subject_category: inq.subject_category,
      message: inq.message,
      status: inq.status,
      notes: inq.notes || ''
    });
    setInternalNoteDraft(inq.notes || '');
  };

  // Status Change
  const handleStatusChange = async (id: number, newStatus: InquiryStatus) => {
    try {
      const res = await api.inquiries.updateStatus(id, newStatus);
      if (res.success) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
          setEditForm(prev => ({ ...prev, status: newStatus }));
        }
        success(`Inquiry marked as ${newStatus}`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to update status.');
    }
  };

  // Save Full Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setIsSavingEdit(true);
    try {
      const res = await api.inquiries.update(selectedInquiry.id, editForm);
      if (res.success && res.inquiry) {
        setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? res.inquiry : i));
        setSelectedInquiry(res.inquiry);
        success('Inquiry details updated successfully.');
        setActiveModalTab('view');
      } else {
        error('Failed to update inquiry.');
      }
    } catch (err: any) {
      error(err.message || 'Error updating inquiry.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Save Internal Notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsSavingNote(true);
    try {
      const res = await api.inquiries.updateNotes(selectedInquiry.id, internalNoteDraft);
      if (res.success && res.inquiry) {
        setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? { ...i, notes: internalNoteDraft } : i));
        setSelectedInquiry(prev => prev ? { ...prev, notes: internalNoteDraft } : null);
        success('Internal staff notes saved.');
      } else {
        error('Failed to save internal notes.');
      }
    } catch (err: any) {
      error(err.message || 'Error saving notes.');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Create Manual Lead
  const handleCreateManualInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('inquiries.manage')) {
      error('You do not have permission to create inquiries.');
      return;
    }
    if (!newInquiryForm.full_name || !newInquiryForm.email || !newInquiryForm.message) {
      error('Name, Email and Message are required.');
      return;
    }
    try {
      const res = await api.inquiries.create(newInquiryForm);
      if (res.success) {
        success('New lead logged into Inbox successfully.');
        setCreateModalOpen(false);
        setNewInquiryForm({
          full_name: '',
          email: '',
          phone: '',
          company: '',
          subject_category: 'AI & Cloud Infrastructure',
          message: '',
          status: 'New',
          notes: ''
        });
        fetchInquiries();
      } else {
        error(res.message || 'Failed to create inquiry.');
      }
    } catch (err: any) {
      error(err.message || 'Error creating lead.');
    }
  };

  // Single Delete
  const handleDelete = async (id: number) => {
    if (!await confirm('Delete this inquiry message permanently?', { title: 'Delete Inquiry', isDangerous: true })) return;
    try {
      await api.inquiries.delete(id);
      setInquiries(prev => prev.filter(i => i.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      setSelectedIds(prev => prev.filter(i => i !== id));
      success('Inquiry deleted.');
    } catch (err: any) {
      error(err.message || 'Failed to delete.');
    }
  };

  // Bulk Operations
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredInquiries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInquiries.map(i => i.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkStatus = async (newStatus: InquiryStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => api.inquiries.updateStatus(id, newStatus)));
      setInquiries(prev => prev.map(i => selectedIds.includes(i.id) ? { ...i, status: newStatus } : i));
      success(`Marked ${selectedIds.length} inquiries as ${newStatus}`);
      setSelectedIds([]);
    } catch (err: any) {
      error('Failed to perform bulk update.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!await confirm(`Permanently delete ${selectedIds.length} selected inquiries?`, { title: 'Delete Inquiries', isDangerous: true })) return;
    try {
      await Promise.all(selectedIds.map(id => api.inquiries.delete(id)));
      setInquiries(prev => prev.filter(i => !selectedIds.includes(i.id)));
      if (selectedInquiry && selectedIds.includes(selectedInquiry.id)) {
        setSelectedInquiry(null);
      }
      success(`Deleted ${selectedIds.length} inquiries.`);
      setSelectedIds([]);
    } catch (err: any) {
      error('Failed to bulk delete inquiries.');
    }
  };

  // Copy Email to clipboard
  const handleCopyEmail = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
    success('Email copied to clipboard!');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (inquiries.length === 0) {
      error('No inquiries to export.');
      return;
    }
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Company', 'Subject Specialization', 'Status', 'Date', 'Internal Notes', 'Message'];
    const rows = inquiries.map(i => [
      i.id,
      `"${(i.full_name || '').replace(/"/g, '""')}"`,
      `"${(i.email || '').replace(/"/g, '""')}"`,
      `"${(i.phone || '').replace(/"/g, '""')}"`,
      `"${(i.company || '').replace(/"/g, '""')}"`,
      `"${(i.subject_category || '').replace(/"/g, '""')}"`,
      `"${i.status}"`,
      `"${new Date(i.created_at).toISOString()}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`,
      `"${(i.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contact_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Inquiries exported to CSV.');
  };

  // Filtered inquiries list
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(i => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        i.full_name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.company && i.company.toLowerCase().includes(q)) ||
        (i.phone && i.phone.toLowerCase().includes(q)) ||
        i.subject_category.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q) ||
        (i.notes && i.notes.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || i.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: inquiries.length,
      new: inquiries.filter(i => i.status === 'New').length,
      inProgress: inquiries.filter(i => i.status === 'In Progress').length,
      resolved: inquiries.filter(i => i.status === 'Resolved').length,
      archived: inquiries.filter(i => i.status === 'Archived').length
    };
  }, [inquiries]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Contact Inquiries Inbox</span>
          </h1>
          <p className="text-xs text-slate-500">
            Manage, review, edit, and respond to incoming prospective client inquiries & consultation requests.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export CSV</span>
          </button>

          {hasPermission('inquiries.manage') && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Lead / Inquiry</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500/50 ring-2 ring-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Inquiries</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">{stats.total}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">All incoming contact leads</span>
        </div>

        <div
          onClick={() => setStatusFilter('New')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'New'
              ? 'bg-cyan-50/60 dark:bg-cyan-950/40 border-cyan-500/50 ring-2 ring-cyan-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">New / Unread</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-2 font-mono">{stats.new}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting initial review</span>
        </div>

        <div
          onClick={() => setStatusFilter('In Progress')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'In Progress'
              ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-500/50 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">In Progress</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2 font-mono">{stats.inProgress}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Under technical follow-up</span>
        </div>

        <div
          onClick={() => setStatusFilter('Resolved')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'Resolved'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500/50 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">{stats.resolved}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Closed & answered consultations</span>
        </div>
      </div>

      {/* Search, Filter & Bulk Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, company, email, or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl no-scrollbar self-start md:self-auto">
          {['all', 'New', 'In Progress', 'Resolved', 'Archived'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Inquiries' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-3 px-4 rounded-2xl bg-indigo-600 text-white flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckSquare className="w-4 h-4" />
            <span>{selectedIds.length} {selectedIds.length === 1 ? 'inquiry' : 'inquiries'} selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus('In Progress')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              Mark In Progress
            </button>
            <button
              onClick={() => handleBulkStatus('Resolved')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold transition-colors"
            >
              Mark Resolved
            </button>
            <button
              onClick={() => handleBulkStatus('Archived')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              Archive
            </button>
            {hasPermission('inquiries.delete') && (
              <button
                onClick={handleBulkDelete}
                className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Inquiries Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 w-10">
                  <button onClick={handleToggleSelectAll} className="text-slate-400 hover:text-indigo-600">
                    {selectedIds.length > 0 && selectedIds.length === filteredInquiries.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Sender & Topic</th>
                <th className="py-3.5 px-4">Company & Phone</th>
                <th className="py-3.5 px-4">Received</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                      <span>Loading inquiries...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInquiries.length > 0 ? (
                filteredInquiries.map(inq => {
                  const isSelected = selectedIds.includes(inq.id);
                  return (
                    <tr
                      key={inq.id}
                      onClick={() => handleOpenDetail(inq, 'view')}
                      className={`hover:bg-slate-50/75 dark:hover:bg-slate-850/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleSelect(inq.id)}
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Sender & Topic */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white block">
                            {inq.full_name}
                          </span>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold block mt-0.5">
                            {inq.subject_category}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <span>{inq.email}</span>
                            <button
                              onClick={(e) => handleCopyEmail(inq.email, e)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                              title="Copy Email"
                            >
                              {copiedEmail === inq.email ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Company & Phone */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="space-y-0.5">
                          <span className="font-medium text-xs block">{inq.company || '—'}</span>
                          {inq.phone && (
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {inq.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <select
                          value={inq.status}
                          onChange={e => handleStatusChange(inq.id, e.target.value as InquiryStatus)}
                          className={`rounded-xl px-2.5 py-1 text-xs font-bold border focus:outline-hidden cursor-pointer ${
                            inq.status === 'New'
                              ? 'bg-cyan-50 dark:bg-cyan-950/80 border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300'
                              : inq.status === 'In Progress'
                              ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                              : inq.status === 'Resolved'
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-500'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </td>

                      {/* Internal Notes Indicator */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        {inq.notes ? (
                          <button
                            onClick={() => handleOpenDetail(inq, 'notes')}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-medium hover:underline"
                            title={inq.notes}
                          >
                            <FileText className="w-3 h-3" />
                            <span>Notes</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenDetail(inq, 'notes')}
                            className="text-[11px] text-slate-400 hover:text-indigo-600 hover:underline"
                          >
                            + Add Note
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(inq, 'view')}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Read Full Message"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hasPermission('inquiries.manage') && (
                            <button
                              onClick={() => handleOpenDetail(inq, 'edit')}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit Inquiry Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('inquiries.delete') && (
                            <button
                              onClick={() => handleDelete(inq.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                              title="Delete Inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                      <p className="font-semibold text-sm">No contact messages found.</p>
                      <p className="text-xs">Try adjusting your status filter or search keywords.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Reader & Editor Modal */}
      <Modal
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        title={selectedInquiry ? `Inquiry #${selectedInquiry.id} • ${selectedInquiry.full_name}` : 'Inquiry'}
        maxWidth="2xl"
      >
        {selectedInquiry && (
          <div className="space-y-6">
            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setActiveModalTab('view')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeModalTab === 'view'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Message & Overview</span>
              </button>

              <button
                onClick={() => setActiveModalTab('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeModalTab === 'edit'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Lead Information</span>
              </button>

              <button
                onClick={() => setActiveModalTab('notes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeModalTab === 'notes'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Internal Staff Notes {selectedInquiry.notes && '•'}</span>
              </button>
            </div>

            {/* TAB 1: VIEW */}
            {activeModalTab === 'view' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Sender Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedInquiry.full_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Email:</span>
                    <a href={`mailto:${selectedInquiry.email}`} className="font-bold text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Company / Organization:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedInquiry.company || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Phone Number:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium font-mono">{selectedInquiry.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Subject Specialization:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedInquiry.subject_category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Status:</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                      selectedInquiry.status === 'New'
                        ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                        : selectedInquiry.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : selectedInquiry.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {selectedInquiry.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Inquiry Message Body:</label>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedInquiry.message}
                  </div>
                </div>

                {selectedInquiry.notes && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-1">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Internal Staff Notes:</span>
                    </span>
                    <p className="text-xs text-amber-950 dark:text-amber-200 whitespace-pre-wrap">{selectedInquiry.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject_category)}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Compose Email Reply</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedInquiry.id, 'In Progress')}
                      className="px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedInquiry.id, 'Resolved')}
                      className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                    >
                      Mark Resolved
                    </button>
                    {hasPermission('inquiries.delete') && (
                      <button
                        onClick={() => handleDelete(selectedInquiry.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EDIT INQUIRY DETAILS */}
            {activeModalTab === 'edit' && (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.full_name || ''}
                      onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={editForm.email || ''}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone || ''}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={editForm.company || ''}
                      onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={editForm.status || 'New'}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value as InquiryStatus })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Specialization</label>
                  <input
                    type="text"
                    value={editForm.subject_category || ''}
                    onChange={e => setEditForm({ ...editForm, subject_category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message Content *</label>
                  <textarea
                    rows={5}
                    required
                    value={editForm.message || ''}
                    onChange={e => setEditForm({ ...editForm, message: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('view')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: INTERNAL STAFF NOTES */}
            {activeModalTab === 'notes' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Internal staff notes are private to admins and project managers. Use them to log phone calls, meeting summaries, and technical requirements.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Staff Follow-Up & CRM Notes
                  </label>
                  <textarea
                    rows={6}
                    placeholder="e.g. Spoke with client on phone on 28th Aug. Scheduled technical architecture deep-dive for Thursday 2 PM..."
                    value={internalNoteDraft}
                    onChange={e => setInternalNoteDraft(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('view')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Back to Message
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isSavingNote}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNote ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Log New Lead / Manual Inquiry Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Log New Prospective Lead / Inquiry"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateManualInquiry} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Abebe Tessema"
                value={newInquiryForm.full_name}
                onChange={e => setNewInquiryForm({ ...newInquiryForm, full_name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. abebe@enterprise.et"
                value={newInquiryForm.email}
                onChange={e => setNewInquiryForm({ ...newInquiryForm, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+251-911-000000"
                value={newInquiryForm.phone}
                onChange={e => setNewInquiryForm({ ...newInquiryForm, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company / Ministry</label>
              <input
                type="text"
                placeholder="e.g. Ministry of Innovation"
                value={newInquiryForm.company}
                onChange={e => setNewInquiryForm({ ...newInquiryForm, company: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
              <select
                value={newInquiryForm.status}
                onChange={e => setNewInquiryForm({ ...newInquiryForm, status: e.target.value as InquiryStatus })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Specialization</label>
            <input
              type="text"
              placeholder="e.g. AI Platforms & Modernization"
              value={newInquiryForm.subject_category}
              onChange={e => setNewInquiryForm({ ...newInquiryForm, subject_category: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Inquiry / Consultation Request *</label>
            <textarea
              rows={4}
              required
              placeholder="Details of the client's requirements or phone conversation notes..."
              value={newInquiryForm.message}
              onChange={e => setNewInquiryForm({ ...newInquiryForm, message: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Internal Staff Follow-Up Notes</label>
            <textarea
              rows={2}
              placeholder="Internal reminders, assigned engineer, or follow-up deadline..."
              value={newInquiryForm.notes}
              onChange={e => setNewInquiryForm({ ...newInquiryForm, notes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Log Inquiry</span>
            </button>
          </div>
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
