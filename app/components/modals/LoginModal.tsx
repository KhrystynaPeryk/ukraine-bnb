'use client'

import { FcGoogle } from 'react-icons/fc'
import { useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import Heading from '../Heading'

import useLoginModal from '@/app/hooks/useLoginModal'
import useRegisterModal from '@/app/hooks/useRegisterModal'
import Modal from './Modal'
import Input from '../inputs/Input'
import toast from 'react-hot-toast'
import Button from '../Button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import useForgotEmailModal from '@/app/hooks/useForgotEmailModal'

const LoginModal = () => {
    const registerModal = useRegisterModal()
    const loginModal = useLoginModal()
    const forgotEmailModal = useForgotEmailModal()

    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const { login, loginWithGoogle, resendEmailVerification } = useAuth()
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FieldValues>({
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true)

        try {
            await login(data.email, data.password)
            // AuthContext will handle verification check
            // If we get here and user is verified, show success
            toast.success('Logged in successfully!')
            reset()
            loginModal.onClose()
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to log in')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        try {
            await loginWithGoogle()
            loginModal.onClose()
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to log in with Google')
        } finally {
            setIsLoading(false)
        }
    }

    const toggle = useCallback(() => {
        loginModal.onClose()
        registerModal.onOpen()
    }, [loginModal, registerModal])

    const toggleForgotEmail = useCallback(() => {
        loginModal.onClose()
        forgotEmailModal.onOpen()
    }, [loginModal, forgotEmailModal])
    
    const bodyContent = (
        <div className='flex flex-col gap-4'>
            <Heading title="Welcome back" subtitle='Login to your account'/>
            <Input 
                id="email" 
                label='Email' 
                disabled={isLoading} 
                register={register} 
                errors={errors} 
                required
            />
            <Input 
                id="password" 
                label='Password' 
                type="password" 
                disabled={isLoading} 
                register={register} 
                errors={errors} 
                required
            />
            <div onClick={toggleForgotEmail} className='italic cursor-pointer hover:text-[#075aa3]'>Forgot Password?</div>
        </div>
    )

    const footerContent = (
        <div className='flex flex-col gap-4 mt-3'>
            <hr />
            <Button 
                outline 
                label="Continue with Google" 
                icon={FcGoogle} 
                onClick={handleGoogleLogin}
                disabled={isLoading}
            />
            <div className='text-neutral-500 text-center mt-4 font-light'>
                <div className='flex flex-row items-center justify-center gap-2'>
                    <div>First time using Ukraine BnB?</div>
                    <div 
                        className='text-neutral-800 cursor-pointer hover:underline' 
                        onClick={toggle}
                    >
                        Create an account
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <Modal 
            disabled={isLoading} 
            isOpen={loginModal.isOpen} 
            title='Login' 
            actionLabel='Continue' 
            onClose={loginModal.onClose} 
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
        />
    )
}

export default LoginModal