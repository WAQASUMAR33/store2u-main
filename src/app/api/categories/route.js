import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';

// Get all categories (GET /api/categories)
export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json({
      status: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories', status: false, error: error.message },
      { status: 500 }
    );
  }
}
// Create a new category (POST /api/categories)
export async function POST(request) {
  try {
    const { name, slug, imageUrl, meta_title, meta_description, meta_keywords } = await request.json();

    // Create the new category using the given slug
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        imageUrl,
        meta_title,
        meta_description,
        meta_keywords,
      },
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      {
        message: 'Failed to create category',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
