//* frontend/src/pages
export interface LoginPayload {
    email: string;
    password: string;
}
export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    address: string;
}

//* frontend/src/contexts
export interface User {
    id?: string,
    email: string;
    name?: string;
    username?: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    register: (name: string, email: string, password: string, address?: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}