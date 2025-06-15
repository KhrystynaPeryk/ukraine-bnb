import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";

import { User } from "@prisma/client";

import useLoginModal from "./useLoginModal";

interface IUseFavorite {
    listingId: string,
    currentUser?: User | null,
    onUserUpdate?: () => void // Add callback for user updates
}

const useFavorite = ({listingId, currentUser, onUserUpdate}: IUseFavorite) => {
    const router = useRouter()
    const loginModal = useLoginModal()
    const [isLoading, setIsLoading] = useState(false)

    const hasFavorited = useMemo(() => {
        const list = currentUser?.favoriteIds || []
        return list.includes(listingId)
    }, [currentUser, listingId])

    const toggleFavorite = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()

        if (!currentUser) {
            return loginModal.onOpen()
        }

        if (isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            const auth = getAuth();
            const firebaseUser = auth.currentUser;
            
            if (!firebaseUser) {
                toast.error('Authentication required');
                return loginModal.onOpen();
            }

            const config = {
                headers: {
                    'x-firebase-uid': firebaseUser.uid
                }
            };

            let response;

            if (hasFavorited) {
                response = await axios.delete(`/api/favorites/${listingId}`, config);
            } else {
                response = await axios.post(`/api/favorites/${listingId}`, {}, config);
            }
            
            // Call the callback to refresh user data
            if (onUserUpdate) {
                await onUserUpdate();
            }
            
            toast.success(hasFavorited ? 'Removed from favorites' : 'Added to favorites');
        } catch (error: any) {
            console.error('Favorite toggle error:', error);
            toast.error(error.response?.data?.error || 'Something went wrong!');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, hasFavorited, listingId, loginModal, isLoading, onUserUpdate])

    return {
        hasFavorited,
        toggleFavorite
    }
}

export default useFavorite