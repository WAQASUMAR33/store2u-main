import React from "react";
import BlogDetailPage from "./mainpage"; // Ensure you are importing the correct component
import { headers } from "next/headers";

export async function generateMetadata({ params }) {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/blog/${params.id}`);

    if (!res.ok) {
      console.error(`Error: ${res.status} ${res.statusText}`);
      throw new Error('Failed to fetch blog data');
    }

    const blog = await res.json();

    // Return metadata with the fetched blog title and description
    return {
      title: blog.title || 'SolveAndWins',
      description: blog.description || 'Best website',
      keywords: blog.meta_focusKeyword || "SolveAndWins blogs keyword"
    };
  } catch (error) {
    console.error('Error fetching blog data:', error);

    // Provide fallback metadata in case of an error
    return {
      title: 'SolveAndWins',
      description: 'Best website',
      keywords: 'SolveAndWins blogs keyword'
    };
  }
}

export default function Home({ params }) {
  return (
    <>

      <BlogDetailPage id={params.id} />

    </>
  );
}
