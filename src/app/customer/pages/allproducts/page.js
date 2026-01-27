'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ThreeDots } from 'react-loader-spinner';
import { useDispatch } from 'react-redux';
import { addToCart, setCart } from '../../../store/cartSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiChevronRight, FiSearch, FiShoppingCart, FiChevronDown, FiMaximize2, FiShoppingBag, FiFilter, FiX, FiPlus } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import { GoStarFill } from 'react-icons/go';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tempSortOption, setTempSortOption] = useState("newest");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const dispatch = useDispatch();
  const router = useRouter();

  const fetchProducts = useCallback(async (query) => {
    setLoading(true);
    try {
      const url = query
        ? `/api/products/search/${encodeURIComponent(query)}`
        : `/api/products`;

      const response = await axios.get(url);
      const data = query ? response.data.data : response.data;

      const fetchedProducts = (data || []).map(product => ({
        ...product,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
      }));

      setProducts(fetchedProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('search') || '';
      setSearchQuery(query);
      fetchProducts(query);
    };

    handleRouteChange();
  }, [fetchProducts]);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    dispatch(addToCart(product));
  };

  const handleBuyNow = (product, e) => {
    if (e) e.stopPropagation();
    dispatch(addToCart(product));
    router.push('/customer/pages/cart');
  };

  const handleProductClick = (slug) => {
    router.push(`/customer/pages/products/${slug}`);
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0';
  };

  const calculateOriginalPrice = (price, discount) => {
    if (typeof price === 'number' && typeof discount === 'number' && discount > 0) {
      return price / (1 - discount / 100);
    }
    return price;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <ThreeDots height="60" width="60" color="#f97316" />
      </div>
    );
  }

  const displayProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());

      const isTopRated = p.rating >= 4.5;
      const isOnSale = p.discount > 0;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "top-rated" && isTopRated) ||
        (statusFilter === "on-sale" && isOnSale);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div className="bg-white min-h-screen text-[#1A1A1A] font-sans">
      {/* Refined Header Section */}
      <div className="bg-gray-50 border-b border-gray-100 py-12 px-4 md:px-8">
        <div className="container mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
            <span className="cursor-pointer hover:text-[#F25C2C] transition-colors" onClick={() => router.push('/')}>Home</span>
            <FiChevronRight />
            <span className="text-gray-800">Search Results</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <h3 className="text-[1.5rem] md:text-[2rem] font-black uppercase tracking-tighter text-gray-900 leading-none">
              Explore <span className="text-[#F25C2C]">Collection</span>
            </h3>

            <div className="flex w-full lg:w-auto items-center bg-white rounded-full pl-6 pr-2 py-2 overflow-hidden border border-gray-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#F25C2C]/20 focus-within:border-[#F25C2C] group">
              <FiSearch className="text-gray-400 mr-3 shrink-0 group-focus-within:text-[#F25C2C] transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent border-none focus:ring-0 text-sm py-2 w-full lg:w-80 font-medium placeholder:text-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="bg-[#F25C2C] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#E04E1D] transition-colors shrink-0 shadow-lg shadow-orange-500/30"
                onClick={() => fetchProducts(searchQuery)}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Filters */}
        <div className="flex items-center justify-between gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex items-center gap-3">
            {['All', 'New Release', 'Popularity', 'Best Seller', 'Sale'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-[#F25C2C] text-white shadow-lg shadow-orange-500/30' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setTempSortOption(sortOption);
              setTempStatusFilter(statusFilter);
              setShowFilters(true);
            }}
            className="md:hidden flex items-center justify-center bg-white text-[#f97316] w-10 h-10 rounded-xl border border-gray-100 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <FiFilter size={18} />
          </button>

          <button
            onClick={() => {
              setTempSortOption(sortOption);
              setTempStatusFilter(statusFilter);
              setShowFilters(true);
            }}
            className="hidden md:flex w-10 h-10 rounded-full border border-gray-200 items-center justify-center text-gray-500 hover:border-[#F25C2C] hover:text-[#F25C2C] transition-colors shrink-0"
          >
            <FiFilter />
          </button>
        </div>

        {/* Product Grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {displayProducts.map(product => {
              const originalPrice = calculateOriginalPrice(product.price, product.discount);
              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 cursor-pointer"
                  onClick={() => handleProductClick(product.slug)}
                >
                  <div
                    className="relative aspect-square bg-[#F3F4FB] overflow-hidden transition-all duration-500"
                  >
                    {/* Badge */}
                    {product.discount > 0 && (
                      <div className="absolute top-3 left-3 z-20 bg-[#1E4C2F] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight shadow-md">
                        {product.discount.toFixed(0)}% OFF
                      </div>
                    )}

                    {/* Floating Icons */}
                    <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <button className="bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-[#F25C2C] hover:text-white transition-all transform hover:scale-110">
                        <FiMaximize2 size={14} />
                      </button>
                      <button
                        className="bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-[#F25C2C] hover:text-white transition-all transform hover:scale-110"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        <FiShoppingBag size={14} />
                      </button>
                    </div>

                    {product.images?.[0] && (
                      <Image
                        fill
                        src={`${product.images[0].url ? process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL + '/' + product.images[0].url : process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL + '/' + product.images[0]}`}
                        alt={product.name}
                        className="object-contain p-8 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[60%]">
                        {product.category?.name || 'Shop Collection'}
                      </p>
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                        <GoStarFill size={10} /> 4.9
                      </div>
                    </div>

                    <h4
                      className="text-sm font-bold mb-2 line-clamp-2 text-[#2D2D2D] group-hover:text-[#F25C2C] transition-colors leading-snug h-[2.8em] overflow-hidden"
                    >
                      {product.name}
                    </h4>

                    <div className="flex flex-col mt-auto justify-end mb-3">
                      <p className="text-base font-bold text-gray-900 leading-none">Rs.{formatPrice(product.price)}</p>
                      {product.discount > 0 && (
                        <p className="text-[9px] text-gray-400 line-through mt-1 font-medium">Rs.{formatPrice(originalPrice)}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="flex-1 border border-gray-200 text-gray-600 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-lg hover:border-[#F25C2C] hover:text-[#F25C2C] transition-all flex items-center justify-center gap-1.5"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        <FiShoppingCart size={12} /> <span className="hidden sm:inline">Add</span>
                      </button>
                      <button
                        className="flex-1 bg-[#F25C2C] text-white text-[9px] font-black uppercase tracking-widest py-2.5 rounded-lg hover:bg-[#E04E1D] transition-all shadow-lg active:scale-95 shadow-orange-500/20"
                        onClick={(e) => handleBuyNow(product, e)}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No products found matching "{searchQuery}"</p>
            <button
              className='mt-6 text-[#F25C2C] text-xs font-black uppercase tracking-widest hover:underline'
              onClick={() => {
                setSearchQuery('');
                fetchProducts('');
              }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Pagination placeholder */}
        {displayProducts.length > 0 && (
          <div className="mt-20 flex items-center justify-center gap-3">
            <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 hover:border-[#F25C2C] hover:text-[#F25C2C] transition-all">Prev</button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${page === 1 ? 'bg-[#F25C2C] text-white shadow-lg shadow-orange-500/30' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {page}
              </button>
            ))}
            <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 hover:border-[#F25C2C] hover:text-[#F25C2C] transition-all">Next</button>
          </div>
        )}


        {/* Newsletter Section */}
        <div className="mt-32 p-12 md:p-20 relative overflow-hidden group text-center">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-[1.5rem] md:text-[2rem] font-black text-gray-900 mb-6 leading-tight tracking-tighter">Stay in the Loop</h3>
            <p className="text-gray-500 mb-10 text-[10px] font-bold uppercase tracking-[0.2em]">Get the latest updates and exclusive offers.</p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-4 px-6 text-black text-xs font-bold tracking-wider placeholder:text-gray-400 focus:ring-2 focus:ring-[#F25C2C]/20 outline-none transition-all"
              />
              <button className="bg-[#F25C2C] text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#E04E1D] transition-all shadow-lg shadow-orange-500/30">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[60]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            {/* Bottom Sheet / Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 right-0 bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[450px] bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
                <div className="w-12 h-1 bg-gray-200 rounded-full absolute top-3 left-1/2 -translate-x-1/2 md:hidden" />
                <div className="w-8" /> {/* Spacer */}
                <h3 className="text-sm font-black uppercase tracking-widest text-black">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-gray-400 hover:text-black transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* General Filter Options */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Sort Section */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">Sort By</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { id: "newest", label: "Newest First" },
                      { id: "price-asc", label: "Price: Low to High" },
                      { id: "price-desc", label: "Price: High to Low" },
                      { id: "name-asc", label: "Name: A-Z" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setTempSortOption(opt.id)}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tempSortOption === opt.id
                          ? "bg-[#1A1A2E] text-white shadow-lg"
                          : "bg-white border border-gray-100 text-gray-500 hover:border-gray-300"
                          }`}
                      >
                        {opt.label}
                        {tempSortOption === opt.id ? <FiX size={12} /> : <FiPlus size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Section */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">Product Status</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { id: "all", label: "All Items" },
                      { id: "top-rated", label: "Top Rated" },
                      { id: "on-sale", label: "On Sale" },
                    ].map((status) => (
                      <button
                        key={status.id}
                        onClick={() => setTempStatusFilter(status.id)}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tempStatusFilter === status.id
                          ? "bg-[#1A1A2E] text-white shadow-lg"
                          : "bg-white border border-gray-100 text-gray-500 hover:border-gray-300"
                          }`}
                      >
                        {status.label}
                        {tempStatusFilter === status.id ? <FiX size={12} /> : <FiPlus size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-8 border-t border-gray-50 flex gap-4">
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-4 border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSortOption(tempSortOption);
                    setStatusFilter(tempStatusFilter);
                    setShowFilters(false);
                  }}
                  className="flex-1 py-4 bg-[#f97316] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllProducts;
