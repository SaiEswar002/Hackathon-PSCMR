import { ID } from 'appwrite';
import { account } from '../appwrite';
import type { User } from '@shared/schema';

export interface SignUpData {
    email: string;
    password: string;
    fullName: string;
}

export interface LoginData {
    email: string;
    password: string;
}

class AuthService {
    /**
     * Create a new user account
     */
    async signUp(data: SignUpData) {
        try {
            // Logout any existing session first
            try {
                await this.logout();
            } catch {
                // No active session, continue
            }

            const response = await account.create(
                ID.unique(),
                data.email,
                data.password,
                data.fullName
            );

            // Automatically log in after signup
            await this.login({ email: data.email, password: data.password });

            return response;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    /**
     * Log in user
     */
    async login(data: LoginData) {
        try {
            const session = await account.createEmailPasswordSession(
                data.email,
                data.password
            );
            return session;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Log out current user
     */
    async logout() {
        try {
            await account.deleteSession('current');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    /**
     * Get current logged-in user
     */
    async getCurrentUser() {
        try {
            const user = await account.get();
            return user;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * Get current session
     */
    async getSession() {
        try {
            const session = await account.getSession('current');
            return session;
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    }

    /**
     * Update user email
     */
    async updateEmail(email: string, password: string) {
        try {
            return await account.updateEmail(email, password);
        } catch (error) {
            console.error('Update email error:', error);
            throw error;
        }
    }

    /**
     * Update user password
     */
    async updatePassword(newPassword: string, oldPassword: string) {
        try {
            return await account.updatePassword(newPassword, oldPassword);
        } catch (error) {
            console.error('Update password error:', error);
            throw error;
        }
    }

    /**
     * Send password recovery email
     */
    async sendPasswordRecovery(email: string) {
        try {
            return await account.createRecovery(
                email,
                `${window.location.origin}/reset-password`
            );
        } catch (error) {
            console.error('Send password recovery error:', error);
            throw error;
        }
    }

    /**
     * Complete password recovery
     */
    async completePasswordRecovery(
        userId: string,
        secret: string,
        password: string
    ) {
        try {
            return await account.updateRecovery(userId, secret, password);
        } catch (error) {
            console.error('Complete password recovery error:', error);
            throw error;
        }
    }
}

export const authService = new AuthService();
