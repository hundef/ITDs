import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Trash2,
  LogIn,
  LogOut,
  AlertTriangle,
  Shield,
  Activity,
  Download,
  Filter,
  X
} from 'lucide-react';

interface ActivityLog {
  id: number;
  user_name: string;
  user_role: string;
  action: string;
  target_type: string;
  target_name: string;
  details?: string;
  created_at: string;
}

interface SecurityLog {
  id: number;
  user_name: string;
  user_email: string;
  event_type: string;
  severity: string;
  ip_address: string;
  details: string;
  created_at: string;
}

interface AuditLog {
  id: number;
  user_name: string;
  user_role?: string;
  user_email?: string;
  action: string;
  target_type: string;
  target_name: string;
  event_type?: string;
  severity?: string;
  details?: string;
  created_at: string;
  type: 'activity' | 'security';
}

interface AdminAuditLogsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminAuditLogsPage: React.FC<AdminAuditLogsPageProps> = ({ onNavigate }) => {
  const { success, error } = useToast();
  const { hasPermission } = useAuth();

  // Check permission
  useEffect(() => {
    if (!hasPermission('security.audit')) {
      error('You do not have permission to view audit logs.');
      onNavigate('/admin');
    }
  }, [hasPermission, onNavigate, error]);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'activity' | 'security' | 'deletions'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load logs
  useEffect(() => {
    loadLogs();
  }, [activeTab, searchQuery, filterAction]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      let allLogs: AuditLog[] = [];

      // Load activity logs
      const activityRes = await api.security.getActivityLogs({
        search: searchQuery,
        action: filterAction || undefined,
        limit: 500
      });
      if (activityRes.logs) {
        allLogs = allLogs.concat(
          activityRes.logs.map((log: ActivityLog) => ({
            ...log,
            type: 'activity' as const,
            event_type: 'N/A',
            severity: 'N/A',
            details: log.details || ''
          }))
        );
      }

      // Load security logs
      const securityRes = await api.security.getLogs({
        search: searchQuery,
        limit: 500
      });
      if (securityRes.logs) {
        allLogs = allLogs.concat(
          securityRes.logs.map((log: SecurityLog) => ({
            id: log.id,
            user_name: log.user_name,
            user_email: log.user_email,
            action: log.event_type,
            target_type: 'Security',
            target_name: log.event_type,
            event_type: log.event_type,
            severity: log.severity,
            details: log.details,
            created_at: log.created_at,
            type: 'security' as const
          }))
        );
      }

      // Filter by tab
      if (activeTab === 'activity') {
        allLogs = allLogs.filter(l => l.type === 'activity');
      } else if (activeTab === 'security') {
        allLogs = allLogs.filter(l => l.type === 'security');
      } else if (activeTab === 'deletions') {
        allLogs = allLogs.filter(
          l => l.action.toLowerCase().includes('delete') || l.action.toLowerCase().includes('deleted')
        );
      }

      // Sort by date descending
      allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLogs(allLogs);
    } catch (err: any) {
      error(err.message || 'Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('delete') || lowerAction.includes('deleted')) {
      return <Trash2 className="w-4 h-4 text-rose-500" />;
    }
    if (lowerAction.includes('login')) {
      return <LogIn className="w-4 h-4 text-green-500" />;
    }
    if (lowerAction.includes('logout')) {
      return <LogOut className="w-4 h-4 text-blue-500" />;
    }
    if (lowerAction.includes('failure') || lowerAction.includes('error')) {
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
    return <Activity className="w-4 h-4 text-slate-500" />;
  };

  const getSeverityColor = (severity?: string) => {
    if (!severity) return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    const lower = severity.toLowerCase();
    if (lower === 'critical') return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400';
    if (lower === 'warning') return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
    if (lower === 'info') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  };

  const tabs = [
    { id: 'all', label: 'All Logs', count: logs.length },
    { id: 'activity', label: 'Activity', count: logs.filter(l => l.type === 'activity').length },
    { id: 'security', label: 'Security Events', count: logs.filter(l => l.type === 'security').length },
    { id: 'deletions', label: 'Deletions', count: logs.filter(l => l.action.toLowerCase().includes('delete')).length }
  ];

  const handleExportCSV = () => {
    const csv = [
      ['Date', 'User', 'Role', 'Action', 'Type', 'Target', 'Details'],
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.user_name,
        log.type === 'activity' ? (log.user_role ?? 'N/A') : (log.user_email ?? 'N/A'),
        log.action,
        log.type,
        log.target_name,
        log.details || ''
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin')}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-sans">
              Audit & Compliance Logs
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All system activities, security events, and project deletions
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          {(searchQuery || filterAction) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterAction('');
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Search (name, action, details)
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Action Type
              </label>
              <select
                value={filterAction}
                onChange={e => setFilterAction(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Actions</option>
                <option value="delete">Deleted</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No logs found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                    Details
                  </th>
                  {activeTab === 'security' && (
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                      Severity
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white">
                      {log.user_name}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-slate-900 dark:text-white">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`inline-block px-2 py-1 rounded-lg font-semibold ${
                        log.type === 'activity'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      }`}>
                        {log.type === 'activity' ? 'Activity' : 'Security'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-900 dark:text-white max-w-xs truncate">
                      {log.target_name}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {log.details}
                    </td>
                    {activeTab === 'security' && (
                      <td className="px-4 py-3 text-xs">
                        <span className={`inline-block px-2 py-1 rounded-lg font-semibold text-white ${getSeverityColor(log.severity)}`}>
                          {log.severity || 'N/A'}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Activity Logs</p>
              <p className="text-lg font-extrabold text-blue-700 dark:text-blue-400">
                {logs.filter(l => l.type === 'activity').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Security Events</p>
              <p className="text-lg font-extrabold text-purple-700 dark:text-purple-400">
                {logs.filter(l => l.type === 'security').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-200 dark:border-rose-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Deletions</p>
              <p className="text-lg font-extrabold text-rose-700 dark:text-rose-400">
                {logs.filter(l => l.action.toLowerCase().includes('delete')).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Total Logs</p>
              <p className="text-lg font-extrabold text-slate-700 dark:text-slate-300">
                {logs.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
