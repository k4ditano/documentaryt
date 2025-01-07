import { User } from './index';
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
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData extends LoginCredentials {
    username: string;
}
