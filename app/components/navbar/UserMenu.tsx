'use client'

import { AiOutlineMenu } from "react-icons/ai"
import Avatar from "../Avatar"
import { useCallback, useState } from "react"
import MenuItem from "./MenuItem"
import useRegisterModal from "@/app/hooks/useRegisterModal"
import useLoginModal from "@/app/hooks/useLoginModal"
import useRentModal from "@/app/hooks/useRentModal"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import { useCurrentUser } from "@/app/hooks/useCurrentUser.ts"


const UserMenu = () => {
    const registerModal = useRegisterModal()
    const loginModal = useLoginModal()
    const rentModal = useRentModal()
    const router = useRouter()
    
    // Use Firebase auth instead of props
    const { logout } = useAuth()
    const {currentUser} = useCurrentUser()


    const [isOpen, setIsOpen] = useState(false)

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value)
    }, [])

    const onRent = useCallback(() => {
        if (!currentUser) {
            return loginModal.onOpen()
        }
        rentModal.onOpen()
    }, [currentUser, loginModal, rentModal])

    const handleLogout = useCallback(async () => {
        try {
            await logout()
            setIsOpen(false)
        } catch (error) {
            console.error('Logout error:', error)
        }
    }, [logout])

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
                <div onClick={onRent} className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer">
                    Rent Your Home
                </div>
                <div onClick={toggleOpen} className="p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition">
                    <AiOutlineMenu />
                    <div className="hidden md:block">
                        <Avatar src={currentUser?.image}/>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="absolute rounded-xl shadow-md w-[40vw] md:w-3/4 bg-white overflow-hidden right-0 top-12 text-sm">
                    <div className="flex flex-col cursor-pointer">
                        {currentUser ? (
                            <>
                                <MenuItem onClick={() => router.push('/profile')} label="My profile"/>
                                <MenuItem onClick={() => router.push('/trips')} label="My trips"/>
                                <MenuItem onClick={() => router.push('/favorites')} label="My favorites"/>
                                <MenuItem onClick={() => router.push('/reservations')} label="My reservations"/>
                                <MenuItem onClick={() => router.push('/properties')} label="My properties"/>
                                <MenuItem onClick={rentModal.onOpen} label="Rent my home"/>

                                <hr />

                                <MenuItem onClick={handleLogout} label="Logout"/>
                            </>
                        ) : (
                            <>
                                <MenuItem onClick={loginModal.onOpen} label="Login"/>
                                <MenuItem onClick={registerModal.onOpen} label="Sign up"/>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserMenu