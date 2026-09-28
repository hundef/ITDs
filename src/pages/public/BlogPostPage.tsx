import React, { useEffect, useState } from 'react';
import { BlogPost } from '../../types';
import { api } from '../../services/api';
import { ArrowLeft, Calendar, Clock, Tag, Sparkles, BookOpen } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const BlogPostPage: React.FC<{ slug: string; onNavigate: (path: string) => void }> = ({ slug, onNavigate }) => {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [recent, setRecent] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success } = useToast();

  useEffect(() => {
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    api.blogs.getBySlug(slug).then(res => {
      if (res.blog) {
        setBlog(res.blog);
        setRecent(res.recent || []);
      }
    }).catch(err => console.error(err)).finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-96 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="pt-36 pb-20 text-center max-w-md mx-auto px-4 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Article Not Found</h2>
        <button
          onClick={() => onNavigate('/blog')}
          className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl"
        >
          Back to Insights
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Article link copied to clipboard!');
  };

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Back Button & Metadata */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/blog')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Insights</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
            <BookOpen className="w-4 h-4" /> Blog Post
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {new Date(blog.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {blog.read_time}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-sans">
          {blog.title}
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          {blog.summary}
        </p>
      </div>

      {/* Cover Image */}
      <div className="h-[350px] sm:h-[450px] w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Content Body */}
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 leading-relaxed space-y-6">
        <div className="whitespace-pre-line font-sans text-base sm:text-lg">
          {blog.content}
        </div>
      </div>

      {/* Recent Insights */}
      {recent.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
            Related Technical Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recent.map(r => (
              <div
                key={r.id}
                onClick={() => onNavigate(`/blog/${r.slug}`)}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-2"
              >
                <span className="text-xs text-slate-400 font-mono">{new Date(r.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • {r.read_time}</span>
                <h4 className="font-bold text-base text-slate-900 dark:text-white hover:text-indigo-600 line-clamp-2">
                  {r.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">{r.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
