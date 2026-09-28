import {
  Project,
  ProjectCategory,
  Technology,
  Service,
  TeamMember,
  Testimonial,
  BlogPost,
  ContactInquiry,
  DashboardStats,
  User,
  UserStatus,
  SecurityLog,
  SecurityPolicy,
  SecurityStats,
  ProjectStatus,
  InquiryStatus
} from '../types';

function getHeaders(isMultipart = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('nexora_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`API returned non-JSON response (${res.status}). Verify API backend is running on port 5000.`);
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

// Helper to convert relative upload paths to absolute URLs pointing to backend
function resolveImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  // If the URL has hardcoded localhost:5000 or 127.0.0.1:5000, normalize it to relative /uploads
  if (typeof url === 'string') {
    url = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000\//i, '/');
  }

  // If it's a relative /uploads path, keep it as-is so the vite proxy / same origin handles it
  if (typeof url === 'string' && url.startsWith('/uploads/')) {
    if ((import.meta as any).env?.DEV) {
      return url;
    } else {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const backendUrl = (import.meta as any).env?.VITE_API_URL || `${window.location.protocol}//${hostname}:5000`;
      return `${backendUrl}${url}`;
    }
  }
  return url;
}

export { resolveImageUrl };

export const api = {
  // Projects
  projects: {
    getAll: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      return fetch(`/api/projects?${query.toString()}`).then(r => handleResponse<{ success: boolean; projects: Project[]; total: number; totalPages: number }>(r));
    },
    getBySlug: (slug: string) => {
      return fetch(`/api/projects/${slug}`).then(r => handleResponse<{ success: boolean; project: Project; relatedProjects: Project[] }>(r));
    },
    create: (data: Partial<Project> & { tech_ids?: number[] }) => {
      return fetch('/api/projects', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }).then(r => handleResponse<{ success: boolean; project: Project; message: string }>(r));
    },
    update: (id: number, data: Partial<Project> & { tech_ids?: number[] }) => {
      return fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }).then(r => handleResponse<{ success: boolean; project: Project; message: string }>(r));
    },
    delete: (id: number) => {
      return fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      }).then(r => handleResponse<{ success: boolean; message: string }>(r));
    },
    updateStatus: (id: number, status: ProjectStatus) => {
      return fetch(`/api/projects/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      }).then(r => handleResponse<{ success: boolean; project: Project }>(r));
    },
    toggleFeatured: (id: number) => {
      return fetch(`/api/projects/${id}/feature`, {
        method: 'PATCH',
        headers: getHeaders()
      }).then(r => handleResponse<{ success: boolean; is_featured: number; project: Project }>(r));
    },
    togglePublish: (id: number) => {
      return fetch(`/api/projects/${id}/publish`, {
        method: 'PATCH',
        headers: getHeaders()
      }).then(r => handleResponse<{ success: boolean; is_published: number; project: Project }>(r));
    }
  },

  // Categories
  categories: {
    getAll: () => fetch('/api/categories').then(r => handleResponse<{ success: boolean; categories: ProjectCategory[] }>(r)),
    create: (data: Partial<ProjectCategory>) => fetch('/api/categories', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; category: ProjectCategory }>(r)),
    update: (id: number, data: Partial<ProjectCategory>) => fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; category: ProjectCategory }>(r)),
    delete: (id: number) => fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; message: string }>(r))
  },

  // Technologies
  technologies: {
    getAll: () => fetch('/api/technologies').then(r => handleResponse<{ success: boolean; technologies: Technology[] }>(r)),
    create: (data: Partial<Technology>) => fetch('/api/technologies', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; technology: Technology }>(r)),
    update: (id: number, data: Partial<Technology>) => fetch(`/api/technologies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; technology: Technology }>(r)),
    delete: (id: number) => fetch(`/api/technologies/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; message: string }>(r))
  },

  // Services
  services: {
    getAll: () => fetch('/api/services').then(r => handleResponse<{ success: boolean; services: Service[] }>(r)),
    getBySlug: (slug: string) => fetch(`/api/services/${slug}`).then(r => handleResponse<{ success: boolean; service: Service }>(r)),
    create: (data: Partial<Service>) => fetch('/api/services', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; service: Service }>(r)),
    update: (id: number, data: Partial<Service>) => fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; service: Service }>(r)),
    delete: (id: number) => fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; message: string }>(r))
  },

  // Team
  team: {
    getAll: () => fetch('/api/team').then(r => handleResponse<{ success: boolean; team: TeamMember[] }>(r)),
    getDepartments: () => fetch('/api/team/list').then(r => handleResponse<{ success: boolean; departments: Array<{ name: string; count: number }>; count: number }>(r)),
    create: (data: Partial<TeamMember>) => fetch('/api/team', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; teamMember: TeamMember }>(r)),
    update: (id: number, data: Partial<TeamMember>) => fetch(`/api/team/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; teamMember: TeamMember }>(r)),
    delete: (id: number) => fetch(`/api/team/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; message: string }>(r))
  },

  // Testimonials
  testimonials: {
    getAll: () => fetch('/api/testimonials').then(r => handleResponse<{ success: boolean; testimonials: Testimonial[] }>(r)),
    create: (data: Partial<Testimonial>) => fetch('/api/testimonials', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; testimonial: Testimonial }>(r)),
    update: (id: number | string, data: Partial<Testimonial>) => fetch(`/api/testimonials/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; testimonial: Testimonial }>(r)),
    delete: (id: number | string) => fetch(`/api/testimonials/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; message: string }>(r))
  },

  // Departments
  departments: {
    getAll: () => fetch('/api/departments').then(r => handleResponse<{ success: boolean; departments: Array<{ name: string; count: number }> }>(r)),
    create: (name: string) => fetch('/api/departments', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name })
    }).then(r => handleResponse<{ success: boolean; department: { name: string; count: number } }>(r)),
    update: (oldName: string, newName: string) => fetch(`/api/departments/${encodeURIComponent(oldName)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name: newName })
    }).then(r => handleResponse<{ success: boolean; department: { name: string; count: number } }>(r)),
    delete: (name: string) => fetch(`/api/departments/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; message: string }>(r))
  },

  // Blogs
  blogs: {
    getAll: () => fetch('/api/blogs').then(r => handleResponse<{ success: boolean; blogs: BlogPost[] }>(r)),
    getBySlug: (slug: string) => fetch(`/api/blogs/${slug}`).then(r => handleResponse<{ success: boolean; blog: BlogPost; recent: BlogPost[] }>(r)),
    create: (data: Partial<BlogPost>) => fetch('/api/blogs', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; blog: BlogPost }>(r)),
    update: (id: number, data: Partial<BlogPost>) => fetch(`/api/blogs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; blog: BlogPost }>(r)),
    delete: (id: number) => fetch(`/api/blogs/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; message: string }>(r))
  },

  // Inquiries
  inquiries: {
    submit: (data: Partial<ContactInquiry>) => fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; message: string; inquiryId: number }>(r)),
    create: (data: Partial<ContactInquiry>) => fetch('/api/inquiries', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; message: string; inquiryId: number }>(r)),
    getAll: (status?: string) => {
      const q = status ? `?status=${encodeURIComponent(status)}` : '';
      return fetch(`/api/inquiries${q}`, { headers: getHeaders() }).then(r => handleResponse<{ success: boolean; inquiries: ContactInquiry[] }>(r));
    },
    updateStatus: (id: number, status: InquiryStatus) => fetch(`/api/inquiries/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    }).then(r => handleResponse<{ success: boolean; inquiry: ContactInquiry }>(r)),
    update: (id: number, data: Partial<ContactInquiry>) => fetch(`/api/inquiries/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; inquiry: ContactInquiry }>(r)),
    updateNotes: (id: number, notes: string) => fetch(`/api/inquiries/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ notes })
    }).then(r => handleResponse<{ success: boolean; inquiry: ContactInquiry }>(r)),
    delete: (id: number) => fetch(`/api/inquiries/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; message: string }>(r))
  },

  // Brochures
  brochures: {
    // Get all brochures for a project
    getByProject: (projectId: number) => fetch(`/api/brochures/project/${projectId}`).then(r => handleResponse<{ success: boolean; brochures: any[] }>(r)),
    
    // Get single brochure by ID
    get: (brochureId: number) => fetch(`/api/brochures/${brochureId}`).then(r => handleResponse<{ success: boolean; brochure: any }>(r)),
    
    // Upload/create new brochure
    upload: (projectId: number, data: { title: string; description?: string; file_type?: string; file_url: string; file_size_mb?: number; display_order?: number; thumbnail_url?: string }) => fetch('/api/brochures', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ project_id: projectId, ...data })
    }).then(r => handleResponse<{ success: boolean; brochure: any; message: string }>(r)),
    
    // Update brochure metadata
    update: (brochureId: number, data: { title?: string; description?: string; display_order?: number; thumbnail_url?: string }) => fetch(`/api/brochures/${brochureId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; brochure: any; message: string }>(r)),
    
    // Delete brochure
    delete: (brochureId: number) => fetch(`/api/brochures/${brochureId}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; message: string }>(r)),
    
    // Legacy methods for backward compatibility
    save: (projectId: number, data: { title: string; content: string }) => fetch(`/api/brochures/project/${projectId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; brochure: any; message: string }>(r)),
    toggle: (projectId: number) => fetch(`/api/brochures/${projectId}/toggle`, {
      method: 'PUT',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; is_published: number; message: string }>(r))
  },

  // Stats
  stats: {
    getDashboard: () => fetch('/api/stats/dashboard', { headers: getHeaders() }).then(r => handleResponse<DashboardStats & { success: boolean }>(r)),
    getPublic: () => fetch('/api/stats/public').then(r => handleResponse<{ success: boolean; stats: any }>(r))
  },

  // Users & IAM
  users: {
    getAll: () => fetch('/api/auth/users', { headers: getHeaders() }).then(r => handleResponse<{ success: boolean; users: User[] }>(r)),
    create: (data: any) => fetch('/api/auth/users', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; user: User; message: string }>(r)),
    update: (id: number, data: any) => fetch(`/api/auth/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<{ success: boolean; user: User; message: string }>(r)),
    toggleStatus: (id: number, status: UserStatus) => fetch(`/api/auth/users/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    }).then(r => handleResponse<{ success: boolean; user: User; message: string }>(r)),
    resetPassword: (id: number) => fetch(`/api/auth/users/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; temporaryPassword: string; user: User; message: string }>(r)),
    updatePermissions: (id: number, permissions: string[]) => fetch(`/api/auth/users/${id}/permissions`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ permissions })
    }).then(r => handleResponse<{ success: boolean; user: User; message: string }>(r)),
    toggle2FA: (id: number) => fetch(`/api/auth/users/${id}/2fa`, {
      method: 'PATCH',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; two_factor_enabled: boolean; recoveryCodes: string[]; user: User; message: string }>(r)),
    delete: (id: number) => fetch(`/api/auth/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; message: string }>(r)),
    resetDb: () => fetch('/api/auth/reset-db', {
      method: 'POST',
      headers: getHeaders()
    }).then(r => handleResponse<{ success: boolean; message: string }>(r))
  },

  // Security Audit & Policies
  security: {
    getLogs: (params: { severity?: string; event_type?: string; user_id?: number; search?: string; limit?: number } = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
      return fetch(`/api/auth/security-logs?${query.toString()}`, { headers: getHeaders() })
        .then(r => handleResponse<{ success: boolean; total: number; logs: SecurityLog[] }>(r));
    },
    getActivityLogs: (params: { action?: string; target_type?: string; user_name?: string; search?: string; limit?: number } = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
      return fetch(`/api/auth/activity-logs?${query.toString()}`, { headers: getHeaders() })
        .then(r => handleResponse<{ success: boolean; total: number; logs: any[] }>(r));
    },
    getStats: () => fetch('/api/auth/security-stats', { headers: getHeaders() })
      .then(r => handleResponse<{ success: boolean; stats: SecurityStats }>(r)),
    getPolicy: () => fetch('/api/auth/security-policy', { headers: getHeaders() })
      .then(r => handleResponse<{ success: boolean; policy: SecurityPolicy }>(r)),
    updatePolicy: (policy: Partial<SecurityPolicy>) => fetch('/api/auth/security-policy', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(policy)
    }).then(r => handleResponse<{ success: boolean; policy: SecurityPolicy; message: string }>(r))
  },

  // Upload
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch('/api/upload', {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    }).then(r => handleResponse<{ success: boolean; url: string; filename: string; message?: string }>(r));
  },
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch('/api/upload', {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    }).then(r => handleResponse<{ success: boolean; url: string; filename: string; message?: string }>(r));
  },

  // Generic HTTP methods
  get: (endpoint: string) => {
    return fetch(endpoint, { headers: getHeaders() }).then(r => handleResponse<any>(r));
  },
  post: (endpoint: string, data?: any) => {
    return fetch(endpoint, {
      method: 'POST',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    }).then(r => handleResponse<any>(r));
  },
  put: (endpoint: string, data?: any) => {
    return fetch(endpoint, {
      method: 'PUT',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    }).then(r => handleResponse<any>(r));
  },
  delete: (endpoint: string) => {
    return fetch(endpoint, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(r => handleResponse<any>(r));
  }
};
