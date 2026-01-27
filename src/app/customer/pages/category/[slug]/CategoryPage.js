'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreeDots } from 'react-loader-spinner';
import Image from 'next/image';
import { FiChevronRight, FiSearch, FiShoppingCart, FiChevronDown, FiMaximize2, FiShoppingBag, FiFilter, FiX, FiPlus } from 'react-icons/fi';
import { GoStarFill } from 'react-icons/go';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../../store/cartSlice';

const CategoryPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [categoryData, setCategoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tempSortOption, setTempSortOption] = useState("newest");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes, subRes, recRes] = await Promise.all([
          axios.get(`/api/categories`),
          axios.get(`/api/products`),
          axios.get(`/api/subcategories`),
          axios.get(`/api/products/topRated`)
        ]);

        const categories = catRes.data.data || [];
        const currentCategory = categories.find(c => c.slug === slug);

        if (currentCategory) {
          setCategoryData(currentCategory);

          const allSubcategories = subRes.data.data || [];
          const categorySubcategories = allSubcategories.filter(s => s.categoryId === currentCategory.id);
          setSubcategories(categorySubcategories);

          const subcategorySlugs = categorySubcategories.map(s => s.slug);
          const allProducts = prodRes.data || []; // /api/products returns array directly
          const categoryProducts = allProducts.filter(p => subcategorySlugs.includes(p.subcategorySlug));
          setProducts(categoryProducts);
        }
        setRecommendations((recRes.data.data || []).slice(0, 4));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
  };

  const handleBuyNow = (product, e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
    router.push('/customer/pages/cart');
  };

  const handleProductClick = (productSlug) => {
    router.push(`/customer/pages/products/${productSlug}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <ThreeDots color="#f97316" height={80} width={80} />
    </div>
  );

  if (!categoryData) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-400 font-black uppercase tracking-widest">Category not found</p>
    </div>
  );

  const filteredProductsList = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const subcategory = subcategories.find(s => s.id === activeSubcategory);
      const matchesSubcategory = !activeSubcategory || p.subcategorySlug === subcategory?.slug;

      const isTopRated = p.rating >= 4.5; // Custom logic for top rated
      const isOnSale = p.discount > 0;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "top-rated" && isTopRated) ||
        (statusFilter === "on-sale" && isOnSale);

      return matchesSearch && matchesSubcategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div className="bg-white min-h-screen pb-20 overflow-x-hidden">
      {/* Navigation Breadcrumb & Sidebar Toggle for Mobile */}
      <div className="container mx-auto px-4 py-8 md:py-12 border-b border-gray-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400">
              <span className="cursor-pointer hover:text-black transition-colors" onClick={() => router.push('/')}>HOME</span>
              <FiChevronRight size={14} className="opacity-30" />
              <span className="text-black">{categoryData.name}</span>
            </div>

            {/* Mobile Filter Toggle - Right Side, Orange, White BG */}
            <button
              onClick={() => {
                setTempSortOption(sortOption);
                setTempStatusFilter(statusFilter);
                setShowFilters(true);
              }}
              className="md:hidden flex items-center justify-center bg-white text-[#f97316] w-10 h-10 rounded-xl border border-gray-100 active:scale-95 transition-all shadow-sm"
            >
              <FiFilter size={18} />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <p className="hidden md:block text-xs font-black uppercase tracking-widest text-gray-300">
              Showing <span className="text-black">{filteredProductsList.length}</span> results
            </p>
            <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="SEARCH IN THIS SHOP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black tracking-widest focus:ring-2 focus:ring-orange-500/20 transition-all outline-none w-full md:w-[280px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20">
        {/* Sidebar - Updated with Indicators and Badges */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block md:col-span-3 space-y-6 md:space-y-12`}>
          <div className="bg-white border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 sticky top-32 shadow-sm">
            <h3 className="text-sm md:text-base font-black uppercase tracking-[0.15em] mb-6 md:mb-12 flex items-center gap-3">
              <span className="w-1 md:w-1.5 h-5 md:h-6 bg-orange-500 rounded-full"></span>
              Categories
            </h3>

            <div className="space-y-3">
              <div
                className={`group flex items-center justify-between p-3.5 rounded-xl md:rounded-2xl cursor-pointer transition-all duration-300 ${!activeSubcategory ? 'bg-white border-2 border-orange-500 shadow-lg shadow-orange-100' : 'hover:bg-orange-50/50'}`}
                onClick={() => setActiveSubcategory(null)}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all ${!activeSubcategory ? 'border-orange-500 bg-orange-500' : 'border-gray-200 group-hover:border-orange-500'}`}>
                    {!activeSubcategory && <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${!activeSubcategory ? 'text-orange-600' : 'text-gray-600'}`}>All Items</span>
                </div>
                <span className={`text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-lg ${!activeSubcategory ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600'}`}>
                  {products.length}
                </span>
              </div>

              {subcategories.map(sub => (
                <div
                  key={sub.id}
                  className={`group flex items-center justify-between p-3.5 rounded-xl md:rounded-2xl cursor-pointer transition-all duration-300 ${activeSubcategory === sub.id ? 'bg-white border-2 border-orange-500 shadow-lg shadow-orange-100' : 'hover:bg-orange-50/50'}`}
                  onClick={() => setActiveSubcategory(sub.id)}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all ${activeSubcategory === sub.id ? 'border-orange-500 bg-orange-500' : 'border-gray-200 group-hover:border-orange-500'}`}>
                      {activeSubcategory === sub.id && <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full"></div>}
                    </div>
                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${activeSubcategory === sub.id ? 'text-orange-600' : 'text-gray-600'}`}>{sub.name}</span>
                  </div>
                  <span className={`text-[8px] md:text-[9px] font-black px-2 py-0.5 md:px-2.5 md:py-1 rounded-full ${activeSubcategory === sub.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                    {products.filter(p => p.subCategoryId === sub.id).length}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 md:mt-16 pt-8 md:pt-12 border-t border-gray-100">
              <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white border-2 border-orange-500 p-6 md:p-8 group">
                <Image fill src="/feature1.jpg" alt="Promo" className="object-cover opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10">
                  <span className="text-[8px] md:text-[9px] font-black text-white bg-orange-500 px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-widest mb-3 md:mb-4 inline-block shadow-lg">Special Offer</span>
                  <h3 className="text-lg md:text-[2rem] font-black mb-4 md:mb-6 leading-tight uppercase tracking-tighter">Get 30% Off</h3>
                  <button className="text-orange-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b-2 border-orange-500/30 pb-1 hover:border-orange-500 transition-all">Shop Now</button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-9">
          {filteredProductsList.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {filteredProductsList.map((product) => {
                const originalPrice = product.price / (1 - product.discount / 100);
                return (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => handleProductClick(product.slug)}
                  >
                    <div
                      className="relative aspect-square bg-[#F9FAFB] overflow-hidden transition-all duration-700"
                    >
                      {product.images?.[0] && (
                        <Image
                          fill
                          src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${product.images[0].url || product.images[0]}`}
                          alt={product.name}
                          className="object-contain p-4 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                          unoptimized
                        />
                      )}  {product.discount > 0 && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                          -{product.discount.toFixed(0)}%
                        </div>
                      )}

                      {/* Floating Actions for Desktop */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <button className="bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-orange-500 hover:text-white transition-all transform hover:scale-110">
                          <FiMaximize2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-0.5 text-yellow-500">
                          <GoStarFill size={10} />
                          <GoStarFill size={10} />
                          <GoStarFill size={10} />
                          <GoStarFill size={10} />
                          <GoStarFill size={10} className="text-gray-200" />
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                          4.9
                        </div>
                      </div>
                      <h4
                        className="mb-1.5 line-clamp-2 text-[#2D2D2D] group-hover:text-orange-500 transition-colors leading-tight h-[2.5em] overflow-hidden"
                      >
                        {product.name}
                      </h4>

                      {/* Reinforced Price Container for Alignment */}
                      <div className="flex flex-col mt-auto justify-end mb-3">
                        <p className="text-sm md:text-base font-black text-black leading-none">Rs.{formatPrice(product.price)}</p>
                        {product.discount > 0 ? (
                          <p className="text-[9px] text-gray-400 line-through mt-1 font-bold">Rs.{formatPrice(originalPrice)}</p>
                        ) : (
                          <div className="h-[14px]"></div> // Placeholder
                        )}
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          className="flex-1 border border-orange-500 text-orange-500 text-[8px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          <FiShoppingCart size={12} /> <span className="hidden sm:inline">Add</span>
                        </button>
                        <button
                          className="flex-1 bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-orange-600 transition-all shadow-lg active:scale-95 shadow-orange-500/20"
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
            <div className="py-32 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 mx-4">
              <h3 className="text-[1.5rem] md:text-[2rem] font-black text-gray-900 mb-6 leading-tight tracking-tighter">Stay in the Loop</h3>
            </div>
          )}

          {/* Pagination */}
          {filteredProductsList.length > 0 && (
            <div className="mt-20 md:mt-24 flex items-center justify-center gap-3 md:gap-4 px-4">
              <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border-2 border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 hover:border-black hover:text-black transition-all">PREV</button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl text-[10px] font-black transition-all ${page === 1 ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  {page}
                </button>
              ))}
              <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border-2 border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 hover:border-black hover:text-black transition-all">NEXT</button>
            </div>
          )}
        </main>
      </div>

      {/* Recommendations Section */}
      <div className="mt-40 pt-24 border-t border-gray-100 px-4 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 text-center md:text-left">
          <div className="w-full">
            <h3 className="text-[1.5rem] md:text-[2rem] font-black uppercase tracking-tighter mb-4 leading-none mx-auto md:mx-0">Explore Recommendations</h3>
            <p className="text-gray-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Handpicked products based on your interest</p>
          </div>
          <div className="hidden md:flex gap-4">
            <button className="w-14 h-14 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all"><FiChevronDown className="rotate-90 text-xl" /></button>
            <button className="w-14 h-14 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all"><FiChevronDown className="-rotate-90 text-xl" /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {recommendations.map(p => (
            <div key={p.id} className="group cursor-pointer" onClick={() => handleProductClick(p.slug)}>
              <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-[#F3F4FB] border border-gray-100 mb-6 transition-all duration-500 group-hover:shadow-xl">
                {p.images?.[0] && (
                  <Image
                    fill
                    src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${p.images[0].url || p.images[0]}`}
                    alt={p.name}
                    className="object-contain p-8 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                )}
              </div>
              <h4 className="text-[12px] md:text-base font-black truncate group-hover:text-orange-500 transition-colors uppercase tracking-tight mb-1">{p.name}</h4>
              <p className="text-lg md:text-xl font-black">Rs.{formatPrice(p.price)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section - Optimized for Mobile */}
      <div className="mx-4 mt-32 max-w-[1440px] md:mx-auto">
        <div className="bg-gray-50/50 border border-gray-100 rounded-[3rem] p-8 md:p-20 relative overflow-hidden group">
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h3 className="text-[1.5rem] md:text-[2rem] font-black text-black mb-6 leading-tight tracking-tighter uppercase">Ready for Updates?</h3>
            <p className="text-gray-400 mb-10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">Join our inner circle for early access and special discounts.</p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="YOUR EMAIL"
                className="flex-1 bg-white border border-gray-200 rounded-2xl py-4 md:py-5 px-6 md:px-8 text-black text-[10px] font-black tracking-widest focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
              <button className="bg-orange-500 text-white px-10 md:px-12 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                JOIN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal for Mobile */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[60] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
                <div className="w-12 h-1 bg-gray-200 rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
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
    </div >
  );
};

export default CategoryPage;
