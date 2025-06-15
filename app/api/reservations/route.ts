import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/libs/prismadb";

export async function POST(request: Request) {
        try{
    // Get Firebase UID from headers
        const firebaseUid = request.headers.get('x-firebase-uid');
        
        if (!firebaseUid) {
            console.log('Unauthorized from listings route')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from database
        const currentUser = await prisma.user.findUnique({
            where: { firebaseUid: firebaseUid }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json()

        const {listingId, startDate, endDate, totalPrice} = body

        if (!listingId || !startDate || !endDate || !totalPrice) {
            return NextResponse.error()
        }

        const listingAndReservation = await prisma.listing.update({
            where: {
                id: listingId
            },
            data: {
                reservations: {
                    create: {
                        userId: currentUser.id,
                        startDate,
                        endDate,
                        totalPrice
                    }
                }
            }
        })

        return NextResponse.json(listingAndReservation)
    } catch (error) {
        console.error('Error creating reservation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Add GET method for fetching reservations
export async function GET(request: NextRequest) {
    try {       
        const { searchParams } = new URL(request.url);
        const listingId = searchParams.get('listingId');
        const userId = searchParams.get('userId');
        const authorId = searchParams.get('authorId');

        let query: any = {};

        if (listingId) {
            query.listingId = listingId;
        }

        if (userId) {
            query.userId = userId;
        }

        if (authorId) {
            query.listing = {
                userId: authorId
            };
        }

        const reservations = await prisma.reservation.findMany({
            where: query,
            include: {
                listing: true,
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}