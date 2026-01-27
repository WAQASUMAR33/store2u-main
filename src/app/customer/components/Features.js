// components/Features.js
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { FiTag, FiTruck, FiGift, FiGrid, FiRefreshCw } from 'react-icons/fi';

const features = [
  {
    icon: FiTag,
    title: 'Best prices & offers',
    description: 'Orders $50 or more',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-500'
  },
  {
    icon: FiTruck,
    title: 'Free delivery',
    description: '24/7 amazing services',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500'
  },
  {
    icon: FiGift,
    title: 'Great daily deal',
    description: 'When you sign up',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500'
  },
  {
    icon: FiGrid,
    title: 'Wide assortment',
    description: 'Mega Discounts',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-500'
  },
  {
    icon: FiRefreshCw,
    title: 'Easy returns',
    description: 'Within 30 days',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-500'
  },
];

const Features = () => {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-12 justify-center">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center group cursor-default w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] ${feature.bgColor} flex items-center justify-center mb-4 md:mb-6 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}>
                <feature.icon className={`w-6 h-6 md:w-10 md:h-10 ${feature.iconColor}`} />
              </div>
              <h3 className="text-[10px] md:text-sm font-black text-gray-900 mb-1 md:mb-2 uppercase tracking-widest leading-tight">{feature.title}</h3>
              <p className="text-[9px] md:text-xs text-gray-400 font-bold uppercase tracking-[0.1em]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
