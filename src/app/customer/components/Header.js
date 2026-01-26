'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiLogOut,
} from 'react-icons/fi';
import { MdExpandMore } from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { setCart } from '../../store/cartSlice';
// import { setCart } from '@/app/store/cartSlice';
import { FaSearch, FaTiktok } from 'react-icons/fa';
import { FiChevronRight, FiFacebook, FiInstagram } from 'react-icons/fi';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import CartSidebar from './CartSidebar';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]); // Add this state
  const [isMegaDropdownOpen, setIsMegaDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false); // New Sidebar State
  const [searchQuery, setSearchQuery] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const [totalQuantityOfItems, setTotalQuantityOfItems] = useState(0);
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: '',
  });
  const [loadingSocial, setLoadingSocial] = useState(true);

  const animationControls = useAnimation();

  const startAnimation = () => {
    animationControls.start({
      x: '-80%',
      transition: {
        duration: 25,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
        onRepeat: () => {
          animationControls.set({ x: '100%' });
        },
      },
    });
  };

  const fetchSocialMediaLinks = async () => {
    try {
      const response = await fetch(`/api/socialfirstrecodlink/2`);
      const data = await response.json();
      if (data.status) {
        setSocialMediaLinks(data.data);
      }
    } catch (error) {
      console.error('Error fetching social media links:', error);
    } finally {
      setLoadingSocial(false);
    }
  };

  useEffect(() => {
    fetchSocialMediaLinks();
    startAnimation();
  }, [router]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleViewDetailsClick = () => {
    router.push('/customer/pages/discounted-products');
  };


  useEffect(() => {
    if (cartItems.length > 0) {
      const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
      setTotalQuantityOfItems(totalQuantity);
    }
  }, [cartItems]);

  console.log("All cart items are: ", cartItems);
  // Refs for dropdowns
  const megaDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Fetch Categories and Subcategories
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        // Fetch categories
        const categoryResponse = await fetch('/api/categories');
        const categoriesData = await categoryResponse.json();

        if (categoriesData.status && Array.isArray(categoriesData.data)) {
          setCategories(categoriesData.data); // Set categories from 'data'
        } else {
          console.error('Categories data is not an array:', categoriesData);
        }

        // Fetch all subcategories
        const subcategoryResponse = await fetch('/api/subcategories');
        const subcategoriesData = await subcategoryResponse.json();

        console.log('Subcategories data fetched:', subcategoriesData);

        if (subcategoriesData && subcategoriesData.status && Array.isArray(subcategoriesData.data)) {
          setSubcategories(subcategoriesData.data);
        } else if (subcategoriesData && subcategoriesData.status === false) {
          console.warn('Subcategories API returned status false:', subcategoriesData.message);
          setSubcategories([]);
        } else {
          setSubcategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories and subcategories:', error);
        setCategories([]);
        setSubcategories([]);
      }
    };

    fetchCategoriesAndSubcategories();

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      setAuthToken(token);
    }
    if (role) {
      setUserRole(role);
    }

    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    dispatch(setCart(storedCart));

    // Event listeners for closing dropdowns
    const handleClickOutsideMega = (event) => {
      if (
        megaDropdownRef.current &&
        !megaDropdownRef.current.contains(event.target) &&
        !event.target.closest('#department-button')
      ) {
        setIsMegaDropdownOpen(false);
      }
    };

    const handleClickOutsideProfile = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideMega);
    document.addEventListener('mousedown', handleClickOutsideProfile);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMega);
      document.removeEventListener('mousedown', handleClickOutsideProfile);
    };
  }, [dispatch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      router.push('/');
    } else {
      const searchPageUrl = `/customer/pages/allproducts?search=${encodeURIComponent(
        searchQuery.trim()
      )}`;
      router.push(searchPageUrl);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleMegaDropdown = () => {
    setIsMegaDropdownOpen(!isMegaDropdownOpen);
  };

  const handleCategoryHover = (category) => {
    setHoveredCategory(category);

    // Filter subcategories by categorySlug
    const filteredSubcategories = subcategories.filter(
      (subcategory) => subcategory.categorySlug === category.slug
    );

    // Update the state with filtered subcategories
    setFilteredSubcategories(filteredSubcategories);

    setIsMegaDropdownOpen(true); // Open the mega dropdown
  };

  const handleCategoryClick = (categorySlug) => {
    router.push(`/customer/pages/category/${categorySlug}`);
    setIsMegaDropdownOpen(false);
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
  };


  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');

    setAuthToken(null);
    setUserRole(null);
    setIsSignOutModalOpen(false);

    // Redirect the user to the login page
    router.push('/admin');
  };


  const [companyName, setcompanyName] = useState('');
  const [companyHeaderImage, setcompanyHeaderImage] = useState('');
  const [companyicon, setcompanyicon] = useState('');

  useEffect(() => {
    async function fetchCompanyDetails() {
      try {
        const response = await fetch('/api/companydetails');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched company data:", data);

        if (data) {
          setcompanyName(data.name);
          setcompanyHeaderImage(data.headerImage);
          setcompanyicon(data.favIcon);
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    }
    fetchCompanyDetails();
  }, []);

  return (
    <header className="bg-white py-4 md:py-5 sticky top-0 z-50 shadow-sm border-b border-gray-100 transition-all">
      <div className="container mx-auto flex items-center px-8 lg:px-12 max-w-[1536px]">
        {/* Left Side: Logo */}
        <div className="flex-shrink-0 mr-8 xl:mr-12">
          <Link href="/">
            <Image
              width={130}
              height={40}
              src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${companyHeaderImage}`}
              alt="Logo"
              className="h-8 md:h-9 w-auto cursor-pointer object-contain"
              unoptimized
            />
          </Link>
        </div>

        {/* Center: Desktop Menu - Hidden when search is open */}
        {!isSearchOpen && (
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4 text-[11px] xl:text-[12px] font-black uppercase tracking-widest text-gray-700">
            {/* Department Dropdown */}
            <div className="relative group/dept">
              <button
                id="department-button"
                onClick={toggleMegaDropdown}
                className="hover:text-black transition-colors flex items-center py-2 h-14"
              >
                DEPARTMENTS <MdExpandMore className="ml-1 text-base opacity-40" />
              </button>
              {isMegaDropdownOpen && (
                <div
                  ref={megaDropdownRef}
                  className="absolute left-0 top-full w-[350px] bg-white shadow-2xl rounded-b-[2rem] border border-gray-100 z-50 overflow-hidden py-4 px-2"
                  onMouseLeave={handleCategoryLeave}
                >
                  <div className="grid grid-cols-1">
                    {categories.map((category) => (
                      <div
                        key={category.slug}
                        className="text-gray-500 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded-2xl cursor-pointer flex items-center space-x-3 transition-all"
                        onMouseEnter={() => handleCategoryHover(category)}
                        onClick={() => handleCategoryClick(category.slug)}
                      >
                        {category.imageUrl && (
                          <Image
                            width={24}
                            height={24}
                            src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${category.imageUrl}`}
                            alt={category.name}
                            className="w-6 h-6 object-cover rounded-full border border-gray-50"
                            unoptimized
                          />
                        )}
                        <span className="font-bold text-[11px] uppercase tracking-wider">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category Links - Stacked if two words */}
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.slug}
                href={`/customer/pages/category/${category.slug}`}
                className="relative group py-2 h-14 flex items-center hover:text-black transition-colors text-center whitespace-nowrap"
              >
                {category.name}
                <span className="absolute bottom-3 left-0 w-0 h-[3px] bg-black transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            ))}

            <Link
              href={`/customer/pages/blog`}
              className="relative group py-2 h-14 flex items-center hover:text-black transition-colors"
            >
              BLOG
              <span className="absolute bottom-3 left-0 w-0 h-[3px] bg-black transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
          </nav>
        )}

        {/* Full Header Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 bg-white z-50 flex items-center px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto"
            >
              <div className="relative w-full flex items-center gap-4">
                <FiSearch className="text-gray-400" size={20} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-transparent border-none py-4 text-lg outline-none font-medium placeholder:text-gray-300"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSearch}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'collection' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    SEARCH
                  </button>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side: Icons - Grouped with consistent spacing */}
        <div className="hidden lg:flex items-center space-x-4 xl:space-x-5 ml-auto">
          {!isSearchOpen && (
            <>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 text-gray-700 hover:text-black transition-colors focus:outline-none"
              >
                <FiSearch size={20} />
              </button>
              <div className="h-4 w-[1px] bg-gray-200"></div>
            </>
          )}

          {/* Shopping Cart */}
          <Link href="/customer/pages/cart" className="relative group p-1.5 focus:outline-none flex items-center justify-center">
            <FiShoppingCart className="text-gray-700 text-[22px] group-hover:text-black transition-colors" />
            {totalQuantityOfItems > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 flex justify-center items-center bg-[#F25C2C] text-white rounded-full text-[9px] font-bold shadow-md ring-2 ring-white">
                {totalQuantityOfItems}
              </span>
            )}
          </Link>

          {/* Vertical Divider */}
          <div className="h-4 w-[1px] bg-gray-200"></div>

          {/* Profile Section */}
          <div className="relative flex items-center">
            {authToken ? (
              <div className="relative">
                {userRole === 'ADMIN' ? (
                  /* Admin Profile Icon */
                  <Link
                    href="/admin/pages/Main"
                    className="group flex items-center space-x-2 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition-all border border-orange-100"
                  >
                    <div className="bg-orange-500 p-1.5 rounded-full text-white shadow-sm">
                      <FiUser className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-orange-600 uppercase tracking-tight hidden xl:block">Admin</span>
                  </Link>
                ) : (
                  /* Customer Profile Icon */
                  <div ref={profileButtonRef} className="cursor-pointer group">
                    <FiUser
                      className="w-6 h-6 text-gray-700 group-hover:text-black transition-colors"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    />
                  </div>
                )}

                {isDropdownOpen && userRole !== 'ADMIN' && (
                  <div
                    ref={profileDropdownRef}
                    className="absolute right-0 mt-4 w-48 bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 z-50 overflow-hidden"
                  >
                    <Link
                      href="/customer/pages/orders"
                      className="flex items-center px-3.5 py-2 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/customer/pages/profile"
                      className="flex items-center px-3.5 py-2 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                    >
                      Profile
                    </Link>
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/admin"
                className="group p-2 flex items-center justify-center"
              >
                <FiUser className="w-6 h-6 text-gray-700 group-hover:text-black transition-colors" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="lg:hidden flex items-center ml-auto">
          <button
            className="text-gray-700 hover:text-black transition-colors"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>


      {/* Mobile Menu Sidebar */}
      {
        isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar Content */}
            <div className="absolute inset-y-0 right-0 w-[80vw] bg-white shadow-2xl border-l border-gray-100 overflow-y-auto">
              {/* Close Button or Brand Space */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <span className="text-[16px] font-extrabold text-black tracking-tight">Navigation</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <FiX size={22} />
                </button>
              </div>

              {/* Search bar at the top */}
              <div className="p-4 bg-white">
                <form className="relative flex" onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search products..."
                    className="bg-gray-50 border border-gray-100 rounded-full py-3 pl-5 pr-12 text-[13px] w-full text-gray-800 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <FaSearch size={14} />
                  </button>
                </form>
              </div>

              {/* Categories and Nav Links */}
              <nav className="flex flex-col px-4 pb-8">
                {/* Primary Links */}
                <div className="flex flex-col space-y-1 mb-6">
                  <Link href="/" className="text-gray-900 font-bold py-3 px-3 text-[14px] hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                  <Link href="/customer/pages/blog" className="text-gray-900 font-bold py-3 px-3 text-[14px] hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                  <Link href="/customer/pages/aboutus" className="text-gray-900 font-bold py-3 px-3 text-[14px] hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                  <Link href="/customer/pages/contactus" className="text-gray-900 font-bold py-3 px-3 text-[14px] hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
                </div>

                <div className="h-px bg-gray-100 mb-6 mx-2"></div>

                <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-4 px-3">
                  Shop Departments
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {categories.map((category) => (
                    <div
                      key={category.slug}
                      className="group flex items-center space-x-3 text-gray-700 font-semibold py-3 px-3 text-[14px] hover:bg-blue-50 hover:text-blue-600 rounded-xl cursor-pointer transition-all"
                      onClick={() => handleCategoryClick(category.slug)}
                    >
                      {category.imageUrl && (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                          <Image
                            width={32}
                            height={32}
                            src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${category.imageUrl}`}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <span>{category.name}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-gray-100 my-6 mx-2"></div>

                {authToken ? (
                  <div className="space-y-1">
                    <Link
                      href="/customer/pages/orders"
                      className="flex items-center text-gray-700 font-bold py-3 px-3 text-[14px] hover:bg-gray-50 rounded-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiUser className="mr-3" /> My Orders
                    </Link>
                    <Link
                      href="/customer/pages/cart"
                      className="flex items-center justify-between text-gray-700 font-bold py-3 px-3 text-[14px] hover:bg-gray-50 rounded-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FiShoppingCart className="mr-3" /> <span>My Cart</span>
                      </div>
                      {totalQuantityOfItems > 0 && (
                        <span className="bg-[#1ABC9C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {totalQuantityOfItems}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center text-red-600 font-bold py-3 px-3 text-[14px] hover:bg-red-50 rounded-xl text-left transition-colors"
                    >
                      <FiLogOut className="mr-3" /> Log Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/admin"
                    className="text-white font-bold py-3 px-2 text-[14px] text-center bg-black rounded-xl transition-all hover:bg-gray-800 shadow-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In to Account
                  </Link>
                )}

                <div className="mt-10 px-3">
                  <div className="flex items-center space-x-5">
                    {loadingSocial ? (
                      <div className="w-16 h-3 bg-gray-100 animate-pulse rounded"></div>
                    ) : (
                      <>
                        <a href={socialMediaLinks.facebook || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors">
                          <FiFacebook size={20} />
                        </a>
                        <a href={socialMediaLinks.instagram || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E4405F] transition-colors">
                          <FiInstagram size={20} />
                        </a>
                        <a href={socialMediaLinks.tiktok || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
                          <FaTiktok size={18} />
                        </a>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-widest">Store2u.ca © 2026</p>
                </div>
              </nav>
            </div>
          </div>
        )
      }

      {/* Mobile-only Scrolling Announcement Bar - Now Relative to prevent overlap */}
      <div className="md:hidden relative w-full overflow-hidden h-9 bg-white border-b border-gray-100 flex items-center z-40">
        <motion.div
          className="flex items-center space-x-6 text-gray-700 whitespace-nowrap absolute text-[10.5px] font-semibold"
          initial={{ x: '100%' }}
          animate={animationControls}
          onMouseEnter={() => animationControls.stop()}
          onMouseLeave={() => startAnimation()}
        >
          <FiChevronRight className="text-blue-500" />
          <span>Free returns on all orders above $100</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          <span>Get great devices up to 50% off</span>
          <button onClick={handleViewDetailsClick} className="text-blue-600 font-bold hover:underline">
            View details
          </button>
        </motion.div>
      </div>

      {/* Sign-out Confirmation Modal */}
      {
        isSignOutModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Confirm Sign Out</h2>
              <p>Are you sure you want to sign out?</p>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  onClick={() => setIsSignOutModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('role');
                    setAuthToken(null);
                    setIsSignOutModalOpen(false);
                    router.push('/admin');
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Mobile Fixed Floating Cart Button - Matches Screenshot 1 */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsCartSidebarOpen(true)}
          className="relative bg-[#1ABC9C] w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <FiShoppingCart className="text-white w-6 h-6" />
          {totalQuantityOfItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF4D4F] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
              {totalQuantityOfItems}
            </span>
          )}
        </button>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartSidebarOpen}
        onClose={() => setIsCartSidebarOpen(false)}
      />
    </header >
  );
};

export default Header;
