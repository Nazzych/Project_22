import React, { useEffect, useState } from 'react';
// import '../../styles/loader.css';

export function Loader() {
    const [phase, setPhase] = useState<'waiting' | 'typing' | 'loading' | 'clearing'>('waiting');
    const [text, setText] = useState('');
    const fullText = 'Loading...';

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (phase === 'waiting') {
            timeout = setTimeout(() => setPhase('typing'), 2000); // ⏳ Затримка перед початком
        }

        if (phase === 'typing') {
            if (text.length < fullText.length) {
                timeout = setTimeout(() => {
                    setText(fullText.slice(0, text.length + 1));
                }, 200);
            } else {
                timeout = setTimeout(() => setPhase('loading'), 500);
            }
        }

        if (phase === 'loading') {
            timeout = setTimeout(() => setPhase('clearing'), 2000);
        }

        if (phase === 'clearing') {
            if (text.length > 0) {
                timeout = setTimeout(() => {
                    setText(fullText.slice(0, text.length - 1));
                }, 50);
            } else {
                timeout = setTimeout(() => setPhase('waiting'), 300); // Повертаємось до очікування
            }
        }

        return () => clearTimeout(timeout);
    }, [text, phase]);

    return (
        <div className="loader-background">
            <div className="loader-container">
                <div className="loader-frame min-h-24 min-w-24">
                    <span className="loader-text">{text}</span>
                    <div className="spinner" />
                </div>
            </div>
        </div>
    );
}
