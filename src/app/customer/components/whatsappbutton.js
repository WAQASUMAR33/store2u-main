'use client';
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppButton() {
  const phoneNumber = '92310356111';

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=Hello%Store2u.ca`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed bottom-20 right-6 z-40 cursor-pointer flex items-center justify-center bg-[#25D366] w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform"
      onClick={handleClick}>
      <FaWhatsapp className="text-white w-6 h-6" />
    </div>
  );
}
