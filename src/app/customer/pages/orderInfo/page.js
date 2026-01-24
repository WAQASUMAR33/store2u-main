// app/orderInfo/page.js
'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const OrderInfoPage = () => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Standard');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [orderId, setOrderId] = useState(null); // Optional: Use if you need to link order with this info
  const router = useRouter();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const orderInfo = {
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      orderId,
    };

    try {
      await axios.post('/api/orderInfo', orderInfo); // Save order info in the database
      alert('Order placed successfully!');
      router.push('/'); // Redirect to the homepage or any other page
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Checkout Information</h1>
          <p className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-widest">Complete your delivery and payment details</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form Section */}
          <form className="w-full lg:w-2/3 space-y-6" onSubmit={handlePlaceOrder}>
            {/* Shipping Details Card */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center space-x-4">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">1. Shipping Details</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2 flex flex-col">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Shipping Address</label>
                  <textarea
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your full delivery address..."
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none resize-none text-sm text-gray-800"
                    required
                  />
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Standard', 'Express'].map((method) => (
                      <div
                        key={method}
                        onClick={() => setDeliveryMethod(method)}
                        className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1 ${deliveryMethod === method
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-transparent bg-gray-50 text-gray-400 hover:border-orange-200'
                          }`}
                      >
                        <span className="text-xs font-black uppercase tracking-widest">{method}</span>
                        <span className="text-[10px] font-bold opacity-60">{method === 'Express' ? '1-2 Days' : '3-5 Days'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center space-x-4">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">2. Payment Method</h2>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {['Credit Card', 'PayPal', 'Bank Transfer'].map((method) => (
                    <div
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`cursor-pointer flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${paymentMethod === method
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-transparent bg-gray-50 hover:border-orange-200 text-gray-400'
                        }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? 'border-orange-600' : 'border-gray-300'}`}>
                          {paymentMethod === method && <div className="w-2.5 h-2.5 rounded-full bg-orange-600" />}
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-widest ${paymentMethod === method ? 'text-orange-900' : 'text-gray-400'}`}>{method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>

          {/* Sidebar / Summary Section */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sticky top-24">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Summary</h2>

              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Shipping</span>
                  <span className="text-xs font-black text-gray-900">{deliveryMethod === 'Express' ? 'Rs.1,500' : 'FREE'}</span>
                </div>
                <div className="h-px bg-gray-50" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Status</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-orange-500 italic leading-none">SECURE</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Payment</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:bg-orange-600 transition-all shadow-xl shadow-black/5 active:scale-[0.98]"
              >
                Place Order
              </button>

              <div className="mt-8 flex items-center justify-center space-x-2 text-gray-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted Checkout</span>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-orange-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-500/10">
              <h3 className="font-black text-lg uppercase tracking-tight mb-2">Need Help?</h3>
              <p className="text-orange-100 text-xs font-medium mb-8 leading-relaxed">Our support team is available 24/7 for any assistance.</p>
              <button className="w-full py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/20">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInfoPage;
