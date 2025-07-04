import { NextResponse } from "next/server";

import { prisma } from "@/app/libs/prismadb";

export async function DELETE(request: Request, { params }: { params: Promise<{ reservationId: string }>}) {
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

        const {reservationId} = await params

        if (!reservationId || typeof reservationId !== 'string') {
            throw new Error('Invalid ID')
        }

        const reservation = await prisma.reservation.deleteMany({
            where: {
                id: reservationId,
                OR: [
                    {userId: currentUser.id},
                    {listing: {userId: currentUser.id }}
                ]
            }
        })

        return NextResponse.json(reservation)
    } catch (error) {
        console.error('Error deleting reservation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}