'use client'

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai"
import useFavorite from "../hooks/useFavorite"
import { useCurrentUser } from "../hooks/useCurrentUser.ts"

interface HeartButtonProps {
    listingId : string,
    onFavoriteChange?: () => void
}

const HeartButton = ({ listingId, onFavoriteChange }: HeartButtonProps) => {
    const { currentUser, refreshUser } = useCurrentUser()
    const { hasFavorited, toggleFavorite } = useFavorite({
        listingId, 
        currentUser,
        onUserUpdate: async () => {
            await refreshUser(); // Refresh user data
            onFavoriteChange?.(); // Refresh favorites list
        }
    })
    
    return (
        <div onClick={toggleFavorite} className="relative hover:opacity-80 transition cursor-pointer">
            <AiOutlineHeart size={28} className="fill-white absolute -top-[2px] -right-[2px]"/>
            <AiFillHeart size={24} className={hasFavorited ? 'fill-rose-500' : 'fill-neutral-500/70'} />
        </div>
    )
}

export default HeartButton