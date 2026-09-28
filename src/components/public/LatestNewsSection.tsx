import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { BlogPost } from '../../types';
import { api } from '../../services/api';
import { FileText, ArrowRight, Calendar, Clock } from 'lucide-react';

export const LatestNewsSection: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.blogs.getAll().then(res => {
      if (res.blogs) setBlogs(res.blogs.slice(0, 3));
    }).catch(err => {
      console.error('Failed to load blog posts:', err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  if (!isLoading && blogs.length === 0) return null;

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <FileText className="w-3.5 h-3.5" />
            <span>{settings.blog_badge_text || 'Architecture & Insights'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            {settings.blog_section_title || 'Technical Perspectives & Architecture Whitepapers'}
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            {settings.blog_section_desc ||
              'Deep-dive technical perspectives on AI vector retrieval, eBPF telemetry, and distributed financial ledgers.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('/blog')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white transition-all shrink-0 self-start md:self-auto group"
        >
          <span>All Insights</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogs.map(blog => (
          <article
            key={blog.id}
            onClick={() => onNavigate(`/blog/${blog.slug}`)}
            className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={blog.cover_image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(blog.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {blog.read_time}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-sans line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {blog.summary}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Whitepaper <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
