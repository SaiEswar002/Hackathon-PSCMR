import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { ID, Models } from 'appwrite';
import { account, databases, appwriteConfig } from '@/lib/appwriteClient';

// Types
interface SignUpData {
    email: string;
    password: string;
    fullName: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    isAuthenticated: boolean;
    isEmailVerified: boolean;
    signUp: (data: SignUpData) => Promise<void>;
    login: (data: LoginData) => Promise<void>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<Models.User<Models.Preferences> | null>;
    sendVerificationEmail: () => Promise<void>;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    // Get current user
    const getCurrentUser = useCallback(async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            return currentUser;
        } catch (error) {
            setUser(null);
            return null;
        }
    }, []);

    // Load user on mount
    useEffect(() => {
        getCurrentUser().finally(() => setLoading(false));
    }, [getCurrentUser]);

    // Sign up
    const signUp = useCallback(async (data: SignUpData) => {
        try {
            // Create account
            await account.create(ID.unique(), data.email, data.password, data.fullName);

            // Send verification email
            await sendVerificationEmail();

            // Create session
            await account.createEmailPasswordSession(data.email, data.password);

            // Create user profile in database
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.users,
                ID.unique(),
                {
                    email: data.email,
                    fullName: data.fullName,
                    username: data.email.split('@')[0],
                    profileViews: 0,
                    connectionsCount: 0,
                }
            );

            // Refresh user
            await getCurrentUser();
        } catch (error: any) {
            console.error('Sign up error:', error);
            throw new Error(error.message || 'Failed to sign up');
        }
    }, [getCurrentUser]);

    // Login
    const login = useCallback(async (data: LoginData) => {
        try {
            await account.createEmailPasswordSession(data.email, data.password);
            await getCurrentUser();
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Failed to login');
        }
    }, [getCurrentUser]);

    // Logout
    const logout = useCallback(async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
        } catch (error: any) {
            console.error('Logout error:', error);
            throw new Error(error.message || 'Failed to logout');
        }
    }, []);

    // Send verification email
    const sendVerificationEmail = useCallback(async () => {
        try {
            const redirectUrl = `${window.location.origin}/verify-email`;
            await account.createVerification(redirectUrl);
        } catch (error: any) {
            console.error('Send verification error:', error);
            throw new Error(error.message || 'Failed to send verification email');
        }
    }, []);

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: user !== null,
        isEmailVerified: user?.emailVerification ?? false,
        signUp,
        login,
        logout,
        getCurrentUser,
        sendVerificationEmail,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth Hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
