'use client'
import React from 'react';

import TopCategories from './customer/components/TopCategories';
import Products from './customer/components/Products';
import Features from './customer/components/Features';
import Slider from './customer/components/Carousel';
import CategoryProductsComponent from './customer/components/CategoryProductsComponent';
import Customerlayout from './customer/layout';
import FaqSection from './customer/components/FaqSection';
import AllProducts from './customer/components/AllProducts';
import NewArrivals from './customer/components/NewArrivals';


export default function CustomerPage() {
  // const [formData, setFormData] = useState({});

  return (

    <Customerlayout>
      <div>



        <Slider />

        <main className="pt-0 px-4 pb-4">
          <div className="mt-[20px]">
            <TopCategories />
          </div>
          <div className="mt-[20px]">
            <AllProducts />
          </div>
          <div className="mt-[20px]">
            <Products />
          </div>
          <div className="mt-[20px]">
            <Features />
          </div>
          <div className="mt-[20px]">
            <NewArrivals />
          </div>
          <div className="mt-[20px]">
            <FaqSection />
          </div>
        </main>
      </div>
    </Customerlayout>
  );
};
