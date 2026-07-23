import { create } from 'zustand';

export type AuthStep = 'phone' | 'otp_returning' | 'otp_new';

interface ExistingUser {
  name: string;
  avatar?: string;
  phone: string;
}

interface AuthModalStore {
  isOpen: boolean;
  step: AuthStep;
  phone: string;
  countryCode: string;
  isNewUser: boolean;
  existingUser: ExistingUser | null;
  openModal: () => void;
  closeModal: () => void;
  setStep: (step: AuthStep) => void;
  setPhone: (phone: string) => void;
  setCountryCode: (code: string) => void;
  setIsNewUser: (isNew: boolean) => void;
  setExistingUser: (user: ExistingUser | null) => void;
  reset: () => void;
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isOpen: false,
  step: 'phone',
  phone: '',
  countryCode: '+91',
  isNewUser: false,
  existingUser: null,

  openModal: () => set({ isOpen: true, step: 'phone' }),
  closeModal: () => set({ isOpen: false }),
  setStep: (step) => set({ step }),
  setPhone: (phone) => set({ phone }),
  setCountryCode: (countryCode) => set({ countryCode }),
  setIsNewUser: (isNewUser) => set({ isNewUser }),
  setExistingUser: (existingUser) => set({ existingUser }),
  reset: () => set({ step: 'phone', phone: '', isNewUser: false, existingUser: null }),
}));
