import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/libs/prismadb";

export async function POST(
    request: Request
) {

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

        const {
            title, 
            description,
            imageSrc,
            category,
            roomCount,
            bathroomCount,
            guestCount,
            location,
            price
        } = body

        const listing = await prisma.listing.create({
            data: {
                title, 
                description,
                imageSrc,
                category,
                roomCount,
                bathroomCount,
                guestCount,
                locationValue: location.value,
                price: parseInt(price, 10),
                userId: currentUser.id
            }
        })

        return NextResponse.json(listing)
    } catch (error) {
        console.error('Error creating listing:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Add GET method for fetching listings
export async function GET(request: NextRequest) {
    try {       
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const guestCount = searchParams.get('guestCount');
        const roomCount = searchParams.get('roomCount');
        const bathroomCount = searchParams.get('bathroomCount');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const locationValue = searchParams.get('locationValue');
        const category = searchParams.get('category');

        let query: any = {};

        if (userId) {
            query.userId = userId;
        }

        if (category) {
            query.category = category;
        }

        if (roomCount) {
            query.roomCount = {
                gte: +roomCount
            };
        }

        if (guestCount) {
            query.guestCount = {
                gte: +guestCount
            };
        }

        if (bathroomCount) {
            query.bathroomCount = {
                gte: +bathroomCount
            };
        }

        if (locationValue) {
            query.locationValue = locationValue;
        }

        // filtering out all conflicts in reservations
        if (startDate && endDate) {
            query.NOT = {
                reservations: {
                    some: {
                        OR: [
                            {
                                endDate: { gte: startDate },
                                startDate: { lte: startDate }
                            },
                            {
                                startDate: { lte: endDate },
                                endDate: { gte: endDate }
                            }
                        ]
                    }
                }
            };
        }

        const listings = await prisma.listing.findMany({
            where: query,
            include: {
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(listings);
    } catch (error) {
        return NextResponse.json({ 
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}