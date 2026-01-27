'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ThreeDots } from 'react-loader-spinner';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../store/cartSlice';
import Image from 'next/image';
import { FiMaximize2, FiShoppingBag, FiStar } from 'react-icons/fi';
import { GoStarFill } from 'react-icons/go';

const DiscountedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products/discounted');
        setProducts(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching discounted products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (id) => {
    router.push(`/customer/pages/products/${id}`);
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    alert(`${product.name} has been added to the cart.`);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const calculateOriginalPrice = (price, discount) => {
    if (typeof price === 'number' && typeof discount === 'number') {
      return price - (price * (discount / 100));
    }
    return price;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ThreeDots
          height="80"
          width="80"
          radius="9"
          color="#f97316"
          ariaLabel="three-dots-loading"
          visible={true}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-8 pt-[20px] px-4">
      <h3 className="text-[1.5rem] md:text-[2rem] font-bold mb-6 text-gray-800">Offers</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {products.map((product) => {
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
                <div className="absolute top-3 left-3 z-20 bg-[#1E4C2F] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight shadow-md">
                  {product.discount > 0 ? `${product.discount.toFixed(0)}% OFF` : 'Sale'}
                </div>

                {/* Floating Icons */}
                <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-orange-500 hover:text-white transition-all transform hover:scale-110">
                    <FiMaximize2 size={14} className="mx-auto" />
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
                    {product.category?.name || 'Discounted'}
                  </p>
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                    <GoStarFill size={10} /> 4.9
                  </div>
                </div>

                <h4
                  className="text-sm font-bold mb-2 line-clamp-2 text-[#2D2D2D] group-hover:text-orange-500 transition-colors leading-snug h-[2.8em] overflow-hidden"
                >
                  {product.name}
                </h4>

                {/* Reinforced Price Container for Alignment */}
                <div className="flex flex-col mt-auto justify-end">
                  <p className="text-base md:text-xl font-black text-black leading-none">Rs.{formatPrice(calculateOriginalPrice(product.price, product.discount))}</p>
                  {product.discount > 0 ? (
                    <p className="text-[9px] text-gray-400 line-through mt-1 font-bold">Rs.{formatPrice(product.price)}</p>
                  ) : (
                    <div className="h-[12px]"></div> // Placeholder
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiscountedProducts;
