'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ThreeDots } from 'react-loader-spinner';
import { useDispatch } from 'react-redux';
import { addToCart, setCart } from '../../../store/cartSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiChevronRight, FiSearch, FiShoppingCart, FiChevronDown, FiMaximize2, FiShoppingBag } from 'react-icons/fi';
import { GoStarFill } from 'react-icons/go';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
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
      setRecommendations(fetchedProducts.slice(0, 4));
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
        <ThreeDots height="60" width="60" color="#000" />
      </div>
    );
  }

  const displayProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen text-[#1A1A1A] font-sans">
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            fill
            src="/home4.jpg"
            alt="Shop Hero"
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-8xl md:text-[160px] font-black text-white/10 uppercase tracking-tighter select-none leading-none">Shop</h1>
          <div className="flex items-center justify-center gap-4 text-white font-bold text-xs md:text-sm mt-4 tracking-widest">
            <span className="cursor-pointer hover:text-blue-400" onClick={() => router.push('/')}>HOME</span>
            <FiChevronRight className="text-white/40" />
            <span className="text-white/60 uppercase">ALL PRODUCTS</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Give All You Need</h2>

          <div className="flex w-full md:w-auto items-center bg-gray-50 rounded-full pl-6 overflow-hidden border border-gray-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-black/5">
            <FiSearch className="text-gray-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search a product..."
              className="bg-transparent border-none focus:ring-0 text-sm py-4 w-full md:w-80 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="bg-black text-white px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shrink-0"
              onClick={() => fetchProducts(searchQuery)}
            >
              Search
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-16 overflow-x-auto pb-4 no-scrollbar">
          {['All', 'New Release', 'Popularity', 'Best Seller', 'Sale'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-black text-white shadow-xl shadow-black/10' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Product Grid - Tissot Style */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {displayProducts.map(product => {
              const originalPrice = calculateOriginalPrice(product.price, product.discount);
              return (
                <div key={product.id} className="group flex flex-col">
                  <div
                    className="relative aspect-square bg-[#F3F4FB] rounded-[2rem] overflow-hidden mb-6 transition-all duration-500 group-hover:shadow-2xl cursor-pointer"
                    onClick={() => handleProductClick(product.slug)}
                  >
                    {/* Badge */}
                    {product.discount > 0 && (
                      <div className="absolute top-4 left-4 z-20 bg-[#1E4C2F] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tight shadow-md">
                        {product.discount.toFixed(0)}% OFF
                      </div>
                    )}

                    {/* Floating Icons */}
                    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <button className="bg-white p-2.5 rounded-full shadow-lg text-gray-700 hover:bg-black hover:text-white transition-all transform hover:scale-110">
                        <FiMaximize2 size={18} />
                      </button>
                      <button
                        className="bg-white p-2.5 rounded-full shadow-lg text-gray-700 hover:bg-black hover:text-white transition-all transform hover:scale-110"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        <FiShoppingBag size={18} />
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

                  <div className="px-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[60%]">
                        {product.category?.name || 'Shop Collection'}
                      </p>
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        <GoStarFill size={10} /> 4.9
                      </div>
                    </div>

                    <h3
                      className="text-base md:text-lg font-bold mb-2 line-clamp-2 text-[#2D2D2D] group-hover:text-blue-600 transition-colors cursor-pointer leading-snug h-[2.8em]"
                      onClick={() => handleProductClick(product.slug)}
                    >
                      {product.name}
                    </h3>

                    <div className="flex flex-col mb-4">
                      <p className="text-xl font-bold text-black leading-none">Rs.{formatPrice(product.price)}</p>
                      {product.discount > 0 && (
                        <p className="text-xs text-gray-400 line-through mt-1">Rs.{formatPrice(originalPrice)}</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        className="flex-1 border-2 border-black text-black text-[9px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        <FiShoppingCart size={14} /> Cart
                      </button>
                      <button
                        className="flex-1 bg-black text-white text-[9px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
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
          <div className="py-32 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-black uppercase tracking-[0.2em]">No products found</p>
          </div>
        )}

        {/* Pagination placeholder */}
        {displayProducts.length > 0 && (
          <div className="mt-24 flex items-center justify-center gap-4">
            <button className="w-12 h-12 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-xs font-black text-gray-400 hover:border-black hover:text-black transition-all">PREV</button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${page === 1 ? 'bg-black text-white shadow-xl shadow-black/20' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                {page}
              </button>
            ))}
            <button className="w-12 h-12 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-xs font-black text-gray-400 hover:border-black hover:text-black transition-all">NEXT</button>
          </div>
        )}

        {/* Recommendations Section */}
        <div className="mt-40 pt-24 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none">Explore Recommendations</h2>
              <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Handpicked products based on your interest</p>
            </div>
            <div className="flex gap-4">
              <button className="w-14 h-14 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all"><FiChevronDown className="rotate-90 text-xl" /></button>
              <button className="w-14 h-14 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all"><FiChevronDown className="-rotate-90 text-xl" /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {recommendations.map(p => (
              <div key={p.id} className="group cursor-pointer" onClick={() => handleProductClick(p.slug)}>
                <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-[#F3F4FB] border border-gray-100 mb-6 transition-all duration-500 group-hover:shadow-xl">
                  {p.images?.[0] && (
                    <Image
                      fill
                      src={`${p.images[0].url ? process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL + '/' + p.images[0].url : process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL + '/' + p.images[0]}`}
                      alt={p.name}
                      className="object-contain p-6 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                  )}
                </div>
                <h4 className="text-base font-black truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight mb-1">{p.name}</h4>
                <p className="text-xl font-black">Rs.{formatPrice(p.price)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section - Smaller, White Background */}
        <div className="mt-32 bg-gray-50/50 border border-gray-100 rounded-[3rem] p-12 md:p-20 relative overflow-hidden group text-center">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-black mb-6 leading-tight tracking-tighter">Ready to Get Our New Stuff?</h2>
            <p className="text-gray-400 mb-12 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">Join our inner circle for early access and special discounts.</p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                className="flex-1 bg-white border border-gray-200 rounded-2xl py-5 px-8 text-black text-[10px] font-black tracking-widest focus:ring-2 focus:ring-black/5 transition-all outline-none"
              />
              <button className="bg-black text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl">
                JOIN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
