export type Posts = {
    id: number;
    author: {
        id: number;
        email: string;
        username: string;
        first_name: string;
        last_name: string;
        is_staff: boolean;
        profile: {
            bio: string;
            git: string;
            youtube: string;
            twitter: string;
            linkedin: string;
            address: string;
            global_rang: number;
            total_points: number;
            problems_solved: number;
            current_streak: number;
            avatar_url: string;
        }
    };
    channel: any;
    title: string;
    content: string;
    views_count: number;
    likes_count: number;
    dislikes_count: number;
    slug: string;
    is_pinned: boolean;
    is_edited: boolean;
    created_at: string;
};

export type Channels = {
    id: number;
    owner: any;
    moderators: any;
    subscribers: any;
    name: string;    
    slug: string;
    description: string;
    logo: string;
    banner: string;
    is_approved: boolean;
    is_private: boolean;
    created_at: string;
};


export interface PostFormProps {
    onSuccess: () => void;
    onDelete?: () => void;
    post?: Posts;
    channel?: number;
    content?: string;
}

export type EditablePost = {
    title: string;
    content: string;
    channel: number;
};

export interface ActionsCellPropsForum {
    onEdit: () => void;
    onDelete: () => void;
    onShare: () => void;
}


export interface ActionsCellPropsChannel {
    onEdit: () => void;
    onDelete: () => void;
    onShare: () => void;
}

export interface ChannellFormProps {
    onSuccess: () => void;
    onDelete?: () => void;
    channel?: Channels;
}

export type EditableChannell = {
    name: string;
    description: string;
    logo: string;
    banner: string;
    is_private: boolean;
};

