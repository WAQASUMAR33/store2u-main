'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ThreeDots } from 'react-loader-spinner';
import { useDispatch } from 'react-redux';
import { addToCart, setCart } from '../../../store/cartSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiChevronRight, FiSearch, FiShoppingCart, FiChevronDown, FiMaximize2, FiShoppingBag, FiFilter } from 'react-icons/fi';
import { GoStarFill } from 'react-icons/go';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
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
        <ThreeDots height="60" width="60" color="#F25C2C" />
      </div>
    );
  }

  const displayProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 leading-none">
              Explore <span className="text-[#F25C2C]">Collection</span>
            </h1>

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
        <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
          <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F25C2C] hover:text-[#F25C2C] transition-colors shrink-0">
            <FiFilter />
          </button>
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
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

                    <h3
                      className="text-sm font-bold mb-2 line-clamp-2 text-[#2D2D2D] group-hover:text-[#F25C2C] transition-colors leading-snug h-[2.8em] overflow-hidden"
                    >
                      {product.name}
                    </h3>

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
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tighter">Stay in the Loop</h2>
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
    </div>
  );
};

export default AllProducts;
