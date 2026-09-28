import { User } from '../types';

export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.publish',
    'categories.manage', 'technologies.manage', 'services.manage', 'team.manage', 'testimonials.manage',
    'blogs.manage', 'inquiries.manage', 'inquiries.delete', 'settings.manage', 'users.view', 'users.create',
    'users.edit', 'users.delete', 'users.manage_security', 'security.audit', 'security.policy', 'system.reset'
  ],
  administrator: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.publish',
    'categories.manage', 'technologies.manage', 'services.manage', 'team.manage', 'testimonials.manage',
    'blogs.manage', 'inquiries.manage', 'settings.manage', 'users.view', 'users.create', 'users.edit',
    'users.manage_security', 'security.audit'
  ],
  project_manager: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.publish',
    'categories.manage', 'technologies.manage', 'inquiries.manage'
  ],
  content_manager: [
    'services.manage', 'team.manage', 'testimonials.manage', 'blogs.manage',
    'inquiries.manage', 'settings.manage'
  ],
  viewer: []
};

export function hasPermission(user: User | null | undefined, permissionKey: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;

  // Check custom user permissions overrides
  if (Array.isArray(user.custom_permissions) && user.custom_permissions.includes(permissionKey)) {
    return true;
  }

  // Check default role permissions
  const rolePerms = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
  return rolePerms.includes(permissionKey);
}
