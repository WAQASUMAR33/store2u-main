import { NextResponse } from 'next/server';
import prisma from '../../../../util/prisma';
import pluralize from 'pluralize'; // Import the pluralize library

export async function GET(request, { params }) {
  const search = params.id; // Fetch the search query from the URL parameters

  if (!search) {
    return NextResponse.json(
      { message: 'Search query cannot be empty', status: false },
      { status: 400 }
    );
  }

  try {
    // Split the search query into keywords and normalize them
    const keywords = search.split(/\s+/).filter(keyword => keyword.trim() !== '');
    console.log('Keywords are: ', keywords);

    // Create a set to collect search terms for both singular and plural forms
    const searchTerms = new Set();
    keywords.forEach(keyword => {
      searchTerms.add(keyword);
      searchTerms.add(pluralize.singular(keyword));  // Add singular form
      searchTerms.add(pluralize.plural(keyword));    // Add plural form
    });

    // Convert search terms into an array
    const searchArray = Array.from(searchTerms);

    // Construct a WHERE clause for all search terms using OR logic
    const whereConditions = searchArray.map(term => `
      Product.name LIKE '%${term}%' 
      OR Product.description LIKE '%${term}%' 
      OR Product.subcategorySlug LIKE '%${term}%'
      OR Product.sku LIKE '%${term}%'
    `).join(' OR ');

    // Efficient query to search all keywords in a single query
    const query = `
      SELECT 
        Product.id, 
        Product.slug,
        Product.name, 
        Product.description, 
        Product.price, 
        Product.discount, 
        Product.subcategorySlug,
        Product.stock,
        COALESCE(
          (
            SELECT 
              JSON_ARRAYAGG(Image.url)
            FROM 
              Image 
            WHERE 
              Image.productId = Product.id
          ), 
          JSON_ARRAY()
        ) AS images
      FROM 
        Product 
      WHERE 
        (${whereConditions})
    `;

    // Execute the query
    const products = await prisma.$queryRawUnsafe(query);

    // Remove duplicate products if any, based on the product ID
    const uniqueProducts = Array.from(new Map(products.map(product => [product.id, product])).values());

    return NextResponse.json({ data: uniqueProducts, status: true }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products', error: error.message, status: false },
      { status: 500 }
    );
  }
}
