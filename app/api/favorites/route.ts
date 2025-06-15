import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/libs/prismadb";

export async function GET(request: NextRequest) {
    try {
        // Get Firebase UID from headers
        const firebaseUid = request.headers.get('x-firebase-uid');
        
        if (!firebaseUid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from database
        const currentUser = await prisma.user.findUnique({
            where: { firebaseUid: firebaseUid }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get favorite listings
        const favorites = await prisma.listing.findMany({
            where: {
                id: {
                    in: [...(currentUser.favoriteIds || [])]
                }
            },
            include: {
                user: true // Include user data if needed
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}