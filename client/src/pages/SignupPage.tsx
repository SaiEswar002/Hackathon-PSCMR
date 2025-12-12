import { useState, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

export function SignupPage() {
    const { signUp, isAuthenticated, loading: authLoading } = useAuth();
    const [, setLocation] = useLocation();

    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    // Validation errors
    const [fullNameError, setFullNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
    const [termsError, setTermsError] = useState<string | null>(null);

    // Password strength indicator
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

    // Redirect if already authenticated
    if (isAuthenticated && !authLoading) {
        setLocation('/dashboard');
        return null;
    }

    // Full name validation
    const validateFullName = (name: string): boolean => {
        if (!name.trim()) {
            setFullNameError('Full name is required');
            return false;
        }

        if (name.trim().length < 2) {
            setFullNameError('Name must be at least 2 characters');
            return false;
        }

        if (!/^[a-zA-Z\s]+$/.test(name)) {
            setFullNameError('Name can only contain letters and spaces');
            return false;
        }

        setFullNameError(null);
        return true;
    };

    // Email validation
    const validateEmail = (email: string): boolean => {
        if (!email) {
            setEmailError('Email is required');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }

        setEmailError(null);
        return true;
    };

    // Password validation and strength check
    const validatePassword = (password: string): boolean => {
        if (!password) {
            setPasswordError('Password is required');
            setPasswordStrength(null);
            return false;
        }

        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            setPasswordStrength('weak');
            return false;
        }

        // Check password strength
        let strength = 0;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength < 3) {
            setPasswordStrength('weak');
            setPasswordError('Password should include uppercase, lowercase, numbers, and symbols');
            return false;
        } else if (strength < 4) {
            setPasswordStrength('medium');
        } else {
            setPasswordStrength('strong');
        }

        setPasswordError(null);
        return true;
    };

    // Confirm password validation
    const validateConfirmPassword = (confirmPwd: string): boolean => {
        if (!confirmPwd) {
            setConfirmPasswordError('Please confirm your password');
            return false;
        }

        if (confirmPwd !== password) {
            setConfirmPasswordError('Passwords do not match');
            return false;
        }

        setConfirmPasswordError(null);
        return true;
    };

    // Terms validation
    const validateTerms = (): boolean => {
        if (!agreedToTerms) {
            setTermsError('You must agree to the terms and conditions');
            return false;
        }

        setTermsError(null);
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validate all fields
        const isFullNameValid = validateFullName(fullName);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
        const isTermsValid = validateTerms();

        if (!isFullNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isTermsValid) {
            return;
        }

        setLoading(true);

        try {
            await signUp({
                email,
                password,
                fullName,
            });

            setSuccess(true);

            // Show success message for 2 seconds then redirect
            setTimeout(() => {
                setLocation('/dashboard');
            }, 2000);
        } catch (err: any) {
            console.error('Signup error:', err);

            // Handle specific error codes
            if (err.code === 409) {
                setError('An account with this email already exists');
                setEmailError('This email is already registered');
            } else if (err.code === 400) {
                setError('Invalid signup data. Please check your information.');
            } else {
                setError(err.message || 'Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle OAuth signup
    const handleOAuthSignup = (provider: 'google' | 'github') => {
        // TODO: Implement OAuth signup
        console.log(`Sign up with ${provider}`);
    };

    // Get password strength color
    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 'weak':
                return 'bg-red-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'strong':
                return 'bg-green-500';
            default:
                return 'bg-gray-200';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                        <p className="text-purple-100">Join the Student Skill Matchmaking platform</p>
                    </div>

                    {/* Form */}
                    <div className="px-8 py-6">
                        {/* Success Message */}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div>
                                    <p className="text-sm font-semibold text-green-800">Account created successfully!</p>
                                    <p className="text-sm text-green-700 mt-1">
                                        Please check your email to verify your account. Redirecting...
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Full Name Field */}
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => {
                                        setFullName(e.target.value);
                                        if (fullNameError) validateFullName(e.target.value);
                                    }}
                                    onBlur={() => validateFullName(fullName)}
                                    placeholder="John Doe"
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${fullNameError
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                                        } focus:ring-4 focus:outline-none`}
                                    disabled={loading}
                                />
                                {fullNameError && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {fullNameError}
                                    </p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    University Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) validateEmail(e.target.value);
                                    }}
                                    onBlur={() => validateEmail(email)}
                                    placeholder="you@university.edu"
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${emailError
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                                        } focus:ring-4 focus:outline-none`}
                                    disabled={loading}
                                />
                                {emailError && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {emailError}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            validatePassword(e.target.value);
                                        }}
                                        onBlur={() => validatePassword(password)}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors ${passwordError
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                                            } focus:ring-4 focus:outline-none`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            <div className={`h-1 flex-1 rounded ${getPasswordStrengthColor()}`}></div>
                                            <div className={`h-1 flex-1 rounded ${passwordStrength && passwordStrength !== 'weak' ? getPasswordStrengthColor() : 'bg-gray-200'}`}></div>
                                            <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? getPasswordStrengthColor() : 'bg-gray-200'}`}></div>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Password strength: <span className="font-semibold capitalize">{passwordStrength || 'weak'}</span>
                                        </p>
                                    </div>
                                )}

                                {passwordError && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {passwordError}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (confirmPasswordError) validateConfirmPassword(e.target.value);
                                        }}
                                        onBlur={() => validateConfirmPassword(confirmPassword)}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors ${confirmPasswordError
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                                            } focus:ring-4 focus:outline-none`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {confirmPasswordError && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {confirmPasswordError}
                                    </p>
                                )}
                            </div>

                            {/* Terms and Conditions */}
                            <div>
                                <div className="flex items-start">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => {
                                            setAgreedToTerms(e.target.checked);
                                            if (termsError) validateTerms();
                                        }}
                                        className={`mt-1 w-4 h-4 rounded border-2 ${termsError ? 'border-red-300' : 'border-gray-300'
                                            } text-purple-600 focus:ring-purple-500`}
                                    />
                                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                                        I agree to the{' '}
                                        <a href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                                            Terms of Service
                                        </a>{' '}
                                        and{' '}
                                        <a href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                                            Privacy Policy
                                        </a>
                                    </label>
                                </div>
                                {termsError && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {termsError}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg
                                            className="animate-spin h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : success ? (
                                    'Account Created! ✓'
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-gray-200"></div>
                            <span className="px-4 text-sm text-gray-500 font-medium">OR</span>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

                        {/* OAuth Buttons */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => handleOAuthSignup('google')}
                                disabled={loading || success}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 font-medium flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Sign up with Google
                            </button>

                            <button
                                type="button"
                                onClick={() => handleOAuthSignup('github')}
                                disabled={loading || success}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 font-medium flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                Sign up with GitHub
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <a
                                href="/login"
                                className="text-purple-600 hover:text-purple-700 font-semibold"
                            >
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>

                {/* Benefits */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-2xl mb-1">🎓</div>
                        <p className="text-xs text-gray-600 font-medium">Learn Skills</p>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-2xl mb-1">🤝</div>
                        <p className="text-xs text-gray-600 font-medium">Find Partners</p>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-2xl mb-1">🚀</div>
                        <p className="text-xs text-gray-600 font-medium">Build Projects</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
