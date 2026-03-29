import { ReactNode } from "react";

export interface Profile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    date_joined: string;
    is_staff: boolean | false;
    profile: {
        address: string;
        youtube: string;
        twitter: string;
        linkedin: string;
        git: string;
        bio: string;
        interests: string;
        global_rank: number;
        total_points: number;
        current_streak: number;
        problems_solved: number;
        avatar_url: string;
    };
}

export interface ProfileContextType {
    profile: Profile | null;
    fetchProfile: () => Promise<void>;
}

export type EditableProfile = {
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    address?: string;
    bio?: string;
    git?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    avatar_url?: string;
};

export interface EditableProfileGit {
    username?: string;
    email?: string;
    name?: string;
    bio?: string;
    company?: string;
    blog?: string;
    twitter_url?: string;
    html_url?: string;
    avatar_url?: string;
    public_repos?: string;
    followers?: string;
    created_at?: string;
}


export interface EditProfileFormProps {
    title?: string | ReactNode;
    onSuccess: () => void;
    initialData: EditableProfile;
}

export interface EditPassword {
    old_password?: string;
    new_password?: string;
    confirm_password?: string;
}

export type GitHubProfile = {
    username: string;
    email: string;
    name: string;
    html_url: string;
    company: string;
    blog: string;
    bio: string;
    twitter_username: string;
    public_repos: number;
    followers: number;
    created_at: string;
    avatar_url: string;
    created: string;
};

export type GitHubSaveProfile = {
    username: string;
    email: string;
    name: string;
    html_url: string;
    company: string;
    blog: string;
    bio: string;
    twitter_username: string;
    public_repos: number;
    followers: number;
    created_at: string;
    avatar_url: string;
    created: string;
};


export interface DeleteProfileConfirmProps {
    onConfirm: () => void;
    onCancel: () => void;
}

// ТЯНКИ СХОДЯТ С УМА ОТ ЭТОГО СТРИМЕРА
//                                               - Репер Смерті


//     А я взагалі то програміст крутий, но в мене в житі приколи тому скоро я вже не буду програмувати бо треба буде рішати мої справи аж до самого літа, тому треба буде відкласти моє любиме хобі навіть не на другий план а на пятий.
//     А взагалі як Вам ідея на показ біо в модалці?

// == Мій стан зараз:
// • Спокійно-трохи нервовий
// • Статус - "Чорна полоса" [тимчасова]; наслідки код: нестабільно - червоний А2.
// • План - {
//     1. Доробити сайт
//     2. Працювати та зароблювати бенджеміни
//     3. Підготовка / складання НМТ
//     4. Підготовка до побачення з Мартою
//     5. Підтягнути себе
// };