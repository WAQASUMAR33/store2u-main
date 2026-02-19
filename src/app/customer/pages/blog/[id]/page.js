import React from "react";
import BlogDetailPage from "./mainpage"; // Ensure you are importing the correct component
import { headers } from "next/headers";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/blog/${id}`);

    if (!res.ok) {
      console.error(`Error: ${res.status} ${res.statusText}`);
      throw new Error('Failed to fetch blog data');
    }

    const blog = await res.json();

    // Return metadata with the fetched blog title and description
    return {
      title: blog.title || 'SolveAndWins',
      description: blog.description || 'Best website',
      keywords: blog.meta_focusKeyword || "SolveAndWins blogs keyword",
      alternates: {
        canonical: `/customer/pages/blog/${id}`,
      },
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

export default async function Home({ params }) {
  const { id } = await params;
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  let blog = null;
  try {
    const res = await fetch(`${baseUrl}/api/blog/${id}`);
    if (res.ok) {
      blog = await res.json();
    }
  } catch (e) { }

  const jsonLd = blog ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    image: `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${blog.image}`,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    description: blog.meta_description || blog.description.substring(0, 160).replace(/<[^>]*>/g, ''),
    author: {
      '@type': 'Organization',
      name: 'Store2U',
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogDetailPage id={id} />
    </>
  );
}
