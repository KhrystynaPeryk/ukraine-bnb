import getListingById from "@/app/actions/getListingById"
import EmptyState from "@/app/components/EmptyState"
import ListingClient from "./ListingClient"
import getReservations from "@/app/actions/getReservations"

interface IParams {
    listingId?: string
}

const ListingPage = async({params}: {params: IParams}) => {

    const listing = await getListingById(params)
    const reservations = await getReservations(params)

    if (!listing) {
        return EmptyState
    }
    return (
        <ListingClient listing={listing} reservations={reservations}/>
    )
}

export default ListingPage