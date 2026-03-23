export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'card_glass' | 'card_accent' | 'card_primary' | 'card_secondary'
    size?: 'sm' | 'md' | 'lg' | 'wf'
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'btn_primary' | 'btn_secondary' | 'btn_glass' | 'btn_accent' | 'btn_destructive' | 'btn_muted' | 'btn_info' | 'btn_success' | 'btn_warning' | 'btn_disabled'
    size?: 'sm' | 'md' | 'lg' | 'wf' | 'icon'
    isLoading?: boolean
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    buttonLabel?: string;
    webkitdirectory?: boolean;
}

export interface SelectOption {
    value: string | number
    label: React.ReactNode
}
export interface DifficultyOption extends SelectOption {
    points: number[];
}

export interface SelectProps {
    options: SelectOption[]
    placeholder?: string
    defaultLabel?: React.ReactNode
    className?: string
    dropdownWidth?: string
    value?: string
    onChange?: (value: string) => void
}

export interface ProgressBarProps {
    value: number;
    max?: number;
    label?: string;
    showValue?: boolean;
    className?: string;
    colorClass?: string;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    icon?: React.ReactNode;
    resizable?: boolean;
}
