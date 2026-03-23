import { useEffect, useState } from 'react';

/**
 * Кастомний хук для перевірки відповідності медіа-запиту
 * @param query - CSS media query string (наприклад, '(max-width: 768px)')
 * @returns true, якщо запит виконується
**/
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQueryList = window.matchMedia(query);

        const handleChange = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Додаємо слухача
        mediaQueryList.addEventListener('change', handleChange);

        // Початкове значення
        setMatches(mediaQueryList.matches);

        // Очищення
        return () => {
            mediaQueryList.removeEventListener('change', handleChange);
        };
    }, [query]);

    return matches;
}
