import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { ToastProvider } from './providers/MessageProvider';
import { ProfileProvider } from './providers/ProfileProvider';
import { ModalProvider } from './providers/ModalProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <ProfileProvider>
                        <ModalProvider>
                            <App />
                        </ModalProvider>
                    </ProfileProvider>
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    </React.StrictMode>
);
