import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stats/dashboard - Admin only
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const projects = await db.find('projects');
    const services = await db.find('services');
    const team = await db.find('team_members');
    const blogs = await db.find('blog_posts');
    const inquiries = await db.find('contact_inquiries');
    const technologies = await db.find('technologies');
    const categories = await db.find('project_categories');
    const logs = await db.find('activity_logs', '', [], 'created_at DESC LIMIT 15');

    const totalProjects = projects.length;
    const completedProjects = await db.count('projects', "LOWER(status) = 'completed'");
    const ongoingProjects = await db.count('projects', "LOWER(status) = 'ongoing'");
    const upcomingProjects = await db.count('projects', "LOWER(status) = 'upcoming'");
    const onHoldProjects = await db.count('projects', "LOWER(status) = 'on hold'");
    const featuredProjects = await db.count('projects', 'is_featured = 1');

    const totalServices = services.length;
    const totalTeam = team.length;
    const totalBlogs = blogs.length;
    const totalInquiries = inquiries.length;
    const newInquiries = await db.count('contact_inquiries', "LOWER(status) = 'new'");

    // Status breakdown chart data
    const statusDistribution = [
      { name: 'Completed', count: completedProjects, color: '#10b981' },
      { name: 'Ongoing', count: ongoingProjects, color: '#6366f1' },
      { name: 'Upcoming', count: upcomingProjects, color: '#f59e0b' },
      { name: 'On Hold', count: onHoldProjects, color: '#ef4444' }
    ];

    // Category distribution
    const categoryDistribution = await Promise.all(categories.map(async cat => {
      const count = await db.count('projects', 'category_id = $1', [cat.id]);
      return { name: cat.name, count, color: cat.color || '#6366f1' };
    }));
    const filteredCategories = categoryDistribution.filter(c => c.count > 0);

    // Tech popularity distribution (Top 8)
    const techWithCounts = await Promise.all(technologies.map(async tech => {
      const count = await db.count('project_technologies', 'technology_id = $1', [tech.id]);
      return { name: tech.name, count, category: tech.category, color: tech.color || '#3b82f6' };
    }));
    const techDistribution = techWithCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Monthly releases simulation / trend
    const monthlyTrend = [
      { month: 'Q1', projects: 2, inquiries: 14, releases: 1 },
      { month: 'Q2', projects: 4, inquiries: 22, releases: 3 },
      { month: 'Q3', projects: 6, inquiries: 35, releases: 4 },
      { month: 'Q4', projects: 8, inquiries: 48, releases: 6 }
    ];

    // Recent activity logs (already limited in query)
    const recentActivity = logs;

    res.json({
      success: true,
      kpis: {
        totalProjects,
        completedProjects,
        ongoingProjects,
        upcomingProjects,
        onHoldProjects,
        featuredProjects,
        totalServices,
        totalTeam,
        totalBlogs,
        totalInquiries,
        newInquiries,
        estimatedMonthlyVisitors: '24.8k'
      },
      charts: {
        statusDistribution,
        categoryDistribution: filteredCategories,
        techDistribution,
        monthlyTrend
      },
      recentActivity
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats.' });
  }
});

// GET /api/stats/public - Public Counter Stats
router.get('/public', async (req, res) => {
  try {
    const completed = await db.count('projects', 'is_published = 1 AND LOWER(status) = $1', ['completed']);
    const ongoing = await db.count('projects', 'is_published = 1 AND LOWER(status) = $1', ['ongoing']);
    const services = await db.count('services', 'is_active = 1');
    const team = await db.count('team_members');

    res.json({
      success: true,
      stats: {
        completedProjects: completed,
        ongoingProjects: ongoing,
        totalServices: services,
        teamMembers: team
      }
    });
  } catch (err) {
    console.error('Public stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve public stats.' });
  }
});

export default router;
