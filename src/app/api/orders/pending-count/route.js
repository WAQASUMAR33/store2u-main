
import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const count = await prisma.order.count({
            where: {
                status: 'PENDING',
            },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching pending order count:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pending order count' },
            { status: 500 }
        );
    }
}
