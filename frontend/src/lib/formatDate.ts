//?profile?.date_joined.split('T')[0]

//*<----------[Date]---------->
export function formatJoinDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
    }).format(date);
}

export function formatDateNumeric(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

//*<----------[Time]---------->
/**
 * Форматує дату у стиль "22:00" (тільки час)
 */
export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Форматує дату у відносний час: "10 хв тому", "2 год тому", "вчора" тощо
 */
export function formatRelativeTime(dateString: string, option: boolean = false): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} h. ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "ysd.";
    if (diffInDays < 7) return `${diffInDays} d-s ago`;

    // Якщо більше тижня — показуємо дату
    if (option) {
        return formatTime(dateString);
    } else {
        return formatDateNumeric(dateString);
    }
}