export interface User {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    created_at?: string;
    updated_at?: string;
}
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    uploadAvatar: (file: File) => Promise<void>;
    clearError: () => void;
}
