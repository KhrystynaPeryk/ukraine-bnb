'use client'

import Image from "next/image"

interface AvatarProps {
    src?: string | null
    size?: 'small' | 'medium' | 'large'
}

const Avatar = ({ src, size = 'small' }: AvatarProps) => {
    const sizeClasses = {
        small: 'h-8 w-8',
        medium: 'h-10 w-10',
        large: 'h-24 w-24'
    }

    return (
        <Image
            className={`${sizeClasses[size]} rounded-full object-cover`}
            height={size === 'large' ? 96 : size === 'medium' ? 40 : 32}
            width={size === 'large' ? 96 : size === 'medium' ? 40 : 32}
            alt="Avatar"
            src={src || '/images/placeholder.jpg'}
        />
    )
}

export default Avatar