import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prismadb";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ listingId: string }> }
) {
    try {

        // Get Firebase UID from Authorization header
        const firebaseUid = request.headers.get('x-firebase-uid');
            
        if (!firebaseUid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from database using Firebase UID
        const currentUser = await prisma.user.findUnique({
            where: {
                firebaseUid: firebaseUid
            }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const {listingId} = await params

        if (!listingId || typeof listingId !== 'string') {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        let favoriteIds = [... (currentUser.favoriteIds || [])]

        if (!favoriteIds.includes(listingId)) {
            favoriteIds.push(listingId);
        }

        const user = await prisma.user.update({
            where: {
                id: currentUser.id
            },
            data: {
                favoriteIds
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error in POST favorites:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ listingId: string }> }
) {

    try {
        // Get Firebase UID from Authorization header
        const firebaseUid = request.headers.get('x-firebase-uid');
        
        if (!firebaseUid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from database using Firebase UID
        const currentUser = await prisma.user.findUnique({
            where: {
                firebaseUid: firebaseUid
            }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const {listingId} = await params

        if (!listingId || typeof listingId !== 'string') {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        let favoriteIds = [...(currentUser.favoriteIds || [])]

        favoriteIds = favoriteIds.filter((id) => id !== listingId)

        const user = await prisma.user.update({
            where: {
                id: currentUser.id
            },
            data: {
                favoriteIds
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error in DELETE favorites:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}