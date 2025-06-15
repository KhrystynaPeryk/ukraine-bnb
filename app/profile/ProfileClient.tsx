'use client'

import { useState, useCallback } from "react"
import { User } from "@prisma/client"
import Container from "../components/Container"
import { getAuth, updatePassword, updateProfile } from "firebase/auth"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"
import { FiEdit2, FiUser, FiMail, FiLock, FiHome, FiCalendar, FiMapPin } from "react-icons/fi"
import { MdPhotoCamera } from "react-icons/md"
import Avatar from "../components/Avatar"
import ImageUpload from "../components/inputs/ImageUpload"
import StatCard from "../components/profile/StatCard"

interface ProfileClientProps {
    currentUser: User
    stats: {
        properties: number
        reservations: number
        trips: number
    }
}

const ProfileClient = ({ currentUser, stats }: ProfileClientProps) => {
    const { currentUser: firebaseUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isEditingPassword, setIsEditingPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [profileData, setProfileData] = useState({
        name: currentUser.name || '',
        email: currentUser.email || '',
        image: currentUser.image || ''
    })
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleUpdateProfile = useCallback(async () => {
        if (!firebaseUser) return

        setIsLoading(true)
        try {
            const auth = getAuth()
            const user = auth.currentUser

            if (user) {
                // Update Firebase profile
                await updateProfile(user, {
                    displayName: profileData.name,
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
                        name: profileData.name,
                        image: profileData.image
                    })
                })

                if (response.ok) {
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
    }, [firebaseUser, profileData])

    const handleUpdatePassword = useCallback(async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match')
            return
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)
        try {
            const auth = getAuth()
            const user = auth.currentUser

            if (user) {
                await updatePassword(user, passwordData.newPassword)
                toast.success('Password updated successfully!')
                setIsEditingPassword(false)
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
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
    }, [passwordData])

    return (
        <Container>
            <div className="max-w-4xl mx-auto py-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 mb-8 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <Avatar src={profileData.image} size="large" />
                            {isEditing && (
                                <button
                                    onClick={() => document.getElementById('imageUpload')?.click()}
                                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <MdPhotoCamera className="w-5 h-5 text-gray-600" />
                                </button>
                            )}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold mb-2">
                                {currentUser.name || 'Welcome!'}
                            </h1>
                            <p className="text-blue-100 mb-4">
                                Member since {new Date(currentUser.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm text-black">
                                    {currentUser.emailVerified ? 'Verified Account' : 'Unverified'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={FiHome}
                        label="Properties"
                        value={stats.properties}
                        color="bg-green-500"
                    />
                    <StatCard
                        icon={FiCalendar}
                        label="Reservations"
                        value={stats.reservations}
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={FiMapPin}
                        label="Trips"
                        value={stats.trips}
                        color="bg-purple-500"
                    />
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <FiEdit2 className="w-4 h-4" />
                                {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FiUser className="inline w-4 h-4 mr-2" />
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter your full name"
                                    />
                                ) : (
                                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                        {currentUser.name || 'Not provided'}
                                    </p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FiMail className="inline w-4 h-4 mr-2" />
                                    Email Address
                                </label>
                                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                    {currentUser.email}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Email cannot be changed
                                </p>
                            </div>

                            {/* Image Upload (hidden) */}
                            {isEditing && (
                                <div className="hidden">
                                    <ImageUpload
                                        value={profileData.image}
                                        onChange={(value) => setProfileData(prev => ({ ...prev, image: value }))}
                                    />
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={isLoading}
                                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                            <button
                                onClick={() => setIsEditingPassword(!isEditingPassword)}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <FiLock className="w-4 h-4" />
                                Change Password
                            </button>
                        </div>

                        {isEditingPassword ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={isLoading}
                                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                    <button
                                        onClick={() => setIsEditingPassword(false)}
                                        className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiLock className="inline w-4 h-4 mr-2" />
                                        Password
                                    </label>
                                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                        ••••••••••••
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Status
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${currentUser.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <span className="text-sm text-gray-600">
                                            {currentUser.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                                        </span>
                                    </div>
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