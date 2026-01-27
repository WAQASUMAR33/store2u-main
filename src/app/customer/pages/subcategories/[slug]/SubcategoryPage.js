'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiFilter, FiX, FiPlus, FiChevronRight, FiSearch } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';

const SubcategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [highestPrice, setHighestPrice] = useState(0);
  const [sortOption, setSortOption] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [tempSortOption, setTempSortOption] = useState("newest");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const fetchProductsAndSubcategory = async () => {
      setIsLoading(true);
      try {
        const productsResponse = await axios.get('/api/products');
        setProducts(productsResponse.data);

        const filtered = productsResponse.data.filter(product => product.subcategorySlug === slug);
        setFilteredProducts(filtered);

        const maxProductPrice = Math.max(...filtered.map(product => product.price), 0);
        setHighestPrice(maxProductPrice);

        const subcategoryResponse = await axios.get(`/api/subcatdetail/${slug}`);
        if (subcategoryResponse.data && subcategoryResponse.data.status) {
          setSubcategory(subcategoryResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching subcategory or products data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsAndSubcategory();
  }, [slug]);

  const handleProductClick = (productSlug) => {
    router.push(`/customer/pages/products/${productSlug}`);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleFilter = () => {
    const filtered = products
      .filter(product => {
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        const matchesSubcategory = product.subcategorySlug === slug;

        const isTopRated = product.rating >= 4.5;
        const isOnSale = product.discount > 0;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "top-rated" && isTopRated) ||
          (statusFilter === "on-sale" && isOnSale);

        return matchesPrice && matchesSubcategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOption === "price-asc") return a.price - b.price;
        if (sortOption === "price-desc") return b.price - a.price;
        if (sortOption === "name-asc") return a.name.localeCompare(b.name);
        if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      });
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [minPrice, maxPrice, sortOption, statusFilter, products]);

  const handleSort = (option) => {
    let sortedProducts = [...filteredProducts];
    if (option === "A-Z") {
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === "Z-A") {
      sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === "Price Low to High") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (option === "Price High to Low") {
      sortedProducts.sort((a, b) => b.price - a.price);
    }
    setFilteredProducts(sortedProducts);
    setSortOption(option);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ThreeDots height="80" width="80" radius="9" color="#f97316" ariaLabel="three-dots-loading" visible={true} />
      </div>
    );
  }

  return (
    <div className="container mx-auto bg-white px-4 py-8">
      <h3 className="text-[1.5rem] md:text-[2rem] font-bold mb-6 text-gray-800">
        {subcategory ? subcategory.name : 'No subcategory found'}
      </h3>

      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-gray-50/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100">
        {/* Price Filter */}
        <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
            <span className="text-xs font-black uppercase tracking-widest text-gray-900">Price Range</span>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
              className="w-20 bg-transparent border-none focus:ring-0 text-xs font-bold text-center placeholder:text-gray-300 outline-none"
              placeholder="Min"
            />
            <div className="w-4 h-px bg-gray-200"></div>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 0)}
              className="w-20 bg-transparent border-none focus:ring-0 text-xs font-bold text-center placeholder:text-gray-300 outline-none"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={() => {
              setTempSortOption(sortOption);
              setTempStatusFilter(statusFilter);
              setShowFilters(true);
            }}
            className="flex items-center justify-center gap-3 bg-white text-[#f97316] px-6 py-3.5 rounded-2xl border border-gray-100 active:scale-95 transition-all shadow-sm group hover:border-orange-500/20"
          >
            <FiFilter size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest px-2 border-l border-gray-100">Open Filters</span>
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const discountedPrice = product.discount
              ? (product.price - (product.price * product.discount / 100)).toFixed(2)
              : null;
            return (
              <div
                key={product.id}
                className="bg-white shadow-md rounded-sm cursor-pointer border border-gray-300 relative h-[20.5em] w-full min-w-[150px]"
                onClick={() => handleProductClick(product.slug)}
              >
                {product.discount && (
                  <div className="absolute z-40 top-0 left-0 bg-red-100 text-red-600 font-normal text-sm px-1 py-0.5">
                    {product.discount.toFixed(2)}% OFF
                  </div>
                )}
                <div className="relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      className="h-[220px] w-full mb-4 rounded bg-white overflow-hidden"
                    >
                      <Image
                        width={300}
                        height={220}
                        src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${product.images[0].url}`}
                        alt={product.name}
                        className="h-[220px] w-full object-contain"
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </motion.div>
                  ) : (
                    <div className="h-[220px] w-full bg-gray-200 mb-4 rounded flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="px-2">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      {product.discount ? (
                        <div className="flex items-center justify-center gap-3 flex-row-reverse">
                          <p className="text-xs font-normal text-gray-700 line-through">
                            Rs.{formatPrice(product.price)}
                          </p>
                          <p className="text-md font-bold text-red-700">
                            Rs.{formatPrice(discountedPrice)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-md font-bold text-gray-700">
                          Rs.{formatPrice(product.price)}
                        </p>
                      )}
                    </div>
                  </div>
                  <h4
                    className="text-sm font-normal text-gray-800 overflow-hidden hover:underline hover:text-blue-400 cursor-pointer"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      maxHeight: '3em',
                    }}
                    onClick={() => handleProductClick(product.slug)}
                  >
                    {product.name.toUpperCase()}
                  </h4>
                </div>
              </div>
            );
          })
        ) : (
          <p>No products found for this subcategory.</p>
        )}
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

export default SubcategoryPage;
