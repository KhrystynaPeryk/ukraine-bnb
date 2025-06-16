'use client'

import { CldUploadWidget } from 'next-cloudinary'
import { useCallback } from 'react'
import { MdPhotoCamera } from 'react-icons/md'
import Avatar from '../Avatar'

interface AvatarUploadProps {
    value: string
    onChange: (value: string) => void
    isEditing: boolean
}

const AvatarUpload = ({ value, onChange, isEditing }: AvatarUploadProps) => {
    const handleUpload = useCallback((result: any) => {
        onChange(result.info.secure_url)
    }, [onChange])

    return (
        <CldUploadWidget 
            options={{ 
                maxFiles: 1,
                cropping: true,
                croppingAspectRatio: 1,
                folder: 'ukraine-bnb/avatars'
            }} 
            uploadPreset="ukraine-bnb-preset" 
            onSuccess={handleUpload}
        >
            {({ open }) => {
                return (
                    <div className="relative">
                        <Avatar src={value} size="large" />
                        {isEditing && (
                            <div 
                                onClick={() => open?.()}
                                className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center cursor-pointer hover:bg-opacity-50 transition-all duration-200"
                            >
                                <div className="text-white text-center">
                                    <MdPhotoCamera className="w-8 h-8 mx-auto mb-1" />
                                    <p className="text-xs font-medium">Change Photo</p>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }}
        </CldUploadWidget>
    )
}

export default AvatarUpload