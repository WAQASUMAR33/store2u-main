'use client'
import React from 'react';
import 'tailwindcss/tailwind.css';
import Image from 'next/image';

const products = [
  {
    name: 'NESTLE LACTOGROW 3 Growing-up Formula',
    image: '/path/to/lactogrow.jpg',
    price: 2565,
    originalPrice: 2700,
    discount: '-5%',
  },
  {
    name: 'Airpro Double and Airpods Wireless Bluetooth Handfree',
    image: '/airpods.jpg',
    price: 899,
    originalPrice: 4000,
    discount: '-77%',
  },
  {
    name: 'New TWS Air 31 Airpods handfree',
    image: '/tws-airpods.jpg',
    price: 945,
    originalPrice: 4500,
    discount: '-79%',
  },
  {
    name: 'OKS® W26 Pro Max Special Edition IPS',
    image: '/oks-watch.jpg',
    price: 2279,
    originalPrice: 2282,
    discount: '-0%',
  },
  {
    name: 'Body Spray Pack of 3 For Men Gift | Big Bottle 200ml',
    image: '/body-spray.jpg',
    price: 880,
    originalPrice: 3000,
    discount: '-70%',
  },
  {
    name: 'Lipstick Pencil pack of 12/6 Lip liner Lip Pencil',
    image: '/lipstick-pencil.jpg',
    price: 419,
    originalPrice: 799,
    discount: '-47%',
    soldOut: true,
  },
];

const FlashSale = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Flash Sale</h2>
          <span className="text-orange-500 font-bold uppercase tracking-[0.2em] text-xs">On Sale Now</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ending in</span>
            <div className="flex items-center gap-1.5">
              <div className="bg-black text-white px-2.5 py-1.5 rounded-lg text-xs font-black">08</div>
              <span className="font-black">:</span>
              <div className="bg-black text-white px-2.5 py-1.5 rounded-lg text-xs font-black">11</div>
              <span className="font-black">:</span>
              <div className="bg-black text-white px-2.5 py-1.5 rounded-lg text-xs font-black">47</div>
            </div>
          </div>
          <button className="text-orange-500 border-2 border-orange-500 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-lg active:scale-95 shadow-orange-500/10">Shop More</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {products.map((product, index) => (
          <div
            key={index}
            className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 relative cursor-pointer"
          >
            {product.soldOut && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full z-10 uppercase">Sold Out</div>
            )}

            <div className="relative aspect-square bg-[#F3F4FB] overflow-hidden">
              <Image
                fill
                src={product.image}
                alt={product.name}
                className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute top-2 left-2 bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">
                {product.discount}
              </div>
            </div>

            <div className="p-3 flex flex-col flex-grow">
              <h3 className="text-[11px] font-bold text-gray-800 line-clamp-2 mb-2 leading-tight h-[2.5em]">{product.name}</h3>
              <div className="mt-auto flex flex-col items-start">
                <p className="text-sm font-black text-red-600 leading-none">Rs.{product.price}</p>
                <p className="text-[9px] text-gray-400 line-through font-bold mt-1">Rs.{product.originalPrice}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashSale;