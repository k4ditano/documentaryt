import type { User } from '../types/index';
interface LoginResponse {
    user: User;
    token: string;
}
interface RegisterResponse {
    user: User;
    token: string;
}
declare class AuthService {
    login(email: string, password: string): Promise<LoginResponse>;
    register(username: string, email: string, password: string): Promise<RegisterResponse>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User | null>;
    updateProfile(data: Partial<User>): Promise<User>;
    updatePassword(currentPassword: string, newPassword: string): Promise<void>;
    uploadAvatar(file: File): Promise<User>;
}
export declare const authService: AuthService;
export {};
