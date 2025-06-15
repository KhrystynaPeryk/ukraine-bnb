import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
    try {    
        const body = await request.json();
        const { firebaseUid, name, email, emailVerified, image } = body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
        where: {
            firebaseUid: firebaseUid
        }
        });

        if (existingUser) {
        return NextResponse.json(existingUser);
        }

        // Create new user
        const user = await prisma.user.create({
        data: {
            firebaseUid,
            name,
            email,
            emailVerified: emailVerified ? new Date(emailVerified) : null,
            image
        }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('❌ Error creating user:', error);
        return NextResponse.json(
        { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
        );
    }
}