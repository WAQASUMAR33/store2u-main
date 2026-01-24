'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner';
import { motion } from 'framer-motion';
import Image from 'next/image';

const SubcategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [highestPrice, setHighestPrice] = useState(0);
  const [sortOption, setSortOption] = useState(""); // Track selected sort option
  const router = useRouter();

  useEffect(() => {
    const fetchProductsAndSubcategory = async () => {
      setIsLoading(true);
      try {
        const productsResponse = await axios.get('/api/products');
        setProducts(productsResponse.data);

        const filtered = productsResponse.data.filter(product => product.subcategorySlug === slug);
        setFilteredProducts(filtered);

        const maxProductPrice = Math.max(...filtered.map(product => product.price), 0);
        setHighestPrice(maxProductPrice);

        const subcategoryResponse = await axios.get(`/api/subcatdetail/${slug}`);
        if (subcategoryResponse.data && subcategoryResponse.data.status) {
          setSubcategory(subcategoryResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching subcategory or products data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsAndSubcategory();
  }, [slug]);

  const handleProductClick = (productSlug) => {
    router.push(`/customer/pages/products/${productSlug}`);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleFilter = () => {
    const filtered = products.filter(product =>
      product.price >= minPrice && product.price <= maxPrice && product.subcategorySlug === slug
    );
    setFilteredProducts(filtered);
  };

  const handleSort = (option) => {
    let sortedProducts = [...filteredProducts];
    if (option === "A-Z") {
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === "Z-A") {
      sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === "Price Low to High") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (option === "Price High to Low") {
      sortedProducts.sort((a, b) => b.price - a.price);
    } 
    setFilteredProducts(sortedProducts);
    setSortOption(option);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ThreeDots height="80" width="80" radius="9" color="#3498db" ariaLabel="three-dots-loading" visible={true} />
      </div>
    );
  }

  return (
    <div className="container mx-auto bg-white px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">
        {subcategory ? subcategory.name : 'No subcategory found'}
      </h2>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        {/* Price Filter */}
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
              className="border border-gray-300 p-2 rounded"
              placeholder="Min"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 0)}
              className="border border-gray-300 p-2 rounded"
              placeholder="Max"
            />
          </div>
          <div className='flex justify-center items-end'>
          <button
            onClick={handleFilter}
            className="bg-blue-500 text-white py-2  px-4 rounded hover:bg-blue-600"
          >
            Apply Filter
          </button>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sort By</label>
          <select
            value={sortOption}
            onChange={(e) => handleSort(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="">Select</option>
            <option value="A-Z">Alphabetically A-Z</option>
            <option value="Z-A">Alphabetically Z-A</option>
            <option value="Price Low to High">Price: Low to High</option>
            <option value="Price High to Low">Price: High to Low</option>
          
          </select>
        </div>
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const discountedPrice = product.discount
              ? (product.price - (product.price * product.discount / 100)).toFixed(2)
              : null;
            return (
              <div
                key={product.id}
                className="bg-white shadow-md rounded-sm cursor-pointer border border-gray-300 relative h-[20.5em] w-full min-w-[150px]"
                onClick={() => handleProductClick(product.slug)}
              >
                {product.discount && (
                  <div className="absolute z-40 top-0 left-0 bg-red-100 text-red-600 font-normal text-sm px-1 py-0.5">
                    {product.discount.toFixed(2)}% OFF
                  </div>
                )}
                <div className="relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      className="h-[220px] w-full mb-4 rounded bg-white overflow-hidden"
                    >
                      <Image
                        width={300}
                        height={220}
                        src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${product.images[0].url}`}
                        alt={product.name}
                        className="h-[220px] w-full object-contain"
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </motion.div>
                  ) : (
                    <div className="h-[220px] w-full bg-gray-200 mb-4 rounded flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="px-2">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      {product.discount ? (
                        <div className="flex items-center justify-center gap-3 flex-row-reverse">
                          <p className="text-xs font-normal text-gray-700 line-through">
                            Rs.{formatPrice(product.price)}
                          </p>
                          <p className="text-md font-bold text-red-700">
                            Rs.{formatPrice(discountedPrice)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-md font-bold text-gray-700">
                          Rs.{formatPrice(product.price)}
                        </p>
                      )}
                    </div>
                  </div>
                  <h3
                    className="text-sm font-normal text-gray-800 overflow-hidden hover:underline hover:text-blue-400 cursor-pointer"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      maxHeight: '3em',
                    }}
                    onClick={() => handleProductClick(product.slug)}
                  >
                    {product.name.toUpperCase()}
                  </h3>
                </div>
              </div>
            );
          })
        ) : (
          <p>No products found for this subcategory.</p>
        )}
      </div>
    </div>
  );
};

export default SubcategoryPage;
