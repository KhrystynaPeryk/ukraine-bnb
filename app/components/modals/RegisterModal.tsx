'use client'

import { FcGoogle } from 'react-icons/fc'
import { useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import Heading from '../Heading'

import useRegisterModal from '@/app/hooks/useRegisterModal'
import useLoginModal from '@/app/hooks/useLoginModal'
import Modal from './Modal'
import Input from '../inputs/Input'
import toast from 'react-hot-toast'
import Button from '../Button'
import { useAuth } from '@/app/contexts/AuthContext'

const RegisterModal = () => {
    const registerModal = useRegisterModal()
    const loginModal = useLoginModal()
    const [isLoading, setIsLoading] = useState(false)
    const { signup, loginWithGoogle } = useAuth()
    
    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    })

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true)

        try {
            await signup(data.email, data.password, data.name)
            toast.success('Account created! Please check your email for verification.')
            registerModal.onClose()
            loginModal.onOpen()
        } catch (error: any) {
            toast.error(error.message || 'Failed to create account')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignup = async () => {
        setIsLoading(true)
        try {
            await loginWithGoogle()
            toast.success('Account created with Google!')
            registerModal.onClose()
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign up with Google')
        } finally {
            setIsLoading(false)
        }
    }

    const toggle = useCallback(() => {
        registerModal.onClose()
        loginModal.onOpen()
    }, [loginModal, registerModal])

    const bodyContent = (
        <div className='flex flex-col gap-4'>
            <Heading title="Welcome to Ukraine BnB" subtitle='Create an account'/>
            <Input 
                id="email" 
                label='Email' 
                disabled={isLoading} 
                register={register} 
                errors={errors} 
                required
            />
            <Input 
                id="name" 
                label='Name' 
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
        </div>
    )

    const footerContent = (
        <div className='flex flex-col gap-4 mt-3'>
            <hr />
            <Button 
                outline 
                label="Continue with Google" 
                icon={FcGoogle} 
                onClick={handleGoogleSignup}
                disabled={isLoading}
            />
            <div className='text-neutral-500 text-center mt-4 font-light'>
                <div className='flex flex-row items-center justify-center gap-2'>
                    <div>Already have an account?</div>
                    <div 
                        className='text-neutral-800 cursor-pointer hover:underline' 
                        onClick={toggle}
                    >
                        Log in
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <Modal 
            disabled={isLoading} 
            isOpen={registerModal.isOpen} 
            title='Register' 
            actionLabel='Continue' 
            onClose={registerModal.onClose} 
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
        />
    )
}

export default RegisterModal