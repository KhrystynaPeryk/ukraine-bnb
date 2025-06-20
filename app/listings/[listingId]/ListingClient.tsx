'use client'

import { Listing, Reservation, User } from "@prisma/client"
import { useCallback, useEffect, useMemo, useState } from "react"
import {categories} from "@/app/components/navbar/Categories"
import Container from "@/app/components/Container"
import ListingHead from "@/app/components/listings/ListingHead"
import ListingInfo from "@/app/components/listings/ListingInfo"
import useLoginModal from "@/app/hooks/useLoginModal"
import { useRouter } from "next/navigation"
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns"
import axios from "axios"
import toast from "react-hot-toast"
import ListingReservation from "@/app/components/listings/ListingReservation"
import { Range } from "react-date-range"
import { useCurrentUser } from "@/app/hooks/useCurrentUser.ts"
import { getAuth } from "firebase/auth"

const initialDateRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
}

interface ListingClientProps {
    reservations?: Reservation[],
    listing: Listing & {
        user: User
    },
}

const ListingClient = ({reservations = [], listing}: ListingClientProps) => {

    const {currentUser} = useCurrentUser()
    const loginModal = useLoginModal()
    const router = useRouter()
    const disabledDates = useMemo(() => {
        let dates: Date[] = []

        reservations.forEach((reservation) => {
            const range = eachDayOfInterval({
                start: new Date(reservation.startDate),
                end: new Date(reservation.endDate)
            })

            dates = [...dates, ...range]
        })

        return dates
    }, [reservations])

    const [isLoading, setIsLoading] = useState(false)
    const [totalPrice, setTotalPrice] = useState(listing.price)
    const [dateRange, setDateRange] = useState<Range>(initialDateRange)

    const onCreateReservation = useCallback(() => {
        if (!currentUser) {
            return loginModal.onOpen()
        }

        setIsLoading(true)
            // Get Firebase user for UID
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
            
        if (!firebaseUser) {
            toast.error('Authentication required');
            return loginModal.onOpen();
        }
        // Create axios config with Firebase UID in headers
        const config = {
            headers: {
                'x-firebase-uid': firebaseUser.uid
            }
        };

        axios.post('/api/reservations', {
            totalPrice,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            listingId: listing?.id
        }, config)
        .then(() => {
            toast.success('Listing reserved!')
            setDateRange(initialDateRange)
            router.push('/trips')
        })
        .catch((error: any) => {
            toast.error(error.response?.data?.error || 'Something went wrong')
        })
        .finally(() => {
            setIsLoading(false)
        })
    }, [totalPrice, dateRange, listing?.id, router, currentUser, loginModal])

    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            const dayCount = differenceInCalendarDays(dateRange.endDate, dateRange.startDate)

            if (dayCount && listing.price) {
                setTotalPrice(dayCount * listing.price)
            } else {
                setTotalPrice(listing.price)
            }
        }
    }, [dateRange, listing.price])

    const category = useMemo(() => {
        return categories.find((item) => item.label === listing.category)
    }, [listing.category])

    return (
        <Container>
            <div className="max-w-screen-lg mx-auto">
                <div className="flex flex-col gap-6">
                    <ListingHead title={listing.title} imageSrc={listing.imageSrc} locationValue={listing.locationValue} id={listing.id} />
                    <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
                        <ListingInfo 
                            user={listing.user} 
                            category={category} 
                            description={listing.description} 
                            roomCount={listing.roomCount}
                            guestCount={listing.guestCount}
                            bathroomCount={listing.bathroomCount}
                            locationValue={listing.locationValue}
                        />
                        <div className="order-first mb-10 md:order-last md:col-span-3">
                            <ListingReservation 
                                price={listing.price} 
                                totalPrice={totalPrice} 
                                onChangeDate={(value) => setDateRange(value)} 
                                dateRange={dateRange}
                                onSubmit={onCreateReservation}
                                disabled={isLoading}
                                disabledDates={disabledDates}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default ListingClient