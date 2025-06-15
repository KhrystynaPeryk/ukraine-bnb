import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/libs/prismadb";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ listingId: string }> }
) {
    try {
        const { listingId } = await params;

        if (!listingId || typeof listingId !== 'string') {
            return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
        }

        const listing = await prisma.listing.findUnique({
            where: {
                id: listingId
            },
            include: {
                user: true
            }
        });

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        return NextResponse.json(listing);
    } catch (error) {
        console.error('Error fetching listing:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE( request: Request, { params }: { params: Promise<{ listingId: string }>} ) {
    try{
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

        const {listingId} = await params

        if (!listingId || typeof listingId !== 'string') {
            throw new Error('Invalid ID')
        }

        const listing = await prisma.listing.deleteMany({
            where: {
                id: listingId,
                userId: currentUser.id
            }
        })

        return NextResponse.json(listing)
    } catch (error) {
        console.error('Error deleting listing:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}