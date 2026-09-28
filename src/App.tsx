import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ToastProvider } from './components/common/Toast';
import { AdminLayout } from './components/admin/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { TeamPage } from './pages/public/TeamPage';
import { BlogPage } from './pages/public/BlogPage';
import { BlogPostPage } from './pages/public/BlogPostPage';
import { ContactPage } from './pages/public/ContactPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminProjectEditPage } from './pages/admin/AdminProjectEditPage';
import { AdminBrochuresPage } from './pages/admin/AdminBrochuresPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminTechnologiesPage } from './pages/admin/AdminTechnologiesPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminTeamPage } from './pages/admin/AdminTeamPage';
import { AdminDepartmentsPage } from './pages/admin/AdminDepartmentsPage';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage';
import { AdminBlogPage } from './pages/admin/AdminBlogPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Sync state with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global search shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 border-r-violet-500 border-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 opacity-20 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-300">Loading Platform…</p>
            <p className="text-xs text-slate-600 mt-1 font-mono">Verifying session</p>
          </div>
        </div>
      </div>
    );
  }

  // Route Router Matcher
  const renderContent = () => {
    // 1. Admin Login Page
    if (currentPath === '/admin/login') {
      return <AdminLoginPage onNavigate={navigate} />;
    }

    // 2. Admin Protected Routes
    if (currentPath.startsWith('/admin')) {
      if (!isAuthenticated && !isLoading) {
        return <AdminLoginPage onNavigate={navigate} />;
      }

      let adminView = <AdminDashboardPage onNavigate={navigate} />;

      if (currentPath === '/admin/projects') {
        adminView = <AdminProjectsPage onNavigate={navigate} />;
      } else if (currentPath === '/admin/projects/new') {
        adminView = <AdminProjectEditPage onNavigate={navigate} />;
      } else if (currentPath.startsWith('/admin/projects/edit/')) {
        const id = currentPath.split('/admin/projects/edit/')[1];
        adminView = <AdminProjectEditPage projectId={id} onNavigate={navigate} />;
      } else if (currentPath.startsWith('/admin/projects/') && currentPath !== '/admin/projects') {
        const id = currentPath.replace('/admin/projects/', '');
        adminView = <AdminProjectEditPage projectId={id} onNavigate={navigate} />;
      } else if (currentPath === '/admin/brochures') {
        adminView = <AdminBrochuresPage onNavigate={navigate} />;
      } else if (currentPath === '/admin/categories') {
        adminView = <AdminCategoriesPage />;
      } else if (currentPath === '/admin/technologies') {
        adminView = <AdminTechnologiesPage />;
      } else if (currentPath === '/admin/services') {
        adminView = <AdminServicesPage />;
      } else if (currentPath === '/admin/team') {
        adminView = <AdminTeamPage />;
      } else if (currentPath === '/admin/departments') {
        adminView = <AdminDepartmentsPage />;
      } else if (currentPath === '/admin/testimonials') {
        adminView = <AdminTestimonialsPage />;
      } else if (currentPath === '/admin/blogs') {
        adminView = <AdminBlogPage />;
      } else if (currentPath === '/admin/inquiries') {
        adminView = <AdminInquiriesPage />;
      } else if (currentPath === '/admin/settings') {
        adminView = <AdminSettingsPage />;
      } else if (currentPath === '/admin/users') {
        adminView = <AdminUsersPage />;
      } else if (currentPath === '/admin/profile') {
        adminView = <AdminProfilePage />;
      } else if (currentPath === '/admin/audit-logs') {
        adminView = <AdminAuditLogsPage onNavigate={navigate} />;
      }

      return (
        <AdminLayout currentPath={currentPath} onNavigate={navigate}>
          {adminView}
        </AdminLayout>
      );
    }

    // 3. Public Routes
    let publicContent = <HomePage onNavigate={navigate} />;

    if (currentPath === '/about') {
      publicContent = <AboutPage onNavigate={navigate} />;
    } else if (currentPath === '/services') {
      publicContent = <ServicesPage onNavigate={navigate} />;
    } else if (currentPath.startsWith('/projects/')) {
      const slug = currentPath.replace('/projects/', '');
      publicContent = <ProjectDetailPage slug={slug} onNavigate={navigate} />;
    } else if (currentPath === '/projects') {
      const urlParams = new URLSearchParams(window.location.search);
      const initialCat = urlParams.get('category') || undefined;
      publicContent = <ProjectsPage onNavigate={navigate} initialCategory={initialCat} />;
    } else if (currentPath === '/team') {
      publicContent = <TeamPage />;
    } else if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      publicContent = <BlogPostPage slug={slug} onNavigate={navigate} />;
    } else if (currentPath === '/blog') {
      publicContent = <BlogPage onNavigate={navigate} />;
    } else if (currentPath === '/contact') {
      publicContent = <ContactPage />;
    }

    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenSearch={() => setSearchModalOpen(true)}
        />
        <main className="flex-1">
          {publicContent}
        </main>
        <Footer onNavigate={navigate} />
      </div>
    );
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300">
        {renderContent()}

        {/* Global Spotlight Search Dialog */}
        <SearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onNavigate={navigate}
        />

        {/* Global Scroll to Top Button */}
        <ScrollToTop />
      </div>
    </ToastProvider>
  );
};
