'use client'
import useRentModal from "@/app/hooks/useRentModal"
import Modal from "./Modal"
import { useState, useMemo } from "react"
import Heading from '@/app/components/Heading'
import {categories} from '@/app/components/navbar/Categories'
import CategoryInput from "../inputs/CategoryInput"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import CountrySelect from "../inputs/CountrySelect"
import Counter from "../Counter"
import dynamic from "next/dynamic"
import ImageUpload from "../inputs/ImageUpload"
import Input from "../inputs/Input"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { getAuth } from "firebase/auth"

enum STEPS {
    CATEGORY = 0,
    LOCATION = 1,
    INFO = 2,
    IMAGES = 3,
    DESCRIPTION = 4,
    PRICE = 5
}

const RentModal = () => {
    const rentModal = useRentModal()
    const router = useRouter()

    const [step, setStep] = useState(STEPS.CATEGORY)
    const [isLoading, setIsLoading] = useState(false)

    const {register, handleSubmit, setValue, watch, formState: {errors}, reset} = useForm<FieldValues>({
        defaultValues: {
            category: '',
            location: null,
            guestCount: 1,
            roomCount: 1,
            bathroomCount: 1,
            imageSrc: '',
            price: 1,
            title: '',
            description: ''
        }
    })

    const category = watch('category')
    const location = watch('location')
    const guestCount = watch('guestCount')
    const roomCount = watch('roomCount')
    const bathroomCount = watch('bathroomCount')
    const imageSrc = watch('imageSrc')

    const Map = useMemo(() => dynamic(() => import ('../Map'), {ssr: false}), [location])

    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        })
    }

    const onBack = () => {
        setStep((value) => value - 1)
    }

    const onNext = () => {
        setStep((value) => value + 1)
    }

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (step !== STEPS.PRICE) {
            return onNext()
        }

        setIsLoading(true)

        // Get Firebase user for UID
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
            
        if (!firebaseUser) {
            toast.error('You must be logged in to create a listing');
            setIsLoading(false);
            return;
        }

        // Create axios config with Firebase UID in headers
        const config = {
            headers: {
                'x-firebase-uid': firebaseUser.uid
            }
        }
        console.log(data)
        axios.post('/api/listings', data, config)
        .then(() => {
            toast.success('Listing Created!')
            router.refresh()
            reset()
            setStep(STEPS.CATEGORY)
            rentModal.onClose()
        })
        .catch((error) => {
            toast.error('Something went wrong!', error)
        })
        .finally(() => {
            setIsLoading(false)
        })
    }

    const actionLabel = useMemo(() => {
        if (step === STEPS.PRICE) {
            return 'Create'
        }

        return 'Next'
    }, [step])

    
    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.CATEGORY) {
            return undefined
        }

        return 'Back'
    }, [step])

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading 
                title="Which of these best describes tour place?" 
                subtitle="Pick a category" 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                {categories.map((item) => (
                    <div key={item.label} className="cols-span-1">
                        <CategoryInput onClick={(category) => setCustomValue('category', category)} selected={category === item.label} label={item.label} icon={item.icon}/>
                    </div>
                ))}
            </div>
        </div>
    )

    if (step === STEPS.LOCATION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading title="Where is your place located?" subtitle="Helo guests find you!" />
                <CountrySelect 
                    value={location}
                    onChange={(value) => setCustomValue('location', value)}
                />
                <Map center={location?.latlng}/>
            </div>
        )
    }

    if (step === STEPS.INFO) {
        bodyContent = ( 
            <div className="flex flex-col gap-8">
                <Heading title="Share some basics about your place" subtitle="What amenities do you have?" />
                <Counter title="Guests" subtitle="How many guests do you allow?" value={guestCount} onChange={(value) => setCustomValue('guestCount', value)} />
                <hr />
                <Counter title="Rooms" subtitle="How many rooms do you have?" value={roomCount} onChange={(value) => setCustomValue('roomCount', value)} />
                <hr />
                <Counter title="Bathrooms" subtitle="How many bathrooms do you have?" value={bathroomCount} onChange={(value) => setCustomValue('bathroomCount', value)} />      
            </div>
        )
    }

    if (step === STEPS.IMAGES) {
        bodyContent = ( 
            <div className="flex flex-col gap-8">
                <Heading title="Add a photo" subtitle="Show guests what your place look like!" />
                <ImageUpload value={imageSrc} onChange={(value) => setCustomValue('imageSrc', value)}/>
            </div>
        )
    }

    if (step === STEPS.DESCRIPTION) {
        bodyContent = ( 
            <div className="flex flex-col gap-8">
                <Heading title="How would you describe your place?" subtitle="Short and sweet works best!" />
                <Input id="title" label="Title" disabled={isLoading} register={register} errors={errors} required/>
                <hr />
                <Input id="description" label="Description" disabled={isLoading} register={register} errors={errors} required/>
            </div>
        )
    }

    
    if (step === STEPS.PRICE) {
        bodyContent = ( 
            <div className="flex flex-col gap-8">
                <Heading title="Now, set your price" subtitle="How much do you charge per night?" />
                <Input id="price" label="Price" formatPrice={true} type="number" disabled={isLoading} register={register} errors={errors} required/>
            </div>
        )
    }

    return (
        <Modal 
            title="UkraineBnB your home!" 
            isOpen={rentModal.isOpen} 
            onClose={rentModal.onClose} 
            onSubmit={handleSubmit(onSubmit)} 
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
            body={bodyContent}
        />
    )
}

export default RentModal