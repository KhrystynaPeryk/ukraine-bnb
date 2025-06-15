'use client'

import { useRouter } from "next/navigation"
import { User, Listing} from "@prisma/client"
import Container from "../components/Container"
import Heading from "../components/Heading"
import { useCallback, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import ListingCard from "../components/listings/ListingCard"
import { getAuth } from "firebase/auth"

interface PropertiesClientProps {
    listings: Listing[],
    onListingChange?: () => void // Add callback prop
}

const PropertiesClient = ({ listings, onListingChange }: PropertiesClientProps) => {
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

            await axios.delete(`/api/listings/${id}`, config);
            
            toast.success('Listing deleted');
            
            // Call the callback to refresh listings
            if (onListingChange) {
                await onListingChange();
            }
            
        } catch (error: any) {
            console.error('Delete listing error:', error);
            toast.error(error?.response?.data?.error || 'Something went wrong');
        } finally {
            setDeletingId('');
        }
    }, [onListingChange])

    return (
        <Container>
            <Heading title="Properties" subtitle="List of your properties" />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {listings.map((listing) => (
                    <ListingCard 
                        key={listing.id}
                        data={listing}
                        actionId={listing.id}
                        onAction={onCancel}
                        disabled={deletingId === listing.id}
                        actionLabel="Delete property"
                    />
                ))}
            </div>
        </Container>
    )
}

export default PropertiesClient