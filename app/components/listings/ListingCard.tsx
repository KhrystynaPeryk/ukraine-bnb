'use client'

import useCountries from "@/app/hooks/useCountries"
import { Listing, Reservation, User } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"
import {format} from 'date-fns'

interface ListingCardProps{
    data: Listing,
    reservation?: Reservation,
    onAction?: (id: string) => void,
    disabled?: boolean,
    actionLabel?: string,
    actionId?: string,
    currentUser?: User | null
}

const ListingCard = ({
    data,
    reservation,
    onAction,
    disabled,
    actionLabel,
    actionId = "",
    currentUser
}: ListingCardProps) => {

    const router = useRouter()
    const {getByValue} = useCountries()

    const location = getByValue(data.locationValue)

    const handleCancel = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()

        if(disabled) {
            return
        }

        onAction?.(actionId)
    }, [onAction, actionId, disabled])

    const price = useMemo(() => {
        if (reservation) {
            return reservation.totalPrice
        }

        return data.price
    }, [reservation, data.price])


    const reservationDate = useMemo(() => {
        if (!reservation) {
            return null
        }

        const start = new Date(reservation.startDate)
        const end = new Date(reservation.endDate)

        return `${format(start, 'PP')} - ${format(end, 'PP')}`
    }, [reservation])

    return (
        <div>ListingCard</div>
    )
}

export default ListingCard