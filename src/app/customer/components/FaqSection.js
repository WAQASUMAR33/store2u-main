'use client';
import React, { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import axios from 'axios';

const FaqSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get('/api/faq');
        setFaqs(response.data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index); // Toggle logic
  };

  return (
    <section className="pb-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h3 className="text-[2rem] font-black text-black mb-6 uppercase tracking-tighter">Frequently Asked Questions</h3>
          <div className="h-1.5 w-24 bg-orange-500 mx-auto rounded-full shadow-lg shadow-orange-500/20"></div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button className="px-10 py-3.5 bg-orange-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-full shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 hover:bg-orange-600">General Info</button>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.id || index}
              className={`border rounded-lg bg-white overflow-hidden transition-all duration-300 ${activeIndex === index ? 'shadow-lg border-l-4 border-l-orange-500' : 'border-gray-100'}`}
            >
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className={`font-black text-[13px] md:text-sm uppercase tracking-wide leading-relaxed ${activeIndex === index ? 'text-black' : 'text-gray-500 hover:text-black transition-colors'}`}>
                  {faq.question}
                </span>
                <span className="text-gray-400 ml-4">
                  {activeIndex === index ? <FiX size={20} /> : <FiPlus size={20} />}
                </span>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 pt-0 text-orange-500 text-sm font-medium leading-relaxed border-t border-transparent">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}

          {/* Fallback if no FAQs are loaded yet, to match visual style for dev */}
          {faqs.length === 0 && (
            <div className="py-8 text-center text-gray-400 italic">No FAQs available at the moment.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
