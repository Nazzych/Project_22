// ModalProvider.tsx
import { useState, ReactNode } from 'react';
import { Modal } from '../components/shared/modal/Modal';
import { ModalContent, ModalContext } from '../types/modals';

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modal, setModal] = useState<ModalContent | null>(null);

    const openModal = (modal: ModalContent) => setModal(modal);
    const closeModal = () => setModal(null);

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            <Modal isOpen={!!modal} onClose={closeModal} title={modal?.title} width={modal?.width} x={modal?.x}>
                {modal?.content}
            </Modal>
        </ModalContext.Provider>
    );
}