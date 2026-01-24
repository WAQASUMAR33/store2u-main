'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import Image from 'next/image';
import { FiShoppingCart, FiChevronRight, FiMaximize2, FiShoppingBag } from 'react-icons/fi';
import { GoStarFill } from 'react-icons/go';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(10);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products/newArrivals');
        const data = (response.data.data || []).map(p => ({
          ...p,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
        }));
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">New Arrivals</h2>
          <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] max-w-lg">Discover the latest additions to our curated collection of premium products.</p>
        </div>
        <button
          className="flex items-center gap-3 text-xs font-black uppercase tracking-widest group hover:text-orange-600 transition-colors"
          onClick={() => router.push('/customer/pages/allproducts')}
        >
          View More New Stuff <FiChevronRight className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-6 gap-y-12">
        {products.slice(0, visibleProducts).map((product) => {
          const originalPrice = calculateOriginalPrice(product.price, product.discount);
          return (
            <div key={product.id} className="group flex flex-col">
              <div
                className="relative aspect-square bg-[#F3F4FB] rounded-[2rem] overflow-hidden mb-6 transition-all duration-500 group-hover:shadow-2xl cursor-pointer"
                onClick={() => handleProductClick(product.slug)}
              >
                {/* Badge */}
                <div className="absolute top-4 left-4 z-20 bg-[#1E4C2F] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tight shadow-md">
                  {product.discount > 0 ? `${product.discount.toFixed(0)}% OFF` : 'New'}
                </div>

                {/* Floating Icons */}
                <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="bg-white p-2 md:p-2.5 rounded-full shadow-lg text-gray-700 hover:bg-orange-500 hover:text-white transition-all transform hover:scale-110">
                    <FiMaximize2 size={16} />
                  </button>
                  <button
                    className="bg-white p-2 md:p-2.5 rounded-full shadow-lg text-gray-700 hover:bg-orange-500 hover:text-white transition-all transform hover:scale-110"
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    <FiShoppingBag size={16} />
                  </button>
                </div>

                {product.images?.[0] && (
                  <Image
                    fill
                    src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${product.images[0].url || product.images[0]}`}
                    alt={product.name}
                    className="object-contain p-10 md:p-14 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                )}
              </div>

              <div className="px-2">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[60%]">
                    {product.category?.name || 'New Arrival'}
                  </p>
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold">
                    <GoStarFill size={10} /> 4.9
                  </div>
                </div>

                <h3
                  className="text-sm md:text-base font-bold mb-2 line-clamp-2 text-[#2D2D2D] group-hover:text-orange-500 transition-colors cursor-pointer leading-snug h-[2.8em] overflow-hidden"
                  onClick={() => handleProductClick(product.slug)}
                >
                  {product.name}
                </h3>

                {/* Reinforced Price Container for Alignment */}
                <div className="flex flex-col mb-4 md:mb-6 min-h-[45px] md:min-h-[55px] justify-center">
                  <p className="text-base md:text-xl font-black text-black leading-none">Rs.{formatPrice(product.price)}</p>
                  {product.discount > 0 ? (
                    <p className="text-[9px] md:text-xs text-gray-400 line-through mt-1.5 font-bold">Rs.{formatPrice(originalPrice)}</p>
                  ) : (
                    <div className="h-[12px] md:h-[16px]"></div> // Placeholder
                  )}
                </div>

                <div className="h-4"></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default NewArrivals;
