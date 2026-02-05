'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ThreeDots } from 'react-loader-spinner';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import Image from 'next/image';
import { FiChevronDown, FiShoppingCart, FiFilter, FiX, FiMaximize2, FiShoppingBag, FiDownload } from 'react-icons/fi';
import DigitalCheckoutModal from './DigitalCheckoutModal';
import { GoStarFill } from "react-icons/go";

const TopRatedProducts = () => {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(12);
  const [loading, setLoading] = useState(true);

  // Filter Data State
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  // Active Filter State
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    color: '',
    size: '',
    priceRange: '',
  });

  // UI State
  const [openDropdown, setOpenDropdown] = useState(null);
  const [gridCols, setGridCols] = useState(5);

  const [mobileGridCols, setMobileGridCols] = useState(2);
  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState(false);
  const [selectedDigitalProduct, setSelectedDigitalProduct] = useState(null);

  const router = useRouter();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  // Click outside listener for categories dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, catsRes, colorsRes, sizesRes] = await Promise.all([
          axios.get('/api/products/topRated'),
          axios.get('/api/categories'),
          axios.get('/api/colors'),
          axios.get('/api/sizes')
        ]);

        const fetchedProducts = (productsRes.data.data || []).map(p => ({
          ...p,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
        }));

        setProducts(fetchedProducts);
        setCategories(catsRes.data.data || []);
        setColors(colorsRes.data || []);
        setSizes(sizesRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error('FETCH DATA ERROR:', error);
        if (error.response) {
          console.error('Error Response Data:', error.response.data);
          console.error('Error Status:', error.response.status);
          console.error('Error Headers:', error.response.headers);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Use loose equality or string conversion to handle type mismatches (numeric DB ID vs string state)
      if (activeFilters.category && product.categoryId != activeFilters.category) return false;
      if (activeFilters.color && !product.colors?.some(c => c.name === activeFilters.color || c === activeFilters.color)) return false;
      if (activeFilters.size && !product.sizes?.some(s => s.name === activeFilters.size || s === activeFilters.size)) return false;
      if (activeFilters.priceRange) {
        const [min, max] = activeFilters.priceRange.split('-').map(Number);
        if (product.price < min || (max && product.price > max)) return false;
      }
      return true;
    });
  }, [products, activeFilters]);

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? '' : value,
      // Clear other filters when category changes to ensure clean single-category view
      ...(type === 'category' ? { color: '', size: '', priceRange: '' } : {})
    }));
    setOpenDropdown(null);
  };

  const handleProductClick = (slug) => {
    router.push(`/customer/pages/products/${slug}`);
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    dispatch(addToCart(product));
  };

  const handleBuyNow = (product, e) => {
    if (e) e.stopPropagation();
    dispatch(addToCart(product));
    router.push('/customer/pages/cart');
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
      <div className="flex items-center justify-center min-h-[40vh]">
        <ThreeDots height="60" width="60" color="#f97316" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-12">
      <div className="flex flex-col items-center mb-10">
        <h3 className="text-[1.5rem] md:text-[2rem] font-black uppercase tracking-tighter mb-4">Top Rated</h3>
        <div className="h-1.5 w-24 bg-orange-500 rounded-full shadow-lg shadow-orange-500/20"></div>
      </div>

      {/* Modern Filter Bar */}
      <div className="flex items-center justify-between gap-4 mb-16 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
          {/* Clickable Categories Dropdown */}
          <div className="relative w-full md:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-3 px-8 py-2.5 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isDropdownOpen || activeFilters.category ? 'border-orange-500 text-orange-500' : 'text-gray-400 hover:border-black hover:text-black'
                }`}
            >
              <span>{activeFilters.category ? categories.find(c => c.id == activeFilters.category)?.name : 'All Categories'}</span>
              <FiChevronDown className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 md:left-auto md:right-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => {
                      handleFilterChange('category', '');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-6 py-3 text-[11px] font-black uppercase tracking-wider transition-colors border-b border-gray-50 ${!activeFilters.category ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50 hover:text-orange-600'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        handleFilterChange('category', c.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-6 py-3 text-[11px] font-black uppercase tracking-wider transition-colors border-b border-gray-50 last:border-0 ${activeFilters.category == c.id ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50 hover:text-orange-600'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {Object.values(activeFilters).some(Boolean) && (
              <button
                onClick={() => setActiveFilters({ category: '', color: '', size: '', priceRange: '' })}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-700 transition-colors"
              >
                Clear Filters <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Grid Switcher */}
        <div className="hidden md:flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl">
          <button
            onClick={() => setGridCols(4)}
            className={`p-2.5 rounded-xl transition-all ${gridCols === 4 ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            title="4 Columns"
          >
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="bg-current rounded-[1px]"></div>
              <div className="bg-current rounded-[1px]"></div>
              <div className="bg-current rounded-[1px]"></div>
              <div className="bg-current rounded-[1px]"></div>
            </div>
          </button>
          <button
            onClick={() => setGridCols(5)}
            className={`p-2.5 rounded-xl transition-all ${gridCols === 5 ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            title="5 Columns"
          >
            <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
              <div className="bg-current rounded-[1px]"></div>
              <div className="bg-current rounded-[1px]"></div>
              <div className="bg-current rounded-[1px]"></div>
              <div className="bg-current rounded-[1px]"></div>
              <div className="bg-current rounded-[1px]"></div>
              <div className="bg-current rounded-[1px]"></div>
            </div>
          </button>
        </div>

        {/* Mobile Grid Switcher */}
        <div className="flex md:hidden items-center gap-2 bg-gray-50 p-1 rounded-xl">
          <button
            onClick={() => setMobileGridCols(1)}
            className={`p-2 rounded-lg transition-all ${mobileGridCols === 1 ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'}`}
          >
            <div className="w-4 h-4 border-2 border-current rounded-[2px]"></div>
          </button>
          <button
            onClick={() => setMobileGridCols(2)}
            className={`p-2 rounded-lg transition-all ${mobileGridCols === 2 ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'}`}
          >
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="border border-current rounded-[1px]"></div>
              <div className="border border-current rounded-[1px]"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Product Grid - Tissot Style */}
      <div className={`grid grid-cols-${mobileGridCols} sm:grid-cols-2 lg:grid-cols-${gridCols === 4 ? '4' : '5'} xl:grid-cols-${gridCols} gap-x-6 gap-y-12 transition-all duration-500`}>
        {filteredProducts.slice(0, visibleProducts).map((product) => {
          const originalPrice = calculateOriginalPrice(product.price, product.discount);
          return (
            <div
              key={product.id}
              className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => handleProductClick(product.slug)}
            >
              <div
                className="relative aspect-square bg-[#F3F4FB] overflow-hidden transition-all duration-500"
              >
                {/* Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-3 left-3 z-20 bg-[#1E4C2F] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight">
                    {product.discount.toFixed(0)}% OFF
                  </div>
                )}

                {/* Floating Icons */}
                <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-orange-500 hover:text-white transition-all transform hover:scale-110">
                    <FiMaximize2 size={14} />
                  </button>
                  <button
                    className={`bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-orange-500 hover:text-white transition-all transform hover:scale-110 ${product.productType === 'digital' ? 'text-blue-600' : ''}`}
                    onClick={(e) => {
                      if (product.productType === 'digital') {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedDigitalProduct(product);
                        setIsDigitalModalOpen(true);
                      } else {
                        handleAddToCart(product, e);
                      }
                    }}
                    title={product.productType === 'digital' ? "Pay to Download" : "Add to Cart"}
                  >
                    {product.productType === 'digital' ? <FiDownload size={14} /> : <FiShoppingBag size={14} />}
                  </button>
                </div>

                {product.images?.[0] && (
                  <Image
                    fill
                    src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${product.images[0].url || product.images[0]}`}
                    alt={product.name}
                    className="object-contain p-8 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                )}
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[60%]">
                    {product.category?.name || 'Top Rated'}
                  </p>
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                    <GoStarFill size={10} /> 4.9
                  </div>
                </div>

                <h3
                  className="text-sm font-bold mb-2 line-clamp-2 text-[#2D2D2D] group-hover:text-orange-500 transition-colors leading-snug h-[2.8em] overflow-hidden"
                >
                  {product.name}
                </h3>

                {/* Reinforced Price Container for Alignment */}
                <div className="flex flex-col mt-auto justify-end">
                  <p className="text-base font-black text-black leading-none">Rs.{formatPrice(product.price)}</p>
                  {product.discount > 0 ? (
                    <p className="text-[9px] text-gray-400 line-through mt-1 font-bold">Rs.{formatPrice(originalPrice)}</p>
                  ) : (
                    <div className="h-[12px]"></div> // Placeholder
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {visibleProducts < filteredProducts.length && (
        <div className="text-center mt-24">
          <button
            onClick={() => setVisibleProducts(prev => prev + 10)}
            className="px-12 py-5 bg-white text-orange-500 border-2 border-orange-500 text-xs font-black uppercase tracking-[0.3em] hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-orange-500/10"
          >
            Load More Collection
          </button>
        </div>
      )}


      {/* Digital Payment Modal */}
      {selectedDigitalProduct && (
        <DigitalCheckoutModal
          isOpen={isDigitalModalOpen}
          onRequestClose={() => setIsDigitalModalOpen(false)}
          product={selectedDigitalProduct}
          onSuccess={() => {
            setIsDigitalModalOpen(false);
            // Optionally redirect to product page
            router.push(`/customer/pages/products/${selectedDigitalProduct.slug}`);
          }}
        />
      )}
    </div>
  );
};

export default TopRatedProducts;
