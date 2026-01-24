import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';


export async function GET(req, { params }) {
  const { id } = params;
  try {
    const companyDetails = await prisma.companyDetails.findUnique({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json(companyDetails || {});
  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    const updatedCompanyDetails = await prisma.companyDetails.update({
      where: { id: parseInt(id, 10) },
      data,
    });
    return NextResponse.json(updatedCompanyDetails);
  } catch (error) {
    console.error('Error updating company details:', error);
    return NextResponse.json({ error: 'Failed to update company details' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await prisma.companyDetails.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'Company details deleted successfully' });
  } catch (error) {
    console.error('Error deleting company details:', error);
    return NextResponse.json({ error: 'Failed to delete company details' }, { status: 500 });
  }
}
