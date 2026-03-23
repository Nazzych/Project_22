// src/hooks/useModal.ts
import { useContext } from 'react';
import { ModalContext } from '../types/modals';

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within ModalProvider');
    return context;
}

// import { useModal } from '../components/ui/modal/ModalProvider';
// function EditProfileForm() {
//   return (
//     <form className="space-y-4">
//       <input type="text" placeholder="Ім’я" className="input" />
//       <input type="text" placeholder="Прізвище" className="input" />
//       <textarea placeholder="Про себе" className="input" />
//       <button type="submit" className="btn-primary">Зберегти</button>
//     </form>
//   );
// }
// function ProfileEditButton() {
//   const { openModal } = useModal();
//   const handleClick = () => {
//     openModal({
//       id: 'edit-profile',
//       title: 'Редагувати профіль',
//       content: <EditProfileForm />,
//     });
//   };
//   return <button onClick={handleClick}>Редагувати профіль</button>;
// }

