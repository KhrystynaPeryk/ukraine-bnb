'use client'

import { ReservationWithListing } from "../trips/TripsClient"
import toast from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/navigation"
import Container from "../components/Container"
import Heading from "../components/Heading"
import { useCallback, useState } from "react"
import ListingCard from "../components/listings/ListingCard"
import { getAuth } from "firebase/auth"

interface ReservationsClientProps {
    reservations: ReservationWithListing[],
    onReservationChange?: () => void // Add callback prop
}

const ReservationsClient = ({ reservations, onReservationChange }: ReservationsClientProps) => {
    const [deletingId, setDeletingId] = useState('')

    const onCancel = useCallback(async (id: string) => {
        setDeletingId(id)

        try {
            // Get Firebase user for UID
            const auth = getAuth();
            const firebaseUser = auth.currentUser;
            
            if (!firebaseUser) {
                toast.error('Authentication required');
                setDeletingId('');
                return;
            }

            // Create axios config with Firebase UID in headers
            const config = {
                headers: {
                    'x-firebase-uid': firebaseUser.uid
                }
            };

            await axios.delete(`/api/reservations/${id}`, config);
            
            toast.success("Reservation cancelled");
            
            // Call the callback to refresh reservations list
            if (onReservationChange) {
                await onReservationChange();
            }
            
        } catch (error: any) {
            console.error('Cancellation error:', error);
            toast.error(error?.response?.data?.error || 'Something went wrong');
        } finally {
            setDeletingId('');
        }
    }, [onReservationChange])

    return (
        <Container>
            <Heading title="Reservations" subtitle="Bookings on your properties"/>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {reservations.map((reservation) => (
                    <ListingCard 
                        key={reservation.id}
                        data={reservation.listing}
                        reservation={reservation}
                        actionId={reservation.id}
                        onAction={onCancel}
                        disabled={deletingId === reservation.id}
                        actionLabel="Cancel guest reservation"
                    />
                ))}
            </div>
        </Container>
    )
}

export default ReservationsClient