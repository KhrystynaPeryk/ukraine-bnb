import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/libs/prismadb';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ firebaseUid: string }> }
    ) {
    try {
        const { firebaseUid } = await params;
        
        const user = await prisma.user.findUnique({
        where: {
            firebaseUid: firebaseUid
        }
        });

        if (!user) {
        return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
        );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ firebaseUid: string }> }
    ) {
    try {
        const { firebaseUid } = await params;
        const firebaseUidFromHeader = request.headers.get('x-firebase-uid');
        
        // Verify the user is updating their own profile
        if (firebaseUid !== firebaseUidFromHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const body = await request.json();
        const { name, image } = body;
        
        const user = await prisma.user.update({
        where: {
            firebaseUid: firebaseUid
        },
        data: {
            ...(name && { name }),
            ...(image && { image })
        }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
        );
    }
}