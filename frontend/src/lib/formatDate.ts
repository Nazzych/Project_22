//?profile?.date_joined.split('T')[0]
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
