'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiCalendar, FiClock, FiArrowRight, FiTag } from 'react-icons/fi';
import BlogCategorySlider from './components/BlogSlider';
import Subscribe from './components/Subcribe';
import BlogSection from './components/Blogsection';
import { BlogCardShimmer, GridShimmer } from '../../components/Shimmer';

export default function Blog() {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [visibleBlogs, setVisibleBlogs] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blog');

        if (!response.ok) {
          throw new Error(`Failed to fetch blogs: ${response.status}`);
        }

        const data = await response.json();

        // Handle different response formats
        const blogsArray = Array.isArray(data) ? data : (data.data || []);

        setBlogs(blogsArray);
        if (blogsArray.length > 0) {
          setFeaturedPost(blogsArray[0]);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const showMoreBlogs = () => {
    setVisibleBlogs((prev) => prev + 6);
  };

  // Calculate reading time (approximate)
  const calculateReadingTime = (text) => {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const textContent = text.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
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

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">

      {/* Header Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 text-center">
        <h1 className="text-2xl md:text-5xl font-extrabold mb-3 tracking-tight">
          Shopping Guides & Trends
        </h1>
        <p className="text-xs md:text-base text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed border-b border-gray-50 pb-6">
          The latest fashion lookbooks, reviews, and tips curated for you.
        </p>

        {/* Search & Categories */}
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full bg-gray-50 border border-gray-50 rounded-full py-2 px-4 pl-9 text-[10px] focus:outline-none focus:ring-1 focus:ring-gray-100 transition-all font-medium"
            />
            <svg className="w-3 h-3 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 overflow-x-auto no-scrollbar py-2">
            <button className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-black text-white hover:bg-black/80 transition-colors shadow-sm">Latest</button>
            <button className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black transition-colors">Fashion</button>
            <button className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black transition-colors">Lifestyle</button>
            <button className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black transition-colors">Gadgets</button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="space-y-8">
            <div className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
            <GridShimmer ItemComponent={BlogCardShimmer} count={4} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-300 mb-6 flex items-center gap-4">
                <span className="h-px bg-gray-100 flex-1"></span> Featured Story
              </h2>
              {featuredPost && (
                <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-50 shadow-sm hover:shadow-md transition-all duration-500">
                  <div className="md:flex items-stretch">
                    <div className="md:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Featured</span>
                        <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                        <span className="text-[10px] font-bold text-gray-400">{formatDate(featuredPost.createdAt)}</span>
                      </div>

                      <h2 className="text-xl md:text-4xl font-extrabold mb-4 leading-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <div className="text-gray-400 mb-6 line-clamp-2 md:line-clamp-3 text-xs md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: featuredPost.description }} />

                      <Link href={`/customer/pages/blog/${featuredPost.id}`} className="text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-2 text-black hover:gap-3 transition-all underline underline-offset-8">
                        Read Full Story <FiArrowRight />
                      </Link>
                    </div>
                    <div className="md:w-1/2 h-48 md:h-auto relative min-h-[250px] bg-gray-50">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${featuredPost.image}`}
                        alt={featuredPost.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Articles Grid */}
            <div className="mb-12 pt-6 border-t border-gray-50">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">Latest Articles</h2>
              </div>

              <BlogPosts
                blogs={blogs.slice(0, visibleBlogs)}
                calculateReadingTime={calculateReadingTime}
                formatDate={formatDate}
              />
            </div>

            {/* Load More */}
            {visibleBlogs < blogs.length && (
              <div className="text-center">
                <button
                  onClick={showMoreBlogs}
                  className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-black hover:text-white transition-all shadow-sm"
                >
                  Load More Articles
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Subscribe Section Style */}
      {!loading && blogs.length > 0 && (
        <div className="border-t border-gray-100">
          <Subscribe />
        </div>
      )}
    </div>
  );
}

/* Blog Posts Component */
function BlogPosts({ blogs, calculateReadingTime, formatDate }) {
  if (blogs.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogs.map((post, index) => (
        <article
          key={post.id || index}
          className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          {/* Image */}
          <Link href={`/customer/pages/blog/${post.id}`} className="relative h-64 overflow-hidden bg-gray-100">
            <Image
              width={600}
              height={400}
              src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${post.image}`}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-3 py-1">
              <span className="text-xs font-bold text-orange-500">🔥</span>
            </div>
          </Link>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            {/* Author/Meta */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                {/* Placeholder Avatar */}
                <Image src={`https://ui-avatars.com/api/?name=Admin&background=random`} width={32} height={32} alt="Author" unoptimized />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900">Admin</span>
              </div>
            </div>

            <Link href={`/customer/pages/blog/${post.id}`} className="block mb-3">
              <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
            </Link>

            <div
              className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow"
              dangerouslySetInnerHTML={{ __html: post.description }}
            />

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
              <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-1"><FiCalendar /> {formatDate(post.createdAt)}</span>
                <span className="flex items-center gap-1"><FiClock /> {calculateReadingTime(post.description)}m</span>
              </div>

              <Link
                href={`/customer/pages/blog/${post.id}`}
                className="text-xs font-bold text-gray-900 border border-gray-200 px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all"
              >
                Read More
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
