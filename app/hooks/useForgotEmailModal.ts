import {create} from 'zustand'

interface ForgotEmailModalStore {
    isOpen: boolean,
    onOpen: () => void,
    onClose: () => void
}

const useForgotEmailModal = create<ForgotEmailModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({isOpen: false})
}))

export default useForgotEmailModal