'use client';
import { useEffect, useState } from 'react';
import FilterableCustomerTable from './FilterableCustomerTable';

const fetchCustomers = async () => {
  try {
    const response = await fetch('/api/users');
    
    const data = await response.json();
    console.log('all users are: ',data);
    return data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export default function CustomerPage () {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const fetchedCustomers = await fetchCustomers();
    setCustomers(fetchedCustomers);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container w-full mx-auto  ">
      {isLoading ? (
        <div className="text-center text-2xl">Loading...</div>
      ) : (
        <FilterableCustomerTable
          customers={customers}
          fetchCustomers={fetchData}
        />
      )}
    </div>
  );
};
