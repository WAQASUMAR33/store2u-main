'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RelatedBlogs from '../../../components/RelatedBlogs';
import { ThreeDots } from 'react-loader-spinner';
import Image from 'next/image';
import { FiCalendar, FiClock, FiTag, FiShare2, FiFacebook, FiTwitter, FiLinkedin, FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';

const BlogDetailPage = ({ id }) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        try {
          const response = await fetch(`/api/blog/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch blog details');
          }
          const data = await response.json();
          setBlog(data);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchBlog();
    }
  }, [id]);

  // Calculate reading time
  const calculateReadingTime = (text) => {
    if (!text) return 1;
    const textContent = text.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Share functions
  const handleShare = (platform) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = blog?.title || '';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <ThreeDots
          height="80"
          width="80"
          radius="9"
          color="#3498db"
          ariaLabel="three-dots-loading"
          visible={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-800 font-semibold text-lg mb-2">Error</p>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Blog post not found</p>
          <button
            onClick={() => router.push('/customer/pages/blog')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(blog.description + (blog.content || ''));

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Image Section */}
      <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden">
        <Image
          width={1920}
          height={1080}
          src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${blog.image}`}
          alt={blog.title}
          className="w-full h-full object-cover"
          priority
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          <div className="container mx-auto">
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <FiTag className="w-4 h-4" />
                <span>{blog.category || 'Uncategorized'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <FiClock className="w-4 h-4" />
                <span>{readingTime} min read</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {blog.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="lg:flex lg:gap-12">
          {/* Main Content */}
          <article className="lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              {/* Share Buttons */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b">
                <span className="text-gray-600 font-medium flex items-center gap-2">
                  <FiShare2 className="w-5 h-5" />
                  Share:
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <FiFacebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <FiTwitter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <FiLinkedin className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                    aria-label="Copy link"
                  >
                    <FiCopy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Blog Description */}
              {blog.description && (
                <div
                  className="prose prose-lg max-w-none mb-8 text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: blog.description }}
                />
              )}

              {/* Blog Content */}
              {blog.content && (
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  style={{
                    fontSize: '1.125rem',
                    lineHeight: '1.75rem',
                  }}
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              )}

              {/* Back to Blog Button */}
              <div className="mt-12 pt-8 border-t">
                <button
                  onClick={() => router.push('/customer/pages/blog')}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  ← Back to Blog
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-1/4 mt-12 lg:mt-0">
            <div className="sticky top-8">
              <RelatedBlogs category={blog.category} currentBlogId={blog.id} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
