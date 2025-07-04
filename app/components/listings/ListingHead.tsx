'use client'

import useCountries from "@/app/hooks/useCountries"
import Heading from "../Heading"
import Image from "next/image"
import HeartButton from "../HeartButton"

interface ListingHeadProps {
    title: string,
    locationValue: string,
    imageSrc: string,
    id: string,
}

const ListingHead = ({ title, locationValue, imageSrc, id}: ListingHeadProps) => {
    const {getByValue} = useCountries()
    const location = getByValue(locationValue)
    return (
        <>
            <Heading 
                title={title}
                subtitle={`${location?.region}, ${location?.label}`}
            />
            <div className="w-full h-[60vh] overflow-hidden reounded-xl relative">
                <Image alt="Image" src={imageSrc} fill className="object-cover w-full" />
                <div className="absolute top-5 right-5">
                    <HeartButton listingId={id} />
                </div>
            </div>
        </>
    )
}

export default ListingHead