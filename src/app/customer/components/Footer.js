'use client';
import React, { useEffect, useState } from "react";
import { RxGlobe } from "react-icons/rx";
import { MdKeyboardArrowDown, MdCopyright } from "react-icons/md";
import { FaFacebook, FaEnvelope, FaTiktok, FaInstagram, FaTwitter, FaPinterest } from 'react-icons/fa';
import Link from 'next/link';
import axios from "axios";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from 'next/image';

const Footer = () => {
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    pinterest: ''
  });

  const [loading, setLoading] = useState(true);

  // Set up intersection observer
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100
      }
    }
  };

  useEffect(() => {
    const fetchSocialMediaLinks = async () => {
      try {
        // Adding a query parameter with the current timestamp to avoid cache
        const response = await fetch(`/api/socialfirstrecodlink/2}`);
        const data = await response.json();
        if (data.status) {
          setSocialMediaLinks(data.data);
        }
      } catch (error) {
        console.error('Error fetching social media links:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialMediaLinks();
  }, []);

  const [companyName, setCompanyName] = useState('');
  const [companyHeaderImage, setCompanyHeaderImage] = useState('');
  const [companyIcon, setCompanyIcon] = useState('');

  useEffect(() => {
    async function fetchCompanyDetails() {
      try {
        const response = await fetch('/api/companydetails');
        const data = await response.json();
        if (data) {
          setCompanyName(data.name);
          setCompanyHeaderImage(data.headerImage);
          setCompanyIcon(data.favIcon);
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    }
    fetchCompanyDetails();
  }, []);

  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyOwner, setCompanyOwner] = useState('');

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const response = await axios.get('/api/contactinfo');
        if (Array.isArray(response.data) && response.data.length > 0) {
          const existingContact = response.data[0];
          setCompanyEmail(existingContact.email);
          setCompanyPhone(existingContact.phoneNumber);
          setCompanyWebsite(existingContact.website);
          setCompanyOwner(existingContact.owner);
          setCompanyAddress(existingContact.address);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    }
    fetchContactInfo();
  }, []);

  // State for hover effect
  const [hoveredLink, setHoveredLink] = useState(null);

  // Helper for image URL
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${url}`;
  };

  return (
    <>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
        className="grid grid-cols-1 px-4 gap-6 md:px-10 lg:px-20 sm:grid-cols-2 lg:grid-cols-4 py-10 border-t border-gray-200 bg-white text-black"
      >
        {/* Column 1: Brand & Description */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <Link href="/" className="focus:outline-none">
            {companyHeaderImage ? (
              <Image
                width={140}
                height={42}
                src={getImageUrl(companyHeaderImage)}
                className="cursor-pointer object-contain"
                alt="Footer Logo"
                unoptimized
              />
            ) : (
              <span className="text-2xl font-bold">{companyName || 'Store Logo'}</span>
            )}
          </Link>
          <p className="text-gray-600 text-sm leading-relaxed text-justify">
            {companyName} is your ultimate destination for top-quality products, seamless shopping experience, and unmatched customer service.
          </p>
          <div className="flex gap-2 mt-2">
            <Link href='/'>
              <img src="/footericon/appstore.png" className="w-32 h-10 object-contain border border-gray-300 rounded-lg" alt="App Store" />
            </Link>
            <Link href='/'>
              <img src="/footericon/playstore.png" className="w-32 h-10 object-contain border border-gray-300 rounded-lg" alt="Play Store" />
            </Link>
          </div>
        </motion.div>

        {/* Column 2: Company Links */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <h3 className="text-lg font-bold mb-2">Company</h3>
          {[
            { name: 'Privacy Policy', path: '/customer/pages/privacypolicy', id: 'privacy' },
            { name: 'Terms & Conditions', path: '/customer/pages/termsandconditions', id: 'terms' },
            { name: 'Shipping Policy', path: '/customer/pages/shippingpolicy', id: 'shipping' },
            { name: 'Return & Exchange', path: '/customer/pages/returnandexchangepolicy', id: 'return' }
          ].map((link) => (
            <Link
              key={link.id}
              href={link.path}
              className={`text-sm transition-all duration-300 hover:text-orange-500 font-medium ${hoveredLink === link.id ? 'text-orange-500 translate-x-1 font-bold' : 'text-gray-600'}`}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.name}
            </Link>
          ))}
        </motion.div>

        {/* Column 3: Explore */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <h3 className="text-lg font-bold mb-2">Explore</h3>
          {[
            { name: 'About Us', path: '/customer/pages/aboutus', id: 'about' },
            { name: 'FAQs', path: '/customer/pages/faq', id: 'faq' },
            { name: 'Contact Us', path: '/customer/pages/contactus', id: 'contact' }
          ].map((link) => (
            <Link
              key={link.id}
              href={link.path}
              className={`text-sm transition-all duration-300 hover:text-orange-500 font-medium ${hoveredLink === link.id ? 'text-orange-500 translate-x-1 font-bold' : 'text-gray-600'}`}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.name}
            </Link>
          ))}
        </motion.div>

        {/* Column 4: Support */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <h3 className="text-lg font-bold mb-2">Support</h3>
          <div className="text-sm text-gray-600 flex flex-col gap-2">
            <p><span className="text-black font-bold">Email:</span> {companyEmail}</p>
            <p><span className="text-black font-bold">Phone:</span> {companyPhone}</p>
            <p><span className="text-black font-bold">Address:</span> {companyAddress}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-white border-t border-gray-200 text-gray-600 py-6 px-4"
      >
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Language / Region */}
          <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1 text-sm hover:border-black cursor-pointer transition-colors text-black">
            <RxGlobe />
            <span>English (US)</span>
            <MdKeyboardArrowDown />
          </div>

          {/* Copyright */}
          <div className="text-center text-sm">
            <p>&copy; {new Date().getFullYear()} {companyName}. All Rights Reserved.</p>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 text-black">
            <a href={socialMediaLinks.facebook || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-transform hover:scale-110">
              <FaFacebook size={20} />
            </a>
            <a href={socialMediaLinks.instagram || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-transform hover:scale-110">
              <FaInstagram size={20} />
            </a>
            <a href={socialMediaLinks.tiktok || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-transform hover:scale-110">
              <FaTiktok size={20} />
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Footer;