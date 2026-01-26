'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { FiPlus, FiMinus, FiX, FiUser, FiHome, FiMapPin, FiPhone, FiMail, FiTag, FiCreditCard } from 'react-icons/fi';
import { removeFromCart, updateQuantity, setCart } from '../../../store/cartSlice';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';
import Modal from 'react-modal';

const CartPage = () => {
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [extraDeliveryCharge, setExtraDeliveryCharge] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isReadyForPayment, setIsReadyForPayment] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setHasMounted(true);
    // Load PayPal SDK
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';
    const scriptId = 'paypal-sdk-script';

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.onload = () => {
        console.log('PayPal SDK loaded successfully');
        setIsScriptLoaded(true);
      };
      script.onerror = (err) => {
        console.error('Failed to load PayPal SDK:', err);
        toast.error('Payment system failed to initialize. Please check your internet connection or PayPal Client ID.');
      };
      document.body.appendChild(script);
    } else if (window.paypal) {
      setIsScriptLoaded(true);
    }

    return () => {
      // Cleanup script logic if needed
    };
  }, []);

  const [shippingAddress, setShippingAddress] = useState({
    recipientName: '',
    streetAddress: '',
    apartmentSuite: '',
    city: '',
    state: '',
    zip: '',
    country: 'Pakistan',
    phoneNumber: '+92',
    email: ''
  });

  const cart = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('=== CART MIGRATION START ===');
    console.log('Raw cart from localStorage:', JSON.stringify(storedCart, null, 2));

    // Migrate old cart items: extract productId from composite id if missing
    const migratedCart = storedCart.map((item, index) => {
      console.log(`\nProcessing item ${index}:`, item);
      console.log(`  - has productId: ${!!item.productId}`);
      console.log(`  - has id: ${!!item.id}`);
      console.log(`  - id value: "${item.id}"`);

      if (!item.productId && item.id) {
        let productId;

        // If id is already a number, use it directly
        if (typeof item.id === 'number') {
          productId = item.id;
          console.log(`  - id is number, using directly: ${productId}`);
        }
        // If id is a string, try to extract productId from composite format
        else if (typeof item.id === 'string') {
          productId = parseInt(item.id.split('-')[0]);
          console.log(`  - id is string, extracted: ${productId}`);
        }

        if (productId && !isNaN(productId)) {
          console.log(`  ✓ MIGRATED: productId ${productId}`);
          return { ...item, productId };
        } else {
          console.error(`  ✗ FAILED: Could not extract valid productId`);
        }
      } else if (item.productId) {
        console.log(`  ✓ ALREADY HAS productId: ${item.productId}`);
      } else {
        console.error(`  ✗ NO ID FIELD to extract from`);
      }
      return item;
    });

    // Save migrated cart back to localStorage
    if (JSON.stringify(storedCart) !== JSON.stringify(migratedCart)) {
      console.log('Cart migration completed. Saving updated cart.');
      localStorage.setItem('cart', JSON.stringify(migratedCart));
    }

    dispatch(setCart(migratedCart));
    fetchSettings();
  }, [dispatch]);

  useEffect(() => {
    if (paymentMethod === 'Cash on Delivery') {
      fetchExtraDeliveryCharge();
    } else {
      setExtraDeliveryCharge(0);
    }
  }, [paymentMethod]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`/api/settings/getSettings/2`);
      const { deliveryCharge, taxPercentage, other1, other2 } = response.data;
      setDeliveryCharge(Number(deliveryCharge) || 0);
      setTaxRate((Number(taxPercentage) || 0) / 100);
      setExtraDeliveryCharge(Number(other1) || 0); // Map 'other1' to COD charge as per DB structure
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchExtraDeliveryCharge = async () => {
    try {
      const response = await axios.get('/api/settings/getSettings/2');
      const { other1 } = response.data;
      setExtraDeliveryCharge(other1);
    } catch (error) {
      console.error('Error fetching extra delivery charge:', error);
      setExtraDeliveryCharge(0);
    }
  };

  const calculateFinalTotal = (currentSubtotal = subtotal) => {
    const subtotalAfterDiscount = (Number(currentSubtotal) || 0) - (Number(discount) || 0);
    const tax = subtotalAfterDiscount * (Number(taxRate) || 0);
    const effectiveCodCharge = paymentMethod === 'Cash on Delivery' ? (Number(extraDeliveryCharge) || 0) : 0;
    const final = subtotalAfterDiscount + tax + (Number(deliveryCharge) || 0) + effectiveCodCharge;
    return Math.max(0, final) || 0;
  };

  useEffect(() => {
    const calculatedSubtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    setSubtotal(calculatedSubtotal);
    setTotal(calculateFinalTotal(calculatedSubtotal));
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart, discount, taxRate, deliveryCharge, extraDeliveryCharge, paymentMethod]);

  const validateForm = () => {
    const { recipientName, streetAddress, city, state, zip, phoneNumber, email } = shippingAddress;
    const errors = {};

    if (!recipientName?.trim()) errors.recipientName = true;
    if (!email?.trim()) errors.email = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) errors.emailInvalid = true;

    if (!phoneNumber?.trim()) errors.phoneNumber = true;
    const phoneRegex = /^\+92\d{10}$/;
    if (phoneNumber && !phoneRegex.test(phoneNumber)) errors.phoneNumberInvalid = true;

    if (!streetAddress?.trim()) errors.streetAddress = true;
    if (!city?.trim()) errors.city = true;
    if (!state?.trim()) errors.state = true;
    if (!zip?.trim()) errors.zip = true;

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      if (errors.emailInvalid) toast.error('Please enter a valid email address.');
      else if (errors.phoneNumberInvalid) toast.error('Please enter a valid phone number (+92 followed by 10 digits).');
      else toast.error('Please fill in all the required fields.');
      return false;
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const updateItemQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ id: itemId, quantity }));
  };

  const handleRemoveFromCart = (itemId) => {
    dispatch(removeFromCart({ id: itemId }));
    toast.success('Removed from cart');
  };


  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethod === 'Credit Card') {
      setIsReadyForPayment(true);
      toast.info('Please complete payment via PayPal below.');
      return;
    }

    // COD flow remains the same
    try {
      const finalTotal = calculateFinalTotal();

      // Validate cart items have productId
      console.log('Cart items before mapping:', cart);
      const invalidItems = cart.filter(item => !item.productId);
      if (invalidItems.length > 0) {
        console.error('Invalid cart items without productId:', invalidItems);
        toast.error('Some items in your cart are invalid. Please refresh and try again.');
        return;
      }

      const orderDetails = {
        userId: await getUserId(),
        shippingAddress,
        paymentMethod,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
          product: { name: item.name }
        })),
        total: finalTotal,
        discount,
        tax: Number((subtotal - discount) * taxRate) || 0,
        netTotal: finalTotal,
        deliveryCharge,
        extraDeliveryCharge: Number(extraDeliveryCharge) || 0,
        couponCode
      };

      console.log('Placing COD order with details:', orderDetails);
      const response = await axios.post('/api/orders', orderDetails);
      setIsModalOpen(true);
      localStorage.removeItem('cart');
      dispatch(setCart([]));

      // Optional: Send email confirmation
      try {
        await axios.post('/api/sendOrderConfirmation', {
          email: shippingAddress.email,
          name: shippingAddress.recipientName,
          orderId: response.data.data.id,
          total: finalTotal,
          product: orderDetails.items,
          address: shippingAddress,
          deliveryCharge,
          extraDeliveryCharge: extraDeliveryCharge
        });
      } catch (mailErr) {
        console.error("Email error:", mailErr);
      }
      toast.success('Order placed Successfully!');
    } catch (error) {
      console.error('Order error:', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to place order.';
      toast.error(`Failed to place order: ${errMsg}`);
    }
  };

  const getUserId = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp > Date.now() / 1000) return decoded.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    if (isReadyForPayment && isScriptLoaded && window.paypal) {
      // Clear previous buttons if any
      const container = document.getElementById('paypal-button-container');

      // Safety check: ensure container exists before rendering
      if (!container) return;

      container.innerHTML = '';

      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: calculateFinalTotal().toFixed(2)
              }
            }]
          });
        },
        onApprove: async (data, actions) => {
          const details = await actions.order.capture();
          // After payment is authorized, create order in backend
          try {
            const finalTotal = calculateFinalTotal();

            // Validate cart items have productId
            console.log('Cart items before PayPal order creation:', cart);
            const invalidItems = cart.filter(item => !item.productId);
            if (invalidItems.length > 0) {
              console.error('Invalid cart items without productId:', invalidItems);
              toast.error('Some items in your cart are invalid. Please refresh and try again.');
              return;
            }

            const orderDetails = {
              userId: await getUserId(),
              shippingAddress,
              paymentMethod: 'PayPal/Credit Card',
              items: cart.map(item => ({
                productId: item.productId,
                quantity: Number(item.quantity) || 1,
                price: Number(item.price) || 0,
                selectedColor: item.selectedColor || null,
                selectedSize: item.selectedSize || null,
                product: { name: item.name }
              })),
              total: finalTotal,
              discount: Number(discount) || 0,
              tax: Number((subtotal - discount) * taxRate) || 0,
              netTotal: finalTotal,
              deliveryCharge: Number(deliveryCharge) || 0,
              extraDeliveryCharge: 0,
              couponCode,
              paymentId: details.id
            };

            console.log('Saving PayPal order with details:', orderDetails);
            const response = await axios.post('/api/orders', orderDetails);
            setIsModalOpen(true);
            localStorage.removeItem('cart');
            dispatch(setCart([]));
            toast.success('Payment Successful & Order Placed!');
          } catch (error) {
            console.error('Final order creation error:', error);
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save order.';
            toast.error(`Payment approved but failed to save order: ${errMsg}`);
          }
        },
        onError: (err) => {
          console.error('PayPal Error:', err);
          toast.error('Payment failed. Please try again.');
        }
      }).render('#paypal-button-container');
    }
  }, [isReadyForPayment, isScriptLoaded, cart, shippingAddress, discount, taxRate, deliveryCharge, extraDeliveryCharge, paymentMethod, subtotal]);

  const handleApplyCoupon = async () => {
    try {
      const response = await axios.post('/api/coupons/validate', { code: couponCode });
      if (response.data.valid) {
        const discountAmount = (subtotal * response.data.discountPercentage) / 100;
        setDiscount(discountAmount);
        setCouponMessage(`Discount of ${response.data.discountPercentage}% applied!`);
      } else {
        setDiscount(0);
        setCouponMessage(response.data.message);
      }
    } catch (error) {
      setDiscount(0);
      setCouponMessage('Invalid coupon');
    }
  };

  if (!hasMounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black uppercase tracking-widest text-gray-400">Loading Cart...</div>;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-gray-50">
        <div className="w-24 h-24 mb-6 opacity-30">
          <FiX size={96} />
        </div>
        <p className="text-xl font-bold text-gray-800 mb-2">Your Cart is Empty</p>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <button
          className="bg-black text-white hover:bg-gray-800 font-bold py-3 px-8 rounded-full shadow-lg transition-all"
          onClick={() => router.push('/')}
        >
          START SHOPPING
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart & Checkout</h1>

          {/* Show fix button if there are invalid items */}
          {cart.some(item => !item.productId) && (
            <button
              onClick={() => {
                const validItems = cart.filter(item => item.productId);
                dispatch(setCart(validItems));
                localStorage.setItem('cart', JSON.stringify(validItems));
                toast.success('Removed invalid items from cart');
                window.location.reload();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all"
            >
              Fix Cart (Remove Invalid Items)
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* Left Section - Checkout Form */}
          <div className="w-full lg:w-3/5 space-y-8">

            {/* Customer & Shipping Details */}
            <div className="bg-white p-8 rounded-3xl shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 flex flex-col">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Recipient Name</label>
                    {formErrors.recipientName && <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md animate-pulse">Required</span>}
                  </div>
                  <div className="relative">
                    <FiUser className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formErrors.recipientName ? 'text-red-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      name="recipientName"
                      placeholder="Full Name"
                      value={shippingAddress.recipientName}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-10 text-sm focus:ring-4 transition-all outline-none ${formErrors.recipientName ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-transparent focus:ring-orange-500/10 focus:bg-white'}`}
                    />
                    {formErrors.recipientName && <FiX className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />}
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                    {(formErrors.email || formErrors.emailInvalid) && <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md animate-pulse">Required</span>}
                  </div>
                  <div className="relative">
                    <FiMail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formErrors.email || formErrors.emailInvalid ? 'text-red-500' : 'text-gray-400'}`} />
                    <input
                      type="email"
                      name="email"
                      placeholder="email@example.com"
                      value={shippingAddress.email}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-10 text-sm focus:ring-4 transition-all outline-none ${formErrors.email || formErrors.emailInvalid ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-transparent focus:ring-orange-500/10 focus:bg-white'}`}
                    />
                    {(formErrors.email || formErrors.emailInvalid) && <FiX className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 flex flex-col">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                    {(formErrors.phoneNumber || formErrors.phoneNumberInvalid) && <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md animate-pulse">Required</span>}
                  </div>
                  <div className="relative">
                    <FiPhone className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formErrors.phoneNumber || formErrors.phoneNumberInvalid ? 'text-red-500' : 'text-gray-400'}`} />
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="+92XXXXXXXXXX"
                      value={shippingAddress.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-10 text-sm focus:ring-4 transition-all outline-none ${formErrors.phoneNumber || formErrors.phoneNumberInvalid ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-transparent focus:ring-orange-500/10 focus:bg-white'}`}
                    />
                    {(formErrors.phoneNumber || formErrors.phoneNumberInvalid) && <FiX className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />}
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Street Address</label>
                    {formErrors.streetAddress && <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md animate-pulse">Required</span>}
                  </div>
                  <div className="relative">
                    <FiHome className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formErrors.streetAddress ? 'text-red-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      name="streetAddress"
                      placeholder="Street, House No."
                      value={shippingAddress.streetAddress}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-10 text-sm focus:ring-4 transition-all outline-none ${formErrors.streetAddress ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-transparent focus:ring-orange-500/10 focus:bg-white'}`}
                    />
                    {formErrors.streetAddress && <FiX className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-1.5 flex flex-col">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">City</label>
                    {formErrors.city && <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md animate-pulse">Required</span>}
                  </div>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-50 border-2 rounded-2xl py-4 px-6 text-sm focus:ring-4 transition-all outline-none ${formErrors.city ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-transparent focus:ring-orange-500/10 focus:bg-white'}`}
                  />
                </div>

                <div className="col-span-2 space-y-1.5 flex flex-col">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">State / Province</label>
                    {formErrors.state && <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md animate-pulse">Required</span>}
                  </div>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-50 border-2 rounded-2xl py-4 px-6 text-sm focus:ring-4 transition-all outline-none ${formErrors.state ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-transparent focus:ring-orange-500/10 focus:bg-white'}`}
                  />
                </div>

                <div className="col-span-2 space-y-1.5 flex flex-col">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">ZIP / Postcode</label>
                    {formErrors.zip && <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md animate-pulse">Required</span>}
                  </div>
                  <input
                    type="text"
                    name="zip"
                    placeholder="Postal Code"
                    value={shippingAddress.zip}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-50 border-2 rounded-2xl py-4 px-6 text-sm focus:ring-4 transition-all outline-none ${formErrors.zip ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-transparent focus:ring-orange-500/10 focus:bg-white'}`}
                  />
                </div>

                <div className="col-span-2 space-y-1.5 flex flex-col">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Country</label>
                  </div>
                  <select
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none"
                  >
                    <option value="Pakistan">Pakistan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer border-2 transition-all ${paymentMethod === 'Credit Card' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment" checked={paymentMethod === 'Credit Card'} onChange={() => setPaymentMethod('Credit Card')} className="accent-orange-500 w-4 h-4" />
                    <span className="text-sm font-black uppercase tracking-widest">Credit Card</span>
                  </div>
                  <FiCreditCard className={paymentMethod === 'Credit Card' ? 'text-orange-500' : 'text-gray-400'} size={20} />
                </label>
                <label className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer border-2 transition-all ${paymentMethod === 'Cash on Delivery' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} className="accent-orange-500 w-4 h-4" />
                    <span className="text-sm font-black uppercase tracking-widest">COD</span>
                  </div>
                  <FiMapPin className={paymentMethod === 'Cash on Delivery' ? 'text-orange-500' : 'text-gray-400'} size={20} />
                </label>
              </div>
            </div>

            {isReadyForPayment && (
              <div id="paypal-button-container" className="mt-8 p-8 bg-white rounded-[2.5rem] border-2 border-dashed border-orange-200/50 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-4 duration-700">
                {!isScriptLoaded && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-orange-500 animate-pulse">Initializing Secure Payment...</p>
                  </div>
                )}
              </div>
            )}

            {!isReadyForPayment && (
              <button
                className="w-full bg-black text-white hover:bg-orange-600 font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-xl shadow-black/10 transition-all transform active:scale-[0.98]"
                onClick={handlePlaceOrder}
              >
                {paymentMethod === 'Credit Card' ? 'Proceed to Payment' : 'Place Order Now'}
              </button>
            )}

          </div>

          {/* Right Section - Order Summary */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white rounded-[2.5rem] shadow-sm p-8 sticky top-24 border border-gray-50">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Order Summary</h2>

              {/* Items List */}
              <div className="flex flex-col gap-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex-shrink-0 relative overflow-hidden border border-gray-100 p-2">
                      {item.images?.[0] ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.images[0].url || item.images[0]}`}
                          fill
                          className="object-contain mix-blend-multiply"
                          unoptimized
                          alt={item.name}
                        />
                      ) : <FiX className="m-auto text-gray-200" />}
                    </div>

                    <div className="flex-grow flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <h3 className="text-[11px] font-black uppercase tracking-tight text-gray-800 line-clamp-1">{item.name}</h3>
                        <button onClick={() => handleRemoveFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <FiX size={14} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="font-bold text-xs">Rs.{Math.round(item.price).toLocaleString()}</p>
                        <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 gap-3">
                          <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="text-gray-400 hover:text-black">-</button>
                          <span className="text-[10px] font-black">{item.quantity}</span>
                          <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="text-gray-400 hover:text-black">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="flex gap-2 mb-8">
                <div className="relative flex-grow">
                  <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="COUPON CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-[10px] font-black tracking-widest outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="bg-black text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-lg"
                >
                  Apply
                </button>
              </div>
              {couponMessage && <p className="text-[9px] font-black uppercase text-orange-600 mb-4 px-2">{couponMessage}</p>}

              {/* Totals */}
              <div className="space-y-4 border-t border-gray-100 pt-8 mt-2">
                <div className="flex justify-between text-gray-400 text-[11px] font-black uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-black font-black">Rs.{Math.round(subtotal).toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-orange-600 text-[11px] font-black uppercase tracking-widest">
                    <span>Discount</span>
                    <span>-Rs.{Math.round(discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400 text-[11px] font-black uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-black font-black">Rs.{deliveryCharge}</span>
                </div>
                {paymentMethod === 'Cash on Delivery' && (
                  <div className="flex justify-between text-gray-400 text-[11px] font-black uppercase tracking-widest">
                    <span>COD Surcharge</span>
                    <span className="text-orange-500 font-black">+Rs.{extraDeliveryCharge}</span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div className="flex justify-between text-gray-400 text-[11px] font-black uppercase tracking-widest">
                    <span>Tax</span>
                    <span className="text-black font-black">Rs.{Math.round((subtotal - discount) * taxRate).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-6 mt-6 border-t-2 border-dashed border-gray-100">
                  <span className="font-black text-sm uppercase tracking-widest">Final Total</span>
                  <span className="font-black text-2xl text-orange-500">Rs.{Math.round(total).toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full m-4 outline-none relative"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <FiPlus size={40} className="rotate-45" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-4 text-gray-900">Order Placed!</h2>
          <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed">
            Thank you for your purchase. We've sent a confirmation email to <span className="text-black font-bold">{shippingAddress.email}</span>. Your order will be processed shortly.
          </p>
          <button
            onClick={() => { setIsModalOpen(false); router.push('/'); }}
            className="w-full bg-orange-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
          >
            Back to Shop
          </button>
        </div>
      </Modal>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default CartPage;
