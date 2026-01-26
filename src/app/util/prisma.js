// src/util/prisma.js
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    // Ensure that DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
        console.warn("DATABASE_URL is not set in environment variables.");
    }

    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

export default prisma;
