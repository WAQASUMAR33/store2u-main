'use client';

import React, { useEffect, useState } from 'react';
import { FiChevronRight, FiFacebook, FiInstagram } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa'; // Import TikTok icon
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TopBar = () => {
  const router = useRouter();
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: '',
  });
  const [loading, setLoading] = useState(true); // Loading state

  const fetchSocialMediaLinks = async () => {
    try {
      const response = await fetch(`/api/socialfirstrecodlink/2`);
      const data = await response.json();
      console.log('Response of social media links:', data);
      if (data && data.status) {
        setSocialMediaLinks(data.data || { facebook: '', instagram: '', twitter: '', tiktok: '' });
      } else if (data && data.status === false) {
        console.error('Error fetching social media links: API returned status false', data.message);
        setSocialMediaLinks({ facebook: '', instagram: '', twitter: '', tiktok: '' }); // Reset or set default
      } else {
        console.error('Error fetching social media links: Invalid data structure or missing status', data);
        setSocialMediaLinks({ facebook: '', instagram: '', twitter: '', tiktok: '' }); // Reset or set default
      }
    } catch (error) {
      console.error('Error fetching social media links:', error);
      setSocialMediaLinks({ facebook: '', instagram: '', twitter: '', tiktok: '' }); // Reset or set default on network/parsing error
    } finally {
      setLoading(false);
    }
  };

  const animationControls = useAnimation(); // Animation controls

  useEffect(() => {
    fetchSocialMediaLinks(); // Fetch social media links
    startAnimation(); // Start the animation on component mount
  }, [router]);

  const startAnimation = () => {
    animationControls.start({
      x: '-80%', // Move to the left
      transition: {
        duration: 25,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
        onRepeat: () => {
          animationControls.set({ x: '100%' }); // Reset to the right on loop
        },
      },
    });
  };

  const handleViewDetailsClick = () => {
    router.push('/customer/pages/discounted-products');
  };

  return (
    <div className="hidden md:flex w-full justify-center bg-[#F8F9FA] py-2 border-b border-gray-200 text-gray-600 text-[11px] font-bold transition-all">
      <div className="container w-full flex flex-row justify-between items-center px-8 lg:px-12 max-w-[1536px]">
        {/* Left Side: Static Links */}
        <div className="flex items-center space-x-4 xl:space-x-6 flex-grow">
          <div className="flex items-center space-x-4 whitespace-nowrap border-r border-gray-200 pr-6 leading-none">
            <Link href="/customer/pages/aboutus" className="hover:text-orange-500 transition-colors">
              About Us
            </Link>
            <div className="w-[1px] h-3 bg-gray-300 mx-1"></div>
            <Link href="/customer/pages/contactus" className="hover:text-orange-500 transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Middle: Promo Message - Hidden on smaller md screens to avoid crowding */}
          <div className="hidden xl:flex flex-grow overflow-hidden relative h-5">
            <motion.div
              className="flex items-center space-x-6 text-gray-500 whitespace-nowrap absolute"
              initial={{ x: '100%' }}
              animate={animationControls}
              onMouseEnter={() => animationControls.stop()}
              onMouseLeave={() => startAnimation()}
            >
              <FiChevronRight className="text-[13px] mr-2 text-orange-500" />
              <span>Free returns on all orders above $100</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span>Get great devices up to 50% off</span>
              <button onClick={handleViewDetailsClick} className="text-orange-500 font-semibold hover:underline">
                View details
              </button>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Social Media Icons with Brand Colors */}
        <div className="flex items-center space-x-4 lg:space-x-5 ml-4">
          <div className="flex items-center space-x-3 lg:space-x-4 text-[15px]">
            {loading ? (
              <div className="w-16 h-3.5 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <>
                <a
                  href={socialMediaLinks.facebook || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-500 transition-transform hover:scale-110"
                >
                  <FiFacebook />
                </a>
                <a
                  href={socialMediaLinks.instagram || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-500 transition-transform hover:scale-110"
                >
                  <FiInstagram />
                </a>
                <a
                  href={socialMediaLinks.tiktok || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#000000] hover:opacity-80 transition-all transform hover:scale-110"
                >
                  <FaTiktok />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
