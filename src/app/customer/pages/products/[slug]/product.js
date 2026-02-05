'use client';

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import DigitalCheckoutModal from '../../../components/DigitalCheckoutModal';
import DownloadProgressModal from '../../../components/DownloadProgressModal';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../../../../store/cartSlice';
import { ThreeDots } from 'react-loader-spinner';
import { FiMinus, FiPlus, FiShoppingBag, FiMaximize2, FiChevronDown, FiInfo, FiHeart, FiCalendar, FiTruck, FiMapPin, FiChevronUp, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { FaShare, FaTimes, FaFacebookF, FaTwitter, FaPinterestP, FaRegHeart } from 'react-icons/fa';
import { GoStarFill } from "react-icons/go";
import { MdStars } from "react-icons/md";
import Image from 'next/image';

// Lazy load heavy components
const Modal = dynamic(() => import('react-modal'), {
  ssr: false,
  loading: () => null,
});

/**
 * Product Page Component
 */
const ProductPage = ({ productData }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const prevcart = useSelector(state => state.cart.items);

  // State management
  const [product, setProduct] = useState(productData?.product || null);
  const [relatedProducts, setRelatedProducts] = useState(productData?.relatedProducts || []);
  const [error, setError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [categories, setCategories] = useState([]); // All categories for the navigation row
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState('info'); // info, delivery, reviews

  // Review State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [userName, setUserName] = useState(null);
  const [linkShare, setLinkShare] = useState(false);

  // Digital Product State
  const isDigital = useMemo(() => product?.productType === 'digital' || product?.type === 'digital', [product]);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isDigitalPaymentOpen, setIsDigitalPaymentOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeDownloadUrl, setActiveDownloadUrl] = useState('');

  // Check purchase status
  useEffect(() => {
    if (isDigital && typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      if (userId && product?.id) {
        axios.post('/api/orders/check-purchase', { userId, productId: product.id })
          .then(res => {
            if (res.data.purchased) setIsPurchased(true);
          })
          .catch(err => console.error("Error checking purchase", err));
      }
    }
  }, [isDigital, product]);

  const handleDownload = () => {
    if (product?.digitalData) {
      try {
        const data = typeof product.digitalData === 'string' ? JSON.parse(product.digitalData) : product.digitalData;
        const fileUrl = data.files?.[0]?.url;
        if (fileUrl) {
          const downloadUrl = getFileUrl(fileUrl);
          setActiveDownloadUrl(downloadUrl);
          setIsDownloading(true);
        } else {
          toast.error("Download link not found.");
        }
      } catch (e) {
        console.error("Error parsing digital data", e);
        toast.error("Process error.");
      }
    }
  };

  const onDownloadComplete = () => {
    // Revert button to "Pay Now" logic
    setIsPurchased(false);
    setIsDownloading(false);

    // Trigger actual download via the proxy
    const filename = product?.name || 'download';
    const proxyUrl = `/api/download?url=${encodeURIComponent(activeDownloadUrl)}&filename=${encodeURIComponent(filename)}`;

    // Using window.location.assign for better reliability with timer-based triggers
    window.location.assign(proxyUrl);
  };

  // Helper to resolve file URL (reuses image logic or separate)
  const getFileUrl = (url) => {
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${url}`;
  };

  // Fetch all categories for the navigation row
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        if (response.data.status) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Early check
  useEffect(() => {
    if (!productData && !product && !loading) {
      setError('Product data is not available.');
    }
  }, [productData, product, loading]);

  // User Name
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserName(localStorage.getItem('userName'));
    }
  }, []);

  const productLink = useMemo(() => {
    if (typeof window !== 'undefined' && product?.slug) {
      return `${window.location.origin}/customer/pages/products/${product.slug}`;
    }
    return '';
  }, [product?.slug]);

  // Init Data
  useEffect(() => {
    if (productData?.product) {
      setProduct(productData.product);
      setRelatedProducts(productData.relatedProducts || []);
      if (productData.colors) setColors(Array.isArray(productData.colors) ? productData.colors : []);
      if (productData.sizes) setSizes(Array.isArray(productData.sizes) ? productData.sizes : []);
      setError(null);
    }
  }, [productData]);

  // Fetch logic if missing product data (simplified for brevity as we focus on UI)
  useEffect(() => {
    if (!product?.slug || productData?.product) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${product.slug}`);
        if (response.data?.data) {
          const { product: p, relatedProducts: rp, colors: c, sizes: s } = response.data.data;
          setProduct(p);
          setRelatedProducts(rp || []);
          setColors(c || []);
          setSizes(s || []);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchProduct();
  }, [product?.slug]);

  // Review Fetch logic
  useEffect(() => {
    if (!product?.id) return;
    setTimeout(async () => {
      try {
        const res = await axios.get(`/api/getreviews?productId=${product.id}`);
        if (res.data?.reviews) setReviews(res.data.reviews);
      } catch (e) { }
    }, 500);
  }, [product?.id]);


  // Helper Functions
  const getImageUrl = useCallback((url) => {
    if (!url) return '/placeholder-image.png';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL || '';
    return baseUrl ? `${baseUrl}/${url}` : url;
  }, []);

  const shouldUnoptimize = useCallback((url) => {
    return (url || '').includes('data.tascpa.ca');
  }, []);

  const formatPrice = (price) => Number(price || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 });

  const calculateOriginalPrice = (price, discount) => {
    const p = Number(price) || 0;
    const d = Number(discount) || 0;
    return p - (p * d / 100);
  };

  const handleThumbnailClick = (index) => setCurrentImageIndex(index);
  const handleQuantityDecrease = () => setQuantity(q => Math.max(1, q - 1));
  const handleQuantityIncrease = () => setQuantity(q => (product?.stock ? Math.min(product.stock, q + 1) : q + 1));

  // Add to Cart Logic
  const createCartItem = () => ({
    id: `${product.id}-${selectedSize || 'def'}-${selectedColor || 'def'}`,
    productId: product.id,
    quantity,
    price: product.discount ? calculateOriginalPrice(product.price, product.discount) : product.price,
    selectedColor,
    selectedSize,
    images: product.images,
    name: product.name,
    discount: product.discount,
    slug: product.slug
  });

  const handleAddToCart = () => {
    if (product.stock === 0) return toast.error("Out of stock");
    if (sizes.length > 0 && !selectedSize) return toast.error("Select size");
    if (colors.length > 0 && !selectedColor) return toast.error("Select color");

    const item = createCartItem();
    const newCart = [...prevcart];
    const existIdx = newCart.findIndex(i => i.productId === item.productId && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor);

    if (existIdx > -1) newCart[existIdx].quantity += quantity;
    else newCart.push(item);

    dispatch(setCart(newCart));
    if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success("Added to Bag");
    setIsModalOpen(true);
  };

  const handleBuyNow = () => {
    if (isDigital) {
      setIsDigitalPaymentOpen(true);
      return;
    }

    if (product.stock === 0) return toast.error("Out of stock");
    if (sizes.length > 0 && !selectedSize) return toast.error("Select size");
    if (colors.length > 0 && !selectedColor) return toast.error("Select color");

    const item = createCartItem();
    const newCart = [...prevcart];
    const existIdx = newCart.findIndex(i => i.productId === item.productId && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor);

    if (existIdx > -1) newCart[existIdx].quantity += quantity;
    else newCart.push(item);

    dispatch(setCart(newCart));
    if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(newCart));
    router.push('/customer/pages/cart');
  };

  const handleReviewSubmit = async () => {
    if (!rating) return toast.error("Please select a rating");
    if (!comment) return toast.error("Please leave a comment");

    setReviewLoading(true);
    try {
      // Assuming a generic endpoint, can be adjusted if API differs
      const response = await axios.post('/api/addreview', {
        productId: product.id,
        rating,
        comment,
        reviewer: userName || 'Anonymous'
      });

      if (response.data && response.data.status) {
        toast.success("Review submitted successfully!");
        setReviews([response.data.data, ...reviews]);
        setComment('');
        setRating(0);
      } else {
        toast.error("Failed to submit review");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting review. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  };



  if (!product && loading) return <div className="h-screen flex items-center justify-center"><ThreeDots color="#f97316" /></div>;
  if (error) return <div className="text-center mt-20">{error}</div>;

  return (
    <div className="container mx-auto px-4 md:px-8 py-4 font-sans text-[#333] max-w-7xl">
      <ToastContainer />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-8 overflow-hidden whitespace-nowrap">
        <button onClick={() => router.push('/')} className="hover:text-black underline underline-offset-4 decoration-gray-200">Homepage</button>
        <FiChevronDown className="rotate-[270deg] flex-shrink-0" size={10} />
        <button onClick={() => router.push(`/customer/pages/category/${product?.category?.slug}`)} className="hover:text-black underline underline-offset-4 decoration-gray-200 max-w-[150px] truncate">{product?.category?.name || 'Category'}</button>
        <FiChevronDown className="rotate-[270deg] flex-shrink-0" size={10} />
        <span className="text-gray-900 truncate">{product?.name}</span>
      </nav>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Left Column: Images */}
        <div className="w-full lg:w-3/5 flex flex-col md:flex-row gap-4">
          {/* Thumbnails - Vertical on Desktop, Horizontal on Mobile */}
          <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[600px] scrollbar-hide py-1">
            {product?.images?.map((img, idx) => (
              <button
                key={idx}
                className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 border-2 rounded-lg overflow-hidden transition-all duration-200 ${currentImageIndex === idx ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-100 hover:border-gray-300'
                  }`}
                onClick={() => handleThumbnailClick(idx)}
              >
                <Image
                  src={getImageUrl(img?.url)}
                  width={100} height={100}
                  className="w-full h-full object-cover"
                  alt={`Product view ${idx + 1}`}
                  unoptimized={shouldUnoptimize(img?.url)}
                />
              </button>
            ))}
          </div>

          {/* Main Image View */}
          <div className="order-1 md:order-2 flex-grow relative group">
            <div
              className="bg-white border border-gray-100 rounded-2xl aspect-[4/5] md:h-[600px] relative flex items-center justify-center overflow-hidden shadow-sm"
              onClick={() => {
                if (product?.images?.[currentImageIndex]?.url) {
                  window.open(getImageUrl(product.images[currentImageIndex].url), '_blank');
                }
              }}
            >
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                {product?.discount && (
                  <span className="bg-[#E1F2E8] text-[#1E4C2F] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    {product.discount}% OFF
                  </span>
                )}
                {product?.isTopRated && (
                  <span className="bg-[#FFF8E6] text-[#A66E00] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <GoStarFill className="mb-0.5" /> Bestseller
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-4 z-20">
                <button className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md text-gray-700 hover:text-red-500 transition-colors duration-300">
                  <FaRegHeart size={18} />
                </button>
              </div>

              {product?.images?.[currentImageIndex] ? (
                <Image
                  src={getImageUrl(product.images[currentImageIndex].url)}
                  fill
                  className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                  alt={product.name}
                  priority
                  unoptimized={shouldUnoptimize(product.images[currentImageIndex].url)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <FiMaximize2 size={48} />
                  <span className="text-sm font-medium">No Image Available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: details */}
        <div className="w-full lg:w-2/5 flex flex-col">
          <div className="mb-6">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-3">{product?.category?.name || 'Collection'}</p>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-2">{product?.name}</h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[#2D2D2D] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                <GoStarFill className="text-orange-400" />
                <span>4.9</span>
              </div>
              <span className="text-xs text-gray-500 underline underline-offset-4 decoration-gray-300 pointer-events-none">
                {reviews.length} Shop reviews
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900">
                Rs.{formatPrice(calculateOriginalPrice(product.price, product.discount))}
              </span>
              {product?.discount > 0 && (
                <span className="text-base text-gray-400 line-through font-medium">
                  Rs.{formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 mt-1 font-medium flex items-center gap-1 italic">
              <FiInfo className="mb-0.5" /> Inclusive of all taxes
            </p>
          </div>

          <div className="h-px bg-gray-100 mb-8 w-full" />

          {/* Selection Area */}
          <div className="space-y-6 mb-8">
            {/* Color Selector */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-900 block mb-3">
                Color {selectedColor && <span className="text-gray-400 font-medium ml-2">— {selectedColor}</span>}
              </label>
              {colors.length > 0 ? (
                <div className="relative group">
                  <select
                    className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 appearance-none text-sm font-bold text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none cursor-pointer transition-all"
                    onChange={(e) => setSelectedColor(e.target.value)}
                    value={selectedColor || ''}
                  >
                    <option value="" disabled>Select a color</option>
                    {colors.map((c, i) => (
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-black transition-colors" size={16} />
                </div>
              ) : (
                <div className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 flex items-center gap-2 text-sm font-bold text-gray-500 ring-1 ring-orange-50/50">
                  <div className="w-3 h-3 rounded-full bg-orange-400" /> Neutral (Standard)
                </div>
              )}
            </div>

            {/* Size Selector */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-900 block mb-3">
                Size {selectedSize && <span className="text-gray-400 font-medium ml-2">— {selectedSize}</span>}
              </label>
              {sizes.length > 0 ? (
                <div className="relative group">
                  <select
                    className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 appearance-none text-sm font-bold text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none cursor-pointer transition-all"
                    onChange={(e) => setSelectedSize(e.target.value)}
                    value={selectedSize || ''}
                  >
                    <option value="" disabled>Select a size</option>
                    {sizes.map((s, i) => (
                      <option key={i} value={s.name} disabled={s.stock === 0}>
                        {s.name} {s.stock === 0 ? '(Out of Stock)' : ''}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-black transition-colors" size={16} />
                </div>
              ) : (
                <div className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 flex items-center text-sm font-bold text-gray-500">
                  One Size fits all
                </div>
              )}
            </div>

            {/* Quantity Selector - Etsy Style Row */}
            {!isDigital && (
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-900 block mb-3">Quantity</label>
                <div className="relative group w-32">
                  <select
                    className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 appearance-none text-sm font-bold text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none cursor-pointer transition-all"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  >
                    {[...Array(Math.min(10, product?.stock || 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-black transition-colors" size={16} />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-4">
            {!isPurchased ? (
              <>
                <button
                  onClick={handleBuyNow}
                  disabled={loading || (!isDigital && product?.stock === 0)}
                  className="w-full bg-orange-600 text-white h-14 rounded-full uppercase font-black text-xs tracking-[0.2em] hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isDigital ? 'Download Now' : 'Buy it now'}
                  </span>
                </button>

                {!isDigital && (
                  <button
                    onClick={handleAddToCart}
                    disabled={loading || product?.stock === 0}
                    className="w-full bg-white text-black border-2 border-black h-14 rounded-full uppercase font-black text-xs tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {product?.stock === 0 ? 'Out of Stock' : 'Add to basket'}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleDownload}
                className="w-full bg-[#1E4C2F] text-white h-14 rounded-full uppercase font-black text-xs tracking-[0.2em] hover:bg-[#153a23] transition-all shadow-xl shadow-green-900/10 active:scale-[0.98]"
              >
                Download product
              </button>
            )}
          </div>


        </div>
      </div>

      {/* Bottom Section: Reviews and Accordions */}
      <div className="mt-16 pt-16 border-t border-gray-100 flex flex-col lg:flex-row gap-16">
        {/* Left Side: Reviews */}
        <div className="w-full lg:w-3/5">
          <div className="mb-10">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Reviews for this item ({reviews.length})</h2>

            {reviews.length > 0 && (
              <>
                <div className="flex flex-wrap items-center gap-8 mb-10">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-3xl font-bold text-gray-900">
                      <GoStarFill className="text-gray-900" size={24} />
                      <span>4.9</span>
                      <span className="text-gray-300 text-xl font-normal">/5</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Item average</span>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {[
                      { label: "Item quality", score: "4.9" },
                      { label: "Delivery", score: "4.8" },
                      { label: "Customer service", score: "4.9" },
                      { label: "Buyers recommend", score: "98%" }
                    ].map((stat, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-full border-[3px] border-orange-100 flex items-center justify-center text-[10px] font-black text-gray-900">
                          {stat.score}
                        </div>
                        <span className="text-[9px] font-bold text-center text-gray-400 uppercase tracking-tighter leading-none max-w-[60px]">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {['Quality (32)', 'Delivery & Packaging (24)', 'Description accuracy (21)', 'Appearance (11)'].map((tag, i) => (
                    <button key={i} className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold hover:border-black transition-colors">{tag}</button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Review Form */}
          <div className="mb-12 p-8 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-lg mb-6">Write a Review</h4>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-black uppercase tracking-widest">Rating</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)} className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                ))}
              </div>
            </div>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-4 text-sm mb-4 focus:ring-1 focus:ring-black outline-none shadow-sm"
              rows="4"
              placeholder="Share your thoughts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={handleReviewSubmit}
                disabled={reviewLoading}
                className="bg-orange-600 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.1em] hover:bg-orange-700 disabled:opacity-50 transition-all shadow-lg shadow-orange-600/20"
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>

          <ReviewsSection reviews={reviews} />

          <button className="w-full mt-10 py-3 border-2 border-gray-900 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-900 hover:text-white transition-all">
            View all reviews for this item
          </button>
        </div>

        {/* Right Side: Accordions */}
        <div className="w-full lg:w-2/5">

          <div className="space-y-2">
            {/* Item Details Accordion */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => setActiveTab(activeTab === 'info' ? '' : 'info')}
                className="w-full flex items-center justify-between py-6 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black uppercase tracking-widest text-gray-900">Item details</span>
                </div>
                <FiChevronUp className={`transition-transform duration-300 ${activeTab === 'info' ? '' : 'rotate-180'}`} />
              </button>
              {activeTab === 'info' && (
                <div className="pb-8 prose prose-sm max-w-none text-gray-700 text-[14px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product?.description || 'No description available.' }} />
              )}
            </div>

            {/* Delivery & Return Policies */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => setActiveTab(activeTab === 'delivery' ? '' : 'delivery')}
                className="w-full flex items-center justify-between py-6 group"
              >
                <span className="text-sm font-black uppercase tracking-widest text-gray-900">Delivery and return policies</span>
                <FiChevronUp className={`transition-transform duration-300 ${activeTab === 'delivery' ? '' : 'rotate-180'}`} />
              </button>
              {activeTab === 'delivery' && (
                <div className="pb-8 space-y-6">
                  <div className="flex items-start gap-4 text-[14px] text-gray-700 font-medium leading-relaxed">
                    <FiCalendar className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                    <p>Order today to get by <span className="font-bold underline decoration-dotted decoration-gray-300">18-28 Feb</span></p>
                  </div>
                  <div className="flex items-start gap-4 text-[14px] text-gray-700 font-medium leading-relaxed">
                    <FiRefreshCw className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                    <p className="underline decoration-dotted decoration-gray-300">Returns & exchanges not accepted</p>
                  </div>
                  <div className="flex items-start gap-4 text-[14px] text-gray-700 font-medium leading-relaxed">
                    <FiTruck className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                    <p>Delivery cost: <span className="font-bold">Rs. 450</span></p>
                  </div>
                  <div className="flex items-start gap-4 text-[14px] text-gray-700 font-medium leading-relaxed">
                    <FiMapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                    <p>Dispatched from: <span className="font-bold underline decoration-dotted decoration-gray-300 text-gray-900">United States</span></p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4">
                    <button className="w-full flex items-center justify-between group py-2">
                      <span className="text-sm font-black uppercase tracking-widest text-gray-900">Did you know?</span>
                      <FiChevronDown />
                    </button>
                    <button className="w-full flex items-center justify-between group py-2">
                      <span className="text-sm font-black uppercase tracking-widest text-gray-900">Meet your sellers</span>
                      <FiChevronDown />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProductsSection
        relatedProducts={relatedProducts}
        calculateOriginalPrice={calculateOriginalPrice}
        formatPrice={formatPrice}
        getImageUrl={getImageUrl}
        shouldUnoptimize={shouldUnoptimize}
        router={router}
      />

      {/* Explore Related Searches Section */}
      {((product?.meta_keywords && product.meta_keywords.trim().length > 0) || (product?.category?.name)) && (
        <div className="mt-20">
          <h3 className="text-[1.5rem] md:text-[2rem] font-serif mb-8 text-gray-800">Explore more related searches</h3>
          <div className="flex flex-wrap gap-2">
            {[
              ...(product?.meta_keywords ? product.meta_keywords.split(',').map(t => t.trim()).filter(t => t) : []),
              ...(product?.category?.name ? [`Gifts for ${product.category.name}`] : []),
              'Handmade Finds',
              'Trending Items'
            ].slice(0, 12).map((tag, i) => (
              <button
                key={i}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-full transition-all active:scale-95"
                onClick={() => router.push(`/customer/pages/products?search=${encodeURIComponent(tag)}`)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories Row */}
      {categories.length > 0 && (
        <div className="mt-16 mb-12 border-t border-gray-100 pt-12">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => router.push(`/customer/pages/category/${cat.slug}`)}
                className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-orange-500 transition-all hover:scale-110 active:scale-95"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal Re-use */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Related Products"
          ariaHideApp={false}
          style={{
            overlay: { zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
            content: { zIndex: 10001, margin: 'auto', width: 'fit-content', maxWidth: '90vw', padding: '20px', borderRadius: '0' }
          }}
        >
          <div className="flex flex-col items-center p-4">
            <h2 className="text-xl font-serif font-bold mb-4">Added to Bag</h2>
            <p className="text-gray-600 mb-6">You have added {product?.name} to your bag.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-300 text-sm font-bold uppercase tracking-wider hover:border-black">Continue Shopping</button>
              <button onClick={() => router.push('/customer/pages/cart')} className="px-6 py-2 bg-orange-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-orange-700 rounded-lg shadow-lg shadow-orange-600/20">View Bag</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Digital Payment Modal */}
      {isDigitalPaymentOpen && product && (
        <DigitalCheckoutModal
          isOpen={isDigitalPaymentOpen}
          onRequestClose={() => setIsDigitalPaymentOpen(false)}
          product={product}
          onSuccess={() => {
            setIsPurchased(true);
            setIsDigitalPaymentOpen(false);
          }}
        />
      )}

      {/* Download Progress Modal */}
      <DownloadProgressModal
        isOpen={isDownloading}
        onRequestClose={() => setIsDownloading(false)}
        fileName={product?.name}
        onComplete={onDownloadComplete}
      />
    </div>
  );
};

// --- Sub Components ---

const RelatedProductsSection = memo(({ relatedProducts, calculateOriginalPrice, formatPrice, getImageUrl, shouldUnoptimize, router }) => {
  if (!relatedProducts?.length) return null;
  return (
    <div className="mt-20 mb-12">
      <h3 className="text-[1.5rem] md:text-[2rem] font-bold mb-8 text-center text-gray-800">You May Also Like</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {relatedProducts.map(product => {
          const originalPrice = calculateOriginalPrice(product.price, product.discount);
          return (
            <div
              key={product.slug}
              className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/customer/pages/products/${product.slug}`)}
            >
              <div className="relative aspect-square bg-[#F3F4FB] overflow-hidden">
                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-3 left-3 z-20 bg-[#1E4C2F] text-white text-[10px] font-bold px-2 py-1 rounded-full drop-shadow-sm">
                    {product.discount.toFixed(0)}% OFF
                  </div>
                )}

                {/* Floating Action Icons */}
                <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                  <button className="bg-white/95 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-gray-700 hover:bg-gray-900 hover:text-white transition-colors" title="Quick View">
                    <FiMaximize2 size={14} />
                  </button>
                  <button
                    className="bg-white/95 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-gray-700 hover:bg-gray-900 hover:text-white transition-colors"
                    title="Add to Cart"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/customer/pages/products/${product.slug}`);
                    }}
                  >
                    <FiShoppingBag size={14} />
                  </button>
                </div>

                {/* Image */}
                <div className="absolute inset-0 p-6 flex items-center justify-center">
                  {product.images?.[0] ? (
                    <Image
                      width={300}
                      height={300}
                      src={getImageUrl(product.images[0].url)}
                      alt={product.name}
                      className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      unoptimized={shouldUnoptimize(product.images[0].url)}
                    />
                  ) : (
                    <div className="text-gray-400 text-xs">No Image</div>
                  )}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate max-w-[70%]">
                    {product.category?.name || 'Collection'}
                  </p>
                  <div className="flex items-center gap-1 text-yellow-500 text-[9px] font-bold bg-yellow-50 px-1.5 py-0.5 rounded">
                    <GoStarFill size={10} />
                    <span>4.9</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-gray-900 mb-2 leading-snug cursor-pointer group-hover:text-black transition-colors line-clamp-2 h-[2.8em]">
                  {product.name}
                </h4>

                {/* Price */}
                <div className="flex flex-col mt-auto justify-end">
                  <p className="text-base font-bold text-black leading-none">Rs.{formatPrice(product.price)}</p>
                  {product.discount > 0 && (
                    <p className="text-[9px] text-gray-400 line-through mt-1 font-bold">Rs.{formatPrice(originalPrice)}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
RelatedProductsSection.displayName = 'RelatedProductsSection';

const ReviewsSection = memo(({ reviews }) => {
  if (!reviews?.length) return <div className="text-gray-500 py-8 text-center text-sm font-medium">No reviews yet. Be the first to leave a review!</div>;

  return (
    <div className="flex flex-col space-y-6">
      {reviews.map((review, index) => (
        <div key={review.id || index} className="border-b border-gray-100 pb-6 last:border-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h5 className="font-bold text-sm text-gray-900 uppercase tracking-wider">{review.reviewer || 'Anonymous'}</h5>
              <div className="text-yellow-400 text-xs mt-1">
                {[...Array(5)].map((_, i) => <span key={i}>{i < (review.rating || 0) ? '★' : '☆'}</span>)}
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">{review.comment}</p>
        </div>
      ))}
    </div>
  );
});
ReviewsSection.displayName = 'ReviewsSection';

export default memo(ProductPage);
