'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GridShimmer, CategoryCardShimmer } from './Shimmer';

const TopCategories = () => {
  const [categories, setCategories] = useState([]); // Ensure it's initialized as an array
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Auto-slide effect for mobile
  useEffect(() => {
    if (loading || categories.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % categories.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [loading, categories.length]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/categories'); // Replace with your actual API endpoint
        console.log('Fetched Categories:', response.data); // Debugging line

        // Access the categories correctly from response.data.data
        setCategories(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Set categories as an empty array if error occurs
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Use slug instead of id
  const handleCategoryClick = (categorySlug) => {
    router.push(`/customer/pages/category/${categorySlug}`);
  };

  const backgroundColors = [
    'bg-red-100', 'bg-green-100', 'bg-blue-100', 'bg-pink-100', 'bg-gray-100', 'bg-yellow-100'
  ];

  return (
    <div className="container mx-auto pb-12 px-4 bg-white sm:max-w-full lg:max-w-[1440px]">
      <div className="mb-16 px-2 md:px-4">
        <h3 className="text-[1.5rem] md:text-[2rem] font-black text-black text-center uppercase tracking-tighter">Shop by Categories</h3>
        <div className="h-1.5 w-24 bg-orange-500 mx-auto mt-6 rounded-full shadow-lg shadow-orange-500/20"></div>
      </div>

      {/* Categories Grid - Mobile 2-column, Desktop 8-column */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-5 px-2 md:px-4">
        {loading ? (
          <GridShimmer
            ItemComponent={CategoryCardShimmer}
            count={8}
            className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-5 w-full col-span-full"
          />
        ) : Array.isArray(categories) && categories.length > 0 ? (
          categories.map((category, index) => (
            <motion.div
              key={category.slug}
              className={`${backgroundColors[index % backgroundColors.length]} bg-opacity-40 rounded-2xl overflow-hidden text-center p-4 md:p-5 cursor-pointer group shadow-sm hover:shadow-md transition-all h-full flex flex-col items-center justify-center`}
              onClick={() => handleCategoryClick(category.slug)}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              style={{ minHeight: '180px' }}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 mb-3 rounded-xl overflow-hidden bg-white/50 shadow-inner">
                {category.imageUrl ? (
                  <Image
                    width={200}
                    height={200}
                    src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${category.imageUrl}`}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-[10px] font-medium uppercase tracking-tighter">No Image</span>
                  </div>
                )}
              </div>
              <h4 className="text-[10px] md:text-[11px] font-black text-black group-hover:text-orange-500 transition-colors uppercase tracking-[0.1em] leading-tight">
                {category.name}
              </h4>
              {category.tagline && (
                <p className="text-[10px] text-gray-500 font-medium mt-1 italic line-clamp-1">
                  {category.tagline}
                </p>
              )}
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 italic py-10 col-span-full text-center">No departments available right now.</p>
        )}
      </div>
    </div>
  );
};

export default TopCategories;
