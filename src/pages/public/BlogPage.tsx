import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { BlogPost } from '../../types';
import { api } from '../../services/api';
import { FileText, Calendar, Clock, ArrowRight } from 'lucide-react';

export const BlogPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.blogs.getAll().then(res => {
      if (res.blogs) setBlogs(res.blogs);
    }).catch(err => console.error(err)).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="pt-28 pb-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <FileText className="w-3.5 h-3.5" />
          <span>{settings.blog_badge_text || 'Research & Engineering Insights'}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          {settings.blog_section_title || 'Technical Perspectives & Architecture Whitepapers'}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {settings.blog_section_desc || 'Deep-dive analysis on real-world engineering challenges, vector retrieval, eBPF telemetry, and high-throughput financial ledgers.'}
        </p>
      </div>

      {/* Blog Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-850 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <article
              key={blog.id}
              onClick={() => onNavigate(`/blog/${blog.slug}`)}
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={blog.cover_image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {blog.tags && blog.tags[0] && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {blog.tags[0]}
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
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

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-sans line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {blog.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read Full Whitepaper <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
