'use client'

import { Range } from "react-date-range"

interface ListingReservationProps {
    price: number,
    dateRange: Range,
    totalPrice: number,
    onChangeDate: (value: Range) => void,
    onSubmit: () => void,
    disabled?: boolean,
    disabledDates: Date[]
}

const ListingReservation = ({price, dateRange, totalPrice, onChangeDate, onSubmit, disabledDates, disabled}: ListingReservationProps) => {
    return (
        <div>ListingReservation</div>
    )
}

export default ListingReservation