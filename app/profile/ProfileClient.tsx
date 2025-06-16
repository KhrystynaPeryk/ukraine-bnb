'use client'

import { useState, useCallback } from "react"
import { User } from "@prisma/client"
import Container from "../components/Container"
import { getAuth, updatePassword, updateProfile } from "firebase/auth"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"
import { FiEdit2, FiUser, FiMail, FiLock, FiHome, FiCalendar, FiMapPin } from "react-icons/fi"
import Input from "../components/inputs/Input"
import StatCard from "../components/profile/StatCard"
import AvatarUpload from "../components/inputs/AvatarUpload"
import { useForm, FieldValues, SubmitHandler } from "react-hook-form"
import { useRouter } from "next/navigation"

interface ProfileClientProps {
    currentUser: User
    stats: {
        properties: number
        reservations: number
        trips: number
    }
}

const ProfileClient = ({ currentUser: initialUser, stats }: ProfileClientProps) => {
    const { currentUser: firebaseUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isEditingPassword, setIsEditingPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    
    // Use local state for current user to enable immediate UI updates
    const [currentUser, setCurrentUser] = useState(initialUser)
    
    const [profileData, setProfileData] = useState({
        name: currentUser.name || '',
        email: currentUser.email || '',
        image: currentUser.image || ''
    })
    

    // React Hook Form for profile editing
    const profileForm = useForm<FieldValues>({
        defaultValues: {
            name: currentUser.name || '',
        }
    })

    // Watch for image changes to update avatar immediately
    const handleImageChange = useCallback((value: string) => {
        setProfileData(prev => ({ ...prev, image: value }))
        toast.success('Profile photo updated! Don\'t forget to save your changes.')
    }, [])

    // React Hook Form for password change
    const passwordForm = useForm<FieldValues>({
        defaultValues: {
            newPassword: '',
            confirmPassword: ''
        }
    })

    // Check if user is signed in with Google
    const isGoogleUser = firebaseUser?.providerData?.some(
        provider => provider.providerId === 'google.com'
    ) || false

    const handleUpdateProfile: SubmitHandler<FieldValues> = useCallback(async (data) => {
        if (!firebaseUser) return

        setIsLoading(true)
        try {
            const auth = getAuth()
            const user = auth.currentUser

            if (user) {
                // Update Firebase profile
                await updateProfile(user, {
                    displayName: data.name,
                    photoURL: profileData.image
                })

                // Update database
                const response = await fetch(`/api/users/${user.uid}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-firebase-uid': user.uid
                    },
                    body: JSON.stringify({
                        name: data.name,
                        image: profileData.image
                    })
                })

                if (response.ok) {
                    const updatedUser = await response.json()
                    
                    // IMPORTANT: Update local state immediately to reflect changes
                    setCurrentUser(updatedUser)
                    setProfileData(prev => ({ ...prev, name: data.name }))

                    // This will update the navbar avatar
                    window.dispatchEvent(new CustomEvent('userUpdated'))
                    
                    toast.success('Profile updated successfully!')
                    setIsEditing(false)
                } else {
                    throw new Error('Failed to update profile')
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setIsLoading(false)
        }
    }, [firebaseUser, profileData.image])

    const handleUpdatePassword: SubmitHandler<FieldValues> = useCallback(async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error('New passwords do not match')
            return
        }

        if (data.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)
        try {
            const auth = getAuth()
            const user = auth.currentUser

            if (user) {
                await updatePassword(user, data.newPassword)
                toast.success('Password updated successfully!')
                setIsEditingPassword(false)
                passwordForm.reset()
            }
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                toast.error('Please log out and log back in to change your password')
            } else {
                toast.error(error.message || 'Failed to update password')
            }
        } finally {
            setIsLoading(false)
        }
    }, [passwordForm])

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false)
        profileForm.reset({
            name: currentUser.name || ''
        })
        setProfileData(prev => ({ ...prev, name: currentUser.name || '' }))
    }, [profileForm, currentUser.name])

    const handleCancelPasswordEdit = useCallback(() => {
        setIsEditingPassword(false)
        passwordForm.reset()
    }, [passwordForm])

    return (
        <Container>
            <div className="max-w-4xl mx-auto py-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#075aa3] to-[#ffcf0b] rounded-3xl p-8 mb-8 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <AvatarUpload
                            value={profileData.image}
                            onChange={handleImageChange}
                            isEditing={isEditing}
                        />
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold mb-2">
                                {currentUser.name || 'Welcome!'}
                            </h1>
                            <p className="text-blue-100 mb-4">
                                Member since {new Date(currentUser.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={FiHome}
                        label="Properties"
                        value={stats.properties}
                        color="bg-[#075aa3]"
                        onClick={() => router.push('/properties')}
                    />
                    <StatCard
                        icon={FiCalendar}
                        label="Reservations"
                        value={stats.reservations}
                        color="bg-[#075aa3]"
                        onClick={() => router.push('/reservations')}
                    />
                    <StatCard
                        icon={FiMapPin}
                        label="Trips"
                        value={stats.trips}
                        color="bg-[#075aa3]"
                        onClick={() => router.push('/trips')}
                    />
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                            <button
                                onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <FiEdit2 className="w-4 h-4" />
                                {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                        </div>

                        <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <div className="flex items-center mb-2">
                                    <FiUser className="w-4 h-4 mr-2 text-gray-700" />
                                    <span className="text-sm font-medium text-gray-700">Full Name</span>
                                </div>
                                {isEditing ? (
                                    <Input
                                        id="name"
                                        label="Enter your full name"
                                        register={profileForm.register}
                                        errors={profileForm.formState.errors}
                                        required
                                    />
                                ) : (
                                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                        {currentUser.name || 'Not provided'}
                                    </p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <div className="flex items-center mb-2">
                                    <FiMail className="w-4 h-4 mr-2 text-gray-700" />
                                    <span className="text-sm font-medium text-gray-700">Email Address</span>
                                </div>
                                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                    {currentUser.email}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Email cannot be changed
                                </p>
                            </div>

                            {isEditing && (
                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-[#075aa3] text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>


                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                            {/* Conditionally render password change button based on auth provider */}
                            {!isGoogleUser ? (
                                <button
                                    onClick={() => isEditingPassword ? handleCancelPasswordEdit() : setIsEditingPassword(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <FiLock className="w-4 h-4" />
                                    {isEditingPassword ? 'Cancel' : 'Change Password'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2 text-gray-500 bg-gray-50 rounded-lg">
                                    <FiLock className="w-4 h-4" />
                                    <span className="text-sm">Managed by Google</span>
                                </div>
                            )}
                        </div>

                        {/* Show Google user message */}
                        {isGoogleUser && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-blue-700 text-sm">
                                        You're signed in with Google. Password changes are managed through your Google account.
                                    </span>
                                </div>
                            </div>
                        )}

                        {!isGoogleUser && isEditingPassword ? (
                            <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)} className="space-y-4">
                                <Input
                                    id="newPassword"
                                    label="Enter new password"
                                    type="password"
                                    register={passwordForm.register}
                                    errors={passwordForm.formState.errors}
                                    required
                                />
                                <Input
                                    id="confirmPassword"
                                    label="Confirm new password"
                                    type="password"
                                    register={passwordForm.register}
                                    errors={passwordForm.formState.errors}
                                    required
                                />
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-[#075aa3] text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelPasswordEdit}
                                        className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center mb-2">
                                        <FiLock className="w-4 h-4 mr-2 text-gray-700" />
                                        <span className="text-sm font-medium text-gray-700">Password</span>
                                    </div>
                                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                        {isGoogleUser ? 'Managed by Google' : '••••••••••••'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default ProfileClient