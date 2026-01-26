'use client';

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../../../../store/cartSlice';
import { ThreeDots } from 'react-loader-spinner';
import { FiMinus, FiPlus, FiShoppingBag, FiMaximize2 } from 'react-icons/fi';
import { FaShare, FaTimes, FaFacebookF, FaTwitter, FaPinterestP } from 'react-icons/fa';
import { GoStarFill } from "react-icons/go";
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



  if (!product && loading) return <div className="h-screen flex items-center justify-center"><ThreeDots color="#000" /></div>;
  if (error) return <div className="text-center mt-20">{error}</div>;

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 font-sans text-[#333] max-w-7xl">
      <ToastContainer />

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

        {/* Left Column: Images */}
        <div className="w-full lg:w-1/2 flex flex-col md:flex-row gap-6">
          {/* Thumbnails */}
          <div className="order-2 md:order-1 flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">
            {product?.images?.map((img, idx) => (
              <div
                key={idx}
                className={`min-w-[5rem] w-20 h-20 border cursor-pointer transition-all ${currentImageIndex === idx ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                onClick={() => handleThumbnailClick(idx)}
              >
                <Image
                  src={getImageUrl(img?.url)}
                  width={80} height={80}
                  className="w-full h-full object-cover"
                  alt="Thumbnail"
                  unoptimized={shouldUnoptimize(img?.url)}
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="order-1 md:order-2 flex-grow bg-gray-50 aspect-square md:aspect-auto md:h-[600px] relative flex items-center justify-center">
            {product?.discount && (
              <span className="absolute top-4 left-4 bg-[#1E4C2F] text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                {product.discount}% OFF
              </span>
            )}
            {product?.images?.[currentImageIndex] ? (
              <Image
                src={getImageUrl(product.images[currentImageIndex].url)}
                fill
                className="object-contain p-8 mix-blend-multiply"
                alt={product.name}
                priority
                unoptimized={shouldUnoptimize(product.images[currentImageIndex].url)}
              />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>
        </div>

        {/* Right Column: details */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <p className="text-xs sm:text-sm text-gray-500 tracking-widest uppercase mb-2 font-medium">{product?.category?.name || 'Collection'}</p>
          <h1 className="text-xl md:text-2xl font-serif font-medium text-gray-900 mb-4">{product?.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-yellow-400 text-sm">
              {[...Array(5)].map((_, i) => <span key={i}>&#9733;</span>)}
            </div>
            <span className="text-xs text-gray-500">({reviews.length} reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-8">
            {product?.discount ? (
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-gray-900">Rs.{formatPrice(calculateOriginalPrice(product.price, product.discount))}</span>
                <span className="text-lg text-gray-400 line-through">Rs.{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">Rs.{formatPrice(product?.price)}</span>
            )}
          </div>

          <div className="h-px bg-gray-200 mb-8 w-full" />

          {/* Selectors */}
          {colors.length === 0 && (
            <div className="mb-6">
              <span className="text-sm font-bold uppercase tracking-wide block mb-3">Color</span>
              <div className="inline-block px-4 py-2 border border-orange-600 text-orange-600 text-sm font-bold rounded-lg bg-orange-50/50">Neutral</div>
            </div>
          )}
          {colors.length > 0 && (
            <div className="mb-6">
              <span className="text-sm font-bold uppercase tracking-wide block mb-3">Color: <span className="font-normal capitalize">{selectedColor}</span></span>
              <div className="flex gap-3">
                {colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-8 h-8 rounded-full border border-gray-300 shadow-sm focus:outline-none ring-1 ring-offset-2 ${selectedColor === c.name ? 'ring-orange-600' : 'ring-transparent'}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {sizes.length === 0 && (
            <div className="mb-6">
              <span className="text-sm font-bold uppercase tracking-wide block mb-3">Size</span>
              <div className="inline-block px-4 py-2 border border-orange-600 text-orange-600 text-sm font-bold rounded-lg bg-orange-50/50">One Size</div>
            </div>
          )}
          {sizes.length > 0 && (
            <div className="mb-6">
              <span className="text-sm font-bold uppercase tracking-wide block mb-3">Size: <span className="font-normal capitalize">{selectedSize}</span></span>
              <div className="flex gap-2">
                {sizes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSize(s.name)}
                    disabled={s.stock === 0}
                    className={`min-w-[3rem] h-10 px-3 border border-gray-300 text-sm font-medium transition-all
                                ${selectedSize === s.name ? 'bg-orange-600 text-white border-orange-600' : 'hover:border-orange-600 bg-white text-gray-900'}
                                ${s.stock === 0 ? 'opacity-50 cursor-not-allowed line-through' : ''}
                             `}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 mt-4">
            {/* Quantity */}
            <div className="border border-gray-300 flex items-center h-12 w-32 px-4 justify-between">
              <button onClick={handleQuantityDecrease} disabled={quantity <= 1} className="text-gray-500 hover:text-black"><FiMinus size={14} /></button>
              <span className="font-medium text-gray-900">{quantity}</span>
              <button onClick={handleQuantityIncrease} className="text-gray-500 hover:text-black"><FiPlus size={14} /></button>
            </div>

            {/* Buttons */}
            <div className="flex-grow flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={loading || product?.stock === 0}
                className="flex-1 bg-white text-orange-600 border border-orange-600 h-12 rounded-xl uppercase font-bold text-sm tracking-widest hover:bg-orange-600 hover:text-white transition-colors disabled:opacity-50"
              >
                {product?.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={loading || product?.stock === 0}
                className="flex-1 bg-orange-600 text-white h-12 rounded-xl uppercase font-bold text-sm tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-95 disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Social Share */}
          <div className="flex gap-4 text-gray-500 mt-2">
            <a href="#" className="hover:text-black"><FaFacebookF /></a>
            <a href="#" className="hover:text-black"><FaTwitter /></a>
            <a href="#" className="hover:text-black"><FaPinterestP /></a>
          </div>

        </div>
      </div>

      {/* Info Tabs Section - Card Style */}
      <div className="mt-20">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">

          {/* Tab Headers */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
            {['info', 'delivery', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 md:py-5 px-4 md:px-8 text-xs md:text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap text-center
                          ${activeTab === tab ? 'text-black bg-white' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}
                      `}
              >
                {tab === 'info' ? 'Product Info' : tab === 'delivery' ? 'Delivery & Returns' : 'Reviews'}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-orange-600"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="px-4 py-6 md:px-10 md:py-12 bg-white min-h-[200px]">
            {activeTab === 'info' && (
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-normal break-words" dangerouslySetInnerHTML={{ __html: product?.description || 'No description available.' }} />
            )}
            {activeTab === 'delivery' && (
              <div className="text-gray-600 text-sm leading-relaxed max-w-3xl">
                <p className="mb-4">We offer free standard shipping on all orders over Rs.5000. Expected delivery within 3-5 business days.</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-bold text-gray-900 mb-2">Standard Delivery</h5>
                    <p>3-5 working days</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-bold text-gray-900 mb-2">Express Delivery</h5>
                    <p>1-2 working days</p>
                  </div>
                </div>
                <ul className="list-disc pl-5 space-y-2 mt-6">
                  <li>Returns accepted within 14 days of delivery</li>
                  <li>Items must be unworn and in original packaging</li>
                </ul>
              </div>
            )}
            {activeTab === 'reviews' && (
              <>
                {/* Review Form */}
                <div className="mb-10 p-6 md:p-8 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-lg mb-6 flex items-center gap-2">Write a Review <span className="text-gray-400 text-sm font-normal">(Required fields marked *)</span></h4>

                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm font-bold">Rating *</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRating(star)} className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    className="w-full border border-gray-200 rounded-lg p-4 text-sm mb-4 focus:ring-1 focus:ring-black outline-none shadow-sm"
                    rows="4"
                    placeholder="Share your thoughts about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>

                  <div className="flex justify-end">
                    <button
                      onClick={handleReviewSubmit}
                      disabled={reviewLoading}
                      className="bg-orange-600 text-white px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-orange-700 disabled:opacity-50 transition-all transform active:scale-95 shadow-lg shadow-orange-600/20"
                    >
                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </div>

                <ReviewsSection reviews={reviews} />
              </>
            )}
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

      {/* Categories Row */}
      {categories.length > 0 && (
        <div className="mt-16 mb-20 border-t border-gray-100 pt-12">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => router.push(`/customer/pages/category/${cat.slug}`)}
                className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all hover:scale-110 active:scale-95"
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
            content: { zIndex: 10001, margin: 'auto', width: 'fit-content', maxWidth: '90vw', padding: '20px', borderRadius: '0' } // Sharp corners
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

    </div>
  );
};

// --- Sub Components ---

const RelatedProductsSection = memo(({ relatedProducts, calculateOriginalPrice, formatPrice, getImageUrl, shouldUnoptimize, router }) => {
  if (!relatedProducts?.length) return null;
  return (
    <div className="mt-20 mb-12">
      <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800">You May Also Like</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {relatedProducts.map(product => {
          const originalPrice = calculateOriginalPrice(product.price, product.discount);
          return (
            <div
              key={product.slug}
              className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/customer/pages/products/${product.slug}`)}
            >
              <div
                className="relative aspect-square bg-[#F3F4FB] overflow-hidden"
              >
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

                <h3
                  className="text-sm font-bold text-gray-900 mb-2 leading-snug cursor-pointer group-hover:text-black transition-colors line-clamp-2 h-[2.8em]"
                >
                  {product.name}
                </h3>

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
  if (!reviews?.length) return <div className="text-gray-500 py-8">No reviews yet. Be the first to leave a review!</div>;

  return (
    <div className="flex flex-col space-y-6">
      {reviews.map((review, index) => (
        <div key={review.id || index} className="border-b border-gray-100 pb-6 last:border-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h5 className="font-bold text-gray-900">{review.reviewer || 'Anonymous'}</h5>
              <div className="text-yellow-400 text-xs">
                {[...Array(5)].map((_, i) => <span key={i}>{i < (review.rating || 0) ? '★' : '☆'}</span>)}
              </div>
            </div>
            <span className="text-xs text-gray-400">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
});
ReviewsSection.displayName = 'ReviewsSection';

export default memo(ProductPage);
