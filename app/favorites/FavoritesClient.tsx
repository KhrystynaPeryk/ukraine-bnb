'use client'

import { Listing } from "@prisma/client"
import Container from "../components/Container"
import Heading from "../components/Heading"
import ListingCard from "../components/listings/ListingCard"

interface FavoritesClientProps {
    listings: Listing[],
    onFavoriteChange?: () => void
}

const FavoritesClient = ({ listings, onFavoriteChange }: FavoritesClientProps) => {
    return (
        <Container>
            <Heading title="Favorites" subtitle="List of places you have favorited"/>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {listings.map((listing) => (
                    <ListingCard 
                        key={listing.id}
                        data={listing}
                        onFavoriteChange={onFavoriteChange}
                    />
                ))}
            </div>
        </Container>
    )
}

export default FavoritesClient