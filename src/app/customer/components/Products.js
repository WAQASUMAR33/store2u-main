'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight, FiHeart, FiMaximize2, FiShoppingBag, FiShoppingCart } from 'react-icons/fi';
import { GoStarFill } from 'react-icons/go';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { ThreeDots } from 'react-loader-spinner';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ProductCardShimmer, GridShimmer } from './Shimmer';

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();
  const [productIndices, setProductIndices] = useState({});
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const categoryResponse = await axios.get('/api/categories');
        const categoriesData = categoryResponse.data.data || [];
        setCategories(categoriesData);

        const subcategoryResponse = await axios.get('/api/subcategories');
        const subcategoriesData = subcategoryResponse.data.data || [];
        setSubcategories(subcategoriesData);

        const productsResponse = await axios.get('/api/products');
        const productsData = productsResponse.data || [];
        setProducts(productsData);

        const initialIndices = {};
        categoriesData.forEach((category) => {
          initialIndices[category.slug] = 0;
        });
        setProductIndices(initialIndices);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories and products:', error);
        setLoading(false);
      }
    };

    fetchCategoriesAndSubcategories();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const scrollRight = (categorySlug, categoryProducts) => {
    setProductIndices((prevIndices) => {
      const productsPerView = windowWidth < 640 ? 2 : 4;
      const nextIndex = Math.min(
        prevIndices[categorySlug] + 1,
        categoryProducts.length - productsPerView
      );
      return { ...prevIndices, [categorySlug]: nextIndex };
    });
  };

  const scrollLeft = (categorySlug) => {
    setProductIndices((prevIndices) => {
      const prevIndex = Math.max(prevIndices[categorySlug] - 1, 0);
      return { ...prevIndices, [categorySlug]: prevIndex };
    });
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

  const getImageUrl = (url) => {
    if (!url) return '/placeholder-image.png';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL || '';
    return baseUrl ? `${baseUrl}/${url}` : url;
  };

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <ThreeDots height="60" width="60" color="#f97316" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {categories.map((category) => {
          const categorySubcategories = subcategories.filter(
            (subcat) => subcat.categoryId === category.id
          );

          const categoryProducts = products.filter((product) =>
            categorySubcategories.some(
              (subcat) => subcat.slug === product.subcategorySlug
            )
          );

          if (categoryProducts.length === 0) {
            return null;
          }

          const currentProductIndex = productIndices[category.slug] || 0;
          const productsPerView = windowWidth < 640 ? 2 : 4;
          const visibleProducts = categoryProducts.slice(
            currentProductIndex,
            currentProductIndex + productsPerView
          );

          return (
            <div key={category.slug} className="mb-24">
              <div className="flex justify-between items-end mb-10">
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                  {category.name}
                </h3>
                <Link
                  href={`/customer/pages/category/${category.slug}`}
                  className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                  View All {category.name}
                </Link>
              </div>

              <div className="flex flex-col lg:grid lg:grid-cols-[240px_1fr] gap-8 items-start">
                {/* Category Banner */}
                <div className="w-full lg:sticky lg:top-32 hidden lg:block">
                  <Link href={`/customer/pages/category/${category.slug}`}>
                    {category.imageUrl ? (
                      <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl group">
                        <Image
                          fill
                          src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${category.imageUrl}`}
                          alt={category.name}
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                          <h4 className="text-white text-2xl font-black uppercase mb-3 leading-tight">{category.name}</h4>
                          <span className="inline-block w-fit px-6 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all transform hover:scale-110 active:scale-95">
                            Explore Now
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-[400px] bg-gray-100 rounded-[3rem] flex items-center justify-center text-gray-300">
                        <span className="font-black text-2xl uppercase tracking-tighter">{category.name}</span>
                      </div>
                    )}
                  </Link>
                </div>

                {/* Products Carousel */}
                <div className="relative w-full">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {visibleProducts.map((product) => {
                      const originalPrice = calculateOriginalPrice(product.price, product.discount);
                      return (
                        <div key={product.slug} className="group flex flex-col">
                          <div
                            className="relative bg-[#F3F4FB] rounded-[2rem] overflow-hidden aspect-square cursor-pointer transition-all duration-500 group-hover:shadow-2xl"
                            onClick={() => handleProductClick(product.slug)}
                          >
                            {/* Discount Badge */}
                            {product.discount > 0 && (
                              <div className="absolute top-4 left-4 z-20 bg-[#1E4C2F] text-white text-[9px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tight shadow-lg">
                                {product.discount.toFixed(0)}% OFF
                              </div>
                            )}

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

                            {/* Image */}
                            {product.images?.[0] ? (
                              <Image
                                fill
                                src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${product.images[0].url || product.images[0]}`}
                                alt={product.name}
                                className="object-contain p-10 md:p-14 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                                unoptimized
                              />
                            ) : (
                              <div className="text-gray-400 text-xs">No Image</div>
                            )}
                          </div>

                          {/* Card Details */}
                          <div className="px-2 mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[60%]">
                                {category.name}
                              </p>
                              <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold">
                                <GoStarFill size={10} /> 4.9
                              </div>
                            </div>

                            <h3
                              className="text-sm md:text-base font-bold text-[#2D2D2D] mb-2 leading-snug cursor-pointer group-hover:text-orange-500 transition-all line-clamp-2 h-[2.8em] overflow-hidden"
                              onClick={() => handleProductClick(product.slug)}
                            >
                              {product.name}
                            </h3>

                            {/* Reinforced Price Container for Alignment */}
                            <div className="flex flex-col mb-4 md:mb-6 min-h-[45px] md:min-h-[55px] justify-center">
                              <p className="text-base md:text-lg font-black text-black leading-none">Rs.{formatPrice(product.price)}</p>
                              {product.discount > 0 ? (
                                <p className="text-[10px] text-gray-400 line-through mt-1">Rs.{formatPrice(originalPrice)}</p>
                              ) : (
                                <div className="h-[12px] md:h-[16px]"></div> // Placeholder
                              )}
                            </div>

                            <div className="h-4"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation Arrows */}
                  <div className="absolute top-1/2 -left-4 -right-4 -translate-y-[100px] flex justify-between pointer-events-none z-40 hidden md:flex">
                    <button
                      className="bg-white pointer-events-auto border border-gray-100 shadow-2xl rounded-full p-4 hover:bg-black hover:text-white transition-all disabled:opacity-0"
                      onClick={() => scrollLeft(category.slug)}
                      disabled={currentProductIndex === 0}
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    <button
                      className="bg-white pointer-events-auto border border-gray-100 shadow-2xl rounded-full p-4 hover:bg-black hover:text-white transition-all disabled:opacity-0"
                      onClick={() => scrollRight(category.slug, categoryProducts)}
                      disabled={currentProductIndex + productsPerView >= categoryProducts.length}
                    >
                      <FiChevronRight size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Products;
