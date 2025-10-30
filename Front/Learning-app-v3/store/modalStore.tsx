// store/modalStore.ts
import { create } from 'zustand';

type ModalType = 'success' | 'error' | 'confirm';

type ModalState = {
      isOpen: boolean;
      type: ModalType;
      message: string;
      showModal: (type: ModalType, message: string) => void;
      closeModal: () => void;
};

type ConfirmModalState =Omit<ModalState, 'type'> & {
      action:()=> void;
      setAction:(fn:()=>void)=>void;
      showModal: (message: string) => void;
}

export const useModalStore = create<ModalState>((set) => ({
      isOpen: false,

      type: 'success',
      message: '',
      showModal: (type, message) => set({ isOpen: true, type, message }),
      closeModal: () => set({ isOpen: false }),
}));

export const useConfirmModalStore = create<ConfirmModalState>((set) => ({
  isOpen: false,
  message: '',
  action: () => {},
  setAction: (fn) => set({ action: fn }),
  showModal: (message) => set({ isOpen: true, message }),
  closeModal: () => set({ isOpen: false }),
}));
