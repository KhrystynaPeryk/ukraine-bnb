'use client'

import useForgotEmailModal from "@/app/hooks/useForgotEmailModal"
import Modal from "./Modal"
import { useState } from "react"
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import Input from "../inputs/Input"
import Heading from "../Heading"
import toast from "react-hot-toast"
import { useAuth } from "@/app/contexts/AuthContext"

const ForgotEmailModal = () => {
    const forgotModal = useForgotEmailModal()
    const [isLoading, setIsLoading] = useState(false)
    const { resetPassword } = useAuth()
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FieldValues>({
        defaultValues: {
            email: ''
        }
    })

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true)

        try {
            await resetPassword(data.email)
            toast.success('If an account with this email exists, a password reset link has been sent.', {
                duration: 6000
            })
        } catch (error: any) {
            console.error('Password reset error:', error)
            toast.error(error.message || 'Failed to send reset email')
        } finally {
            setIsLoading(false)
        }
    }

    const bodyContent = (
        <div className='flex flex-col gap-4'>
            <Heading 
                title="Reset your password" 
                subtitle='Enter your email and we will send you a reset link'
            />
            <Input 
                id="email" 
                label='Email' 
                type="email"
                disabled={isLoading} 
                register={register} 
                errors={errors} 
                required
            />
        </div>
    )

    return (
        <Modal 
            disabled={isLoading} 
            isOpen={forgotModal.isOpen} 
            title='Reset Password' 
            actionLabel='Send Reset Email' 
            onClose={forgotModal.onClose} 
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
        />
    )
}

export default ForgotEmailModal