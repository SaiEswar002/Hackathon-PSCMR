import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '../useAuth';

// Mock Appwrite client with inline definitions
vi.mock('@/lib/appwriteClient', () => ({
    account: {
        get: vi.fn(),
        create: vi.fn(),
        createEmailPasswordSession: vi.fn(),
        deleteSession: vi.fn(),
        createVerification: vi.fn(),
    },
    databases: {
        listDocuments: vi.fn(),
        createDocument: vi.fn(),
    },
    appwriteConfig: {
        databaseId: 'test-db',
        collections: {
            users: 'users',
        },
    },
}));

// Import the mocked module to access mocks in tests
import { account, databases } from '@/lib/appwriteClient';

describe('useAuth Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
    );

    describe('getCurrentUser', () => {
        it('should load user on mount if session exists', async () => {
            vi.mocked(account.get).mockResolvedValue({
                $id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                emailVerification: true,
            } as any);

            const { result } = renderHook(() => useAuth(), { wrapper });

            // Initially loading
            expect(result.current.loading).toBe(true);

            // Wait for user to load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.user).toEqual({
                $id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                emailVerification: true,
            });
            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.isEmailVerified).toBe(true);
        });

        it('should set user to null if no session exists', async () => {
            vi.mocked(account.get).mockRejectedValue(new Error('No session'));

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    describe('signUp', () => {
        it('should create account, send verification, and create user profile', async () => {
            // Mock successful auth flow
            vi.mocked(account.create).mockResolvedValue({ $id: 'user-123' } as any);
            vi.mocked(account.createEmailPasswordSession).mockResolvedValue({} as any);
            vi.mocked(account.get).mockResolvedValue({
                $id: 'user-123',
                email: 'newuser@example.com',
                name: 'New User',
            } as any);
            vi.mocked(databases.createDocument).mockResolvedValue({
                $id: 'profile-123',
                email: 'newuser@example.com',
                fullName: 'New User',
            } as any);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.signUp({
                    email: 'newuser@example.com',
                    password: 'password123',
                    fullName: 'New User',
                });
            });

            // Verify account.create was called
            expect(account.create).toHaveBeenCalledWith(
                expect.any(String),
                'newuser@example.com',
                'password123',
                'New User'
            );

            // Verify session was created
            expect(account.createEmailPasswordSession).toHaveBeenCalledWith(
                'newuser@example.com',
                'password123'
            );

            // Verify user profile was created in database
            expect(databases.createDocument).toHaveBeenCalledWith(
                'test-db',
                'users',
                expect.any(String),
                expect.objectContaining({
                    email: 'newuser@example.com',
                    fullName: 'New User',
                    username: 'newuser',
                })
            );
        });

        it('should throw error if signup fails', async () => {
            vi.mocked(account.get).mockRejectedValue(new Error('No session'));
            vi.mocked(account.create).mockRejectedValue(new Error('Email already exists'));

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await expect(
                result.current.signUp({
                    email: 'existing@example.com',
                    password: 'password123',
                    fullName: 'Existing User',
                })
            ).rejects.toThrow('Email already exists');

            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    describe('login', () => {
        it('should create session and load user', async () => {
            vi.mocked(account.createEmailPasswordSession).mockResolvedValue({} as any);
            vi.mocked(account.get).mockResolvedValue({
                $id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
            } as any);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.login({
                    email: 'test@example.com',
                    password: 'password123',
                });
            });

            expect(account.createEmailPasswordSession).toHaveBeenCalledWith(
                'test@example.com',
                'password123'
            );

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true);
                expect(result.current.user?.email).toBe('test@example.com');
            });
        });

        it('should throw error if credentials are invalid', async () => {
            vi.mocked(account.get).mockRejectedValue(new Error('No session'));
            vi.mocked(account.createEmailPasswordSession).mockRejectedValue(
                new Error('Invalid credentials')
            );

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await expect(
                result.current.login({
                    email: 'wrong@example.com',
                    password: 'wrongpassword',
                })
            ).rejects.toThrow('Invalid credentials');

            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    describe('logout', () => {
        it('should delete session and clear user', async () => {
            vi.mocked(account.createEmailPasswordSession).mockResolvedValue({} as any);
            vi.mocked(account.get).mockResolvedValue({
                $id: 'user-123',
                email: 'test@example.com',
            } as any);
            vi.mocked(account.deleteSession).mockResolvedValue({} as any);

            const { result } = renderHook(() => useAuth(), { wrapper });

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // Login first
            await act(async () => {
                await result.current.login({
                    email: 'test@example.com',
                    password: 'password123',
                });
            });

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true);
            });

            // Now logout
            await act(async () => {
                await result.current.logout();
            });

            expect(account.deleteSession).toHaveBeenCalledWith('current');

            // Wait for state to update
            await waitFor(() => {
                expect(result.current.user).toBeNull();
                expect(result.current.isAuthenticated).toBe(false);
            });
        });

        it('should throw error if logout fails', async () => {
            vi.mocked(account.get).mockRejectedValue(new Error('No session'));
            vi.mocked(account.deleteSession).mockRejectedValue(new Error('Logout failed'));

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await expect(result.current.logout()).rejects.toThrow('Logout failed');
        });
    });

    describe('sendVerificationEmail', () => {
        it('should send verification email', async () => {
            vi.mocked(account.createVerification).mockResolvedValue({} as any);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.sendVerificationEmail();
            });

            expect(account.createVerification).toHaveBeenCalledWith(
                expect.stringContaining('/verify-email')
            );
        });
    });
});
