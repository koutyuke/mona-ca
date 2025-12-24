import { Treaty } from '@elysiajs/eden';

type RawDiscordProvider = "discord";
type RawGoogleProvider = "google";
type RawIdentityProviders = RawDiscordProvider | RawGoogleProvider;

declare const createTreatyFetch: (production: boolean, config?: Treaty.Config) => {
    auth: {
        login: {
            post: (body: {
                email: string;
                password: string;
            } & {
                cfTurnstileResponse: string;
            }, options?: {
                headers?: Record<string, unknown>;
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            } | undefined) => Promise<Treaty.TreatyResponse<{
                200: {
                    sessionToken: string;
                };
                204: null;
                400: {
                    readonly code: "INVALID_CREDENTIALS";
                    readonly message: "Invalid email or password. Please check your credentials and try again.";
                } | {
                    readonly code: "IP_ADDRESS_NOT_FOUND";
                    readonly message: "IP address not found";
                } | {
                    readonly code: "CAPTCHA_VERIFICATION_FAILED";
                    readonly message: "Verification failed.";
                };
                422: {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
            }>>;
        };
        logout: {
            post: (body?: unknown, options?: {
                headers?: Record<string, unknown>;
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            } | undefined) => Promise<Treaty.TreatyResponse<{
                204: null;
                401: {
                    readonly code: "UNAUTHORIZED";
                    readonly message: "It looks like you are not authenticated. Please login to continue.";
                } | {
                    readonly code: "EXPIRED_SESSION";
                    readonly message: "It looks like your session is expired. Please login to continue.";
                } | {
                    readonly code: "INVALID_SESSION";
                    readonly message: "It looks like your session is invalid. Please login to continue.";
                } | {
                    readonly code: "REQUIRED_EMAIL_VERIFICATION";
                    readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                };
                422: {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
            }>>;
        };
        signup: {
            post: (body: {
                email: string;
            } & {
                cfTurnstileResponse: string;
            }, options?: {
                headers?: Record<string, unknown>;
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            } | undefined) => Promise<Treaty.TreatyResponse<{
                200: {
                    signupSessionToken: string;
                };
                204: null;
                400: {
                    readonly code: "IP_ADDRESS_NOT_FOUND";
                    readonly message: "IP address not found";
                } | {
                    readonly code: "CAPTCHA_VERIFICATION_FAILED";
                    readonly message: "Verification failed.";
                } | {
                    readonly code: "EMAIL_ALREADY_USED";
                    readonly message: "Email is already used. Please use a different email address or try logging in.";
                };
                422: {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
            }>>;
            verify: {
                post: (body: {
                    signupSessionToken?: string;
                    code: string;
                }, options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    204: null;
                    400: {
                        readonly code: "IP_ADDRESS_NOT_FOUND";
                        readonly message: "IP address not found";
                    } | {
                        readonly code: "INVALID_CODE";
                        readonly message: "Invalid verification code. Please check your email and try again.";
                    } | {
                        readonly code: "ALREADY_VERIFIED";
                        readonly message: "Email is already verified. Please login.";
                    };
                    401: {
                        readonly code: "INVALID_SIGNUP_SESSION";
                        readonly message: "Signup session token not found. Please request signup again.";
                    } | {
                        readonly code: "INVALID_SIGNUP_SESSION";
                        readonly message: "Signup session token is invalid. Please request signup again.";
                    } | {
                        readonly code: "EXPIRED_SIGNUP_SESSION";
                        readonly message: "Signup session token has expired. Please request signup again.";
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        readonly code: "TOO_MANY_REQUESTS";
                        readonly message: "Too many requests. Please try again later.";
                    };
                }>>;
            };
            register: {
                post: (body: {
                    signupSessionToken?: string;
                    name: string;
                    gender: "male" | "female";
                    password: string;
                }, options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    200: {
                        sessionToken: string;
                    };
                    204: null;
                    400: {
                        readonly code: "EMAIL_ALREADY_REGISTERED";
                        readonly message: "Email is already registered. Please use a different email address or try logging in.";
                    } | {
                        readonly code: "REQUIRED_EMAIL_VERIFICATION";
                        readonly message: "Email verification is required. Please verify your email address.";
                    };
                    401: {
                        readonly code: "INVALID_SIGNUP_SESSION";
                        readonly message: "Signup session token not found. Please request signup again.";
                    } | {
                        readonly code: "INVALID_SIGNUP_SESSION";
                        readonly message: "Signup session token is invalid. Please request signup again.";
                    } | {
                        readonly code: "EXPIRED_SIGNUP_SESSION";
                        readonly message: "Signup session token has expired. Please request signup again.";
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                }>>;
            };
        };
        "email-verification": {
            post: (body?: unknown, options?: {
                headers?: Record<string, unknown>;
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            } | undefined) => Promise<Treaty.TreatyResponse<{
                200: {
                    emailVerificationRequestToken: string;
                };
                204: null;
                400: {
                    readonly code: "IP_ADDRESS_NOT_FOUND";
                    readonly message: "IP address not found";
                } | {
                    readonly code: "EMAIL_ALREADY_VERIFIED";
                    readonly message: "Email is already verified. Please use a different email address.";
                } | {
                    readonly code: "EMAIL_ALREADY_REGISTERED";
                    readonly message: "Email is already registered by another user. Please use a different email address.";
                };
                401: {
                    readonly code: "UNAUTHORIZED";
                    readonly message: "It looks like you are not authenticated. Please login to continue.";
                } | {
                    readonly code: "EXPIRED_SESSION";
                    readonly message: "It looks like your session is expired. Please login to continue.";
                } | {
                    readonly code: "INVALID_SESSION";
                    readonly message: "It looks like your session is invalid. Please login to continue.";
                } | {
                    readonly code: "REQUIRED_EMAIL_VERIFICATION";
                    readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                };
                422: {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
            }>>;
            verify: {
                post: (body: {
                    emailVerificationRequestToken?: string;
                    code: string;
                }, options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    204: null;
                    400: {
                        readonly code: "IP_ADDRESS_NOT_FOUND";
                        readonly message: "IP address not found";
                    } | {
                        readonly code: "INVALID_CODE";
                        readonly message: "Invalid verification code. Please check your email and try again.";
                    } | {
                        readonly code: "INVALID_EMAIL";
                        readonly message: "Email mismatch. Please use the email address you requested verification for.";
                    };
                    401: {
                        readonly code: "UNAUTHORIZED";
                        readonly message: "It looks like you are not authenticated. Please login to continue.";
                    } | {
                        readonly code: "EXPIRED_SESSION";
                        readonly message: "It looks like your session is expired. Please login to continue.";
                    } | {
                        readonly code: "INVALID_SESSION";
                        readonly message: "It looks like your session is invalid. Please login to continue.";
                    } | {
                        readonly code: "REQUIRED_EMAIL_VERIFICATION";
                        readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                    } | {
                        readonly code: "INVALID_EMAIL_VERIFICATION_REQUEST";
                        readonly message: "Email verification session token not found. Please request email verification again.";
                    } | {
                        readonly code: "INVALID_EMAIL_VERIFICATION_REQUEST";
                        readonly message: "Invalid email verification session. Please request email verification again.";
                    } | {
                        readonly code: "EXPIRED_EMAIL_VERIFICATION_REQUEST";
                        readonly message: "Email verification session has expired. Please request email verification again.";
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        readonly code: "TOO_MANY_REQUESTS";
                        readonly message: "Too many requests. Please try again later.";
                    };
                }>>;
            };
        };
        federated: ((params: {
            provider: string | number;
        }) => {
            login: {
                get: (options: {
                    headers?: Record<string, unknown>;
                    query: {
                        "redirect-uri"?: string;
                        "client-type": "mobile" | "web";
                    };
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    302: null;
                    400: {
                        readonly code: "IP_ADDRESS_NOT_FOUND";
                        readonly message: "IP address not found";
                    } | {
                        readonly code: "INVALID_REDIRECT_URI";
                        readonly message: "Invalid redirect URI. Please check the URI and try again.";
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                }>>;
                callback: {
                    get: (options?: {
                        headers?: Record<string, unknown>;
                        query?: Record<string, unknown>;
                        fetch?: RequestInit;
                    } | undefined) => Promise<Treaty.TreatyResponse<{
                        302: null;
                        400: {
                            readonly code: "IP_ADDRESS_NOT_FOUND";
                            readonly message: "IP address not found";
                        } | {
                            readonly code: "INVALID_STATE";
                            readonly message: "Invalid OAuth state. Please try again.";
                        } | {
                            readonly code: "INVALID_REDIRECT_URI";
                            readonly message: "Invalid redirect URL. Please check the URL and try again.";
                        } | {
                            readonly code: "TOKEN_EXCHANGE_FAILED";
                            readonly message: "OAuth code is missing. Please try again.";
                        };
                        422: {
                            type: "validation";
                            on: string;
                            summary?: string;
                            message?: string;
                            found?: unknown;
                            property?: string;
                            expected?: string;
                        };
                    }>>;
                };
            };
        }) & {};
        "password-reset": {
            post: (body: {
                email: string;
            } & {
                cfTurnstileResponse: string;
            }, options?: {
                headers?: Record<string, unknown>;
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            } | undefined) => Promise<Treaty.TreatyResponse<{
                200: {
                    passwordResetSessionToken: string;
                };
                204: null;
                400: {
                    readonly code: "IP_ADDRESS_NOT_FOUND";
                    readonly message: "IP address not found";
                } | {
                    readonly code: "CAPTCHA_VERIFICATION_FAILED";
                    readonly message: "Verification failed.";
                };
                422: {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
            }>>;
            verify: {
                post: (body: {
                    passwordResetSessionToken?: string;
                    code: string;
                }, options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    204: null;
                    400: {
                        readonly code: "IP_ADDRESS_NOT_FOUND";
                        readonly message: "IP address not found";
                    } | {
                        readonly code: "INVALID_CODE";
                        readonly message: "Invalid verification code. Please check your email and try again.";
                    };
                    401: {
                        readonly code: "INVALID_PASSWORD_RESET_SESSION";
                        readonly message: "Password reset session token not found. Please request password reset again.";
                    } | {
                        readonly code: "INVALID_PASSWORD_RESET_SESSION";
                        readonly message: "Invalid password reset session. Please request password reset again.";
                    } | {
                        readonly code: "EXPIRED_PASSWORD_RESET_SESSION";
                        readonly message: "Password reset session has expired. Please request password reset again.";
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        readonly code: "TOO_MANY_REQUESTS";
                        readonly message: "Too many requests. Please try again later.";
                    };
                }>>;
            };
            reset: {
                post: (body: {
                    passwordResetSessionToken?: string;
                    newPassword: string;
                }, options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    204: null;
                    401: {
                        readonly code: "INVALID_PASSWORD_RESET_SESSION";
                        readonly message: "Password reset session token not found. Please request password reset again.";
                    } | {
                        readonly code: "INVALID_PASSWORD_RESET_SESSION";
                        readonly message: "Invalid password reset session. Please request password reset again.";
                    } | {
                        readonly code: "EXPIRED_PASSWORD_RESET_SESSION";
                        readonly message: "Password reset session has expired. Please request password reset again.";
                    };
                    403: {
                        readonly code: "REQUIRED_EMAIL_VERIFICATION";
                        readonly message: "Email verification is required before resetting password. Please verify your email first.";
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                }>>;
            };
        };
        "account-link": {
            resend: {
                post: (body?: Partial<{
                    accountLinkRequestToken?: string;
                }> | null | undefined, options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    200: {
                        accountLinkRequestToken: string;
                    };
                    204: null;
                    400: {
                        readonly code: "IP_ADDRESS_NOT_FOUND";
                        readonly message: "IP address not found";
                    };
                    401: {
                        readonly code: "INVALID_ACCOUNT_LINK_REQUEST";
                        readonly message: "Account link request not found. Please login again.";
                    } | {
                        readonly code: "INVALID_ACCOUNT_LINK_REQUEST";
                        readonly message: "Invalid account link request. Please login again.";
                    } | {
                        readonly code: "EXPIRED_ACCOUNT_LINK_REQUEST";
                        readonly message: "Account link request has expired. Please login again.";
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        readonly code: "TOO_MANY_REQUESTS";
                        readonly message: "Too many requests. Please try again later.";
                    } | {
                        readonly code: "TOO_MANY_REQUESTS";
                        readonly message: "Too many requests. Please try again later.";
                    };
                }>>;
            };
            verify: {
                post: (body: {
                    accountLinkRequestToken?: string;
                    code: string;
                }, options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    200: {
                        sessionToken: string;
                    };
                    204: null;
                    400: {
                        readonly code: "IP_ADDRESS_NOT_FOUND";
                        readonly message: "IP address not found";
                    } | {
                        readonly code: "INVALID_CODE";
                        readonly message: "Invalid code. Please check your email and try again.";
                    } | {
                        readonly code: "PROVIDER_ALREADY_LINKED";
                        readonly message: "This provider is already linked to your account. Please login with this provider.";
                    } | {
                        readonly code: "ACCOUNT_LINKED_ELSEWHERE";
                        readonly message: "This provider account is already linked to another user. Please login with this provider.";
                    };
                    401: {
                        readonly code: "INVALID_ACCOUNT_LINK_REQUEST";
                        readonly message: "Account link request not found.";
                    } | {
                        readonly code: "INVALID_ACCOUNT_LINK_REQUEST";
                        readonly message: "Invalid account link request.";
                    } | {
                        readonly code: "EXPIRED_ACCOUNT_LINK_REQUEST";
                        readonly message: "Account link request has expired.";
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        readonly code: "TOO_MANY_REQUESTS";
                        readonly message: "Too many requests. Please try again later.";
                    } | {
                        readonly code: "TOO_MANY_REQUESTS";
                        readonly message: "Too many requests. Please try again later.";
                    };
                }>>;
            };
            preview: {
                post: (body?: {
                    accountLinkRequestToken?: string;
                } | undefined, options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    200: {
                        email: string;
                        provider: RawIdentityProviders;
                        providerId: string;
                    };
                    401: {
                        readonly code: "INVALID_ACCOUNT_LINK_REQUEST";
                        readonly message: "Account link request not found. Please login again.";
                    } | {
                        readonly code: "INVALID_ACCOUNT_LINK_REQUEST";
                        readonly message: "Invalid account link request. Please login again.";
                    } | {
                        readonly code: "EXPIRED_ACCOUNT_LINK_REQUEST";
                        readonly message: "Account link request has expired. Please login again.";
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                }>>;
            };
        };
    };
    users: {
        me: {
            get: (options?: {
                headers?: Record<string, unknown>;
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            } | undefined) => Promise<Treaty.TreatyResponse<{
                200: {
                    id: string;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    iconUrl: string | null;
                    gender: "male" | "female";
                    createdAt: string;
                    updatedAt: string;
                };
                400: {
                    readonly code: "USER_NOT_FOUND";
                    readonly message: "Failed to get profile";
                };
                401: {
                    readonly code: "UNAUTHORIZED";
                    readonly message: "It looks like you are not authenticated. Please login to continue.";
                } | {
                    readonly code: "EXPIRED_SESSION";
                    readonly message: "It looks like your session is expired. Please login to continue.";
                } | {
                    readonly code: "INVALID_SESSION";
                    readonly message: "It looks like your session is invalid. Please login to continue.";
                } | {
                    readonly code: "REQUIRED_EMAIL_VERIFICATION";
                    readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                };
                422: {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
            }>>;
            patch: (body?: {
                name?: string;
                iconUrl?: string;
                gender?: "male" | "female";
            } | undefined, options?: {
                headers?: Record<string, unknown>;
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            } | undefined) => Promise<Treaty.TreatyResponse<{
                200: {
                    id: string;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    iconUrl: string | null;
                    gender: "male" | "female";
                    createdAt: string;
                    updatedAt: string;
                };
                400: {
                    readonly code: "USER_NOT_FOUND";
                    readonly message: "Failed to update profile";
                };
                401: {
                    readonly code: "UNAUTHORIZED";
                    readonly message: "It looks like you are not authenticated. Please login to continue.";
                } | {
                    readonly code: "EXPIRED_SESSION";
                    readonly message: "It looks like your session is expired. Please login to continue.";
                } | {
                    readonly code: "INVALID_SESSION";
                    readonly message: "It looks like your session is invalid. Please login to continue.";
                } | {
                    readonly code: "REQUIRED_EMAIL_VERIFICATION";
                    readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                };
                422: {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
            }>>;
            identities: {
                get: (options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    200: {
                        password: {
                            enabled: boolean;
                        };
                        federated: {
                            provider: RawIdentityProviders;
                            providerUserId: string;
                            linkedAt: string;
                        }[];
                    };
                    401: {
                        readonly code: "UNAUTHORIZED";
                        readonly message: "It looks like you are not authenticated. Please login to continue.";
                    } | {
                        readonly code: "EXPIRED_SESSION";
                        readonly message: "It looks like your session is expired. Please login to continue.";
                    } | {
                        readonly code: "INVALID_SESSION";
                        readonly message: "It looks like your session is invalid. Please login to continue.";
                    } | {
                        readonly code: "REQUIRED_EMAIL_VERIFICATION";
                        readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                }>>;
                password: {
                    post: (body: {
                        newPassword: string;
                        currentPassword: string | null;
                    }, options?: {
                        headers?: Record<string, unknown>;
                        query?: Record<string, unknown>;
                        fetch?: RequestInit;
                    } | undefined) => Promise<Treaty.TreatyResponse<{
                        200: {
                            sessionToken: string;
                        };
                        204: null;
                        400: {
                            readonly code: "INVALID_CURRENT_PASSWORD";
                            readonly message: "Current password is incorrect. Please check your password and try again.";
                        };
                        401: {
                            readonly code: "UNAUTHORIZED";
                            readonly message: "It looks like you are not authenticated. Please login to continue.";
                        } | {
                            readonly code: "EXPIRED_SESSION";
                            readonly message: "It looks like your session is expired. Please login to continue.";
                        } | {
                            readonly code: "INVALID_SESSION";
                            readonly message: "It looks like your session is invalid. Please login to continue.";
                        } | {
                            readonly code: "REQUIRED_EMAIL_VERIFICATION";
                            readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                        };
                        422: {
                            type: "validation";
                            on: string;
                            summary?: string;
                            message?: string;
                            found?: unknown;
                            property?: string;
                            expected?: string;
                        };
                    }>>;
                };
                federated: ((params: {
                    provider: string | number;
                }) => {
                    link: {
                        prepare: {
                            post: (body?: unknown, options?: {
                                headers?: Record<string, unknown>;
                                query?: Record<string, unknown>;
                                fetch?: RequestInit;
                            } | undefined) => Promise<Treaty.TreatyResponse<{
                                200: {
                                    providerLinkRequestToken: string;
                                };
                                401: {
                                    readonly code: "UNAUTHORIZED";
                                    readonly message: "It looks like you are not authenticated. Please login to continue.";
                                } | {
                                    readonly code: "EXPIRED_SESSION";
                                    readonly message: "It looks like your session is expired. Please login to continue.";
                                } | {
                                    readonly code: "INVALID_SESSION";
                                    readonly message: "It looks like your session is invalid. Please login to continue.";
                                } | {
                                    readonly code: "REQUIRED_EMAIL_VERIFICATION";
                                    readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                                };
                                422: {
                                    type: "validation";
                                    on: string;
                                    summary?: string;
                                    message?: string;
                                    found?: unknown;
                                    property?: string;
                                    expected?: string;
                                };
                            }>>;
                        };
                        get: (options?: {
                            headers?: Record<string, unknown>;
                            query?: Record<string, unknown>;
                            fetch?: RequestInit;
                        } | undefined) => Promise<Treaty.TreatyResponse<{
                            302: null;
                            400: {
                                readonly code: "IP_ADDRESS_NOT_FOUND";
                                readonly message: "IP address not found";
                            } | {
                                readonly code: "INVALID_REDIRECT_URI";
                                readonly message: "Invalid redirect URI. Please check the URI and try again.";
                            };
                            401: {
                                readonly code: "UNAUTHORIZED";
                                readonly message: "It looks like you are not authenticated. Please login to continue.";
                            } | {
                                readonly code: "INVALID_PROVIDER_LINK_REQUEST";
                                readonly message: "It looks like the provider link request is invalid. Please try again.";
                            } | {
                                readonly code: "EXPIRED_PROVIDER_LINK_REQUEST";
                                readonly message: "It looks like the provider link request is expired. Please try again.";
                            };
                            422: {
                                type: "validation";
                                on: string;
                                summary?: string;
                                message?: string;
                                found?: unknown;
                                property?: string;
                                expected?: string;
                            };
                        }>>;
                        callback: {
                            get: (options?: {
                                headers?: Record<string, unknown>;
                                query?: Record<string, unknown>;
                                fetch?: RequestInit;
                            } | undefined) => Promise<Treaty.TreatyResponse<{
                                302: null;
                                400: {
                                    readonly code: "INVALID_STATE";
                                } | {
                                    readonly code: "INVALID_REDIRECT_URI";
                                    readonly message: "Invalid redirect URL. Please check the URL and try again.";
                                } | {
                                    readonly code: "TOKEN_EXCHANGE_FAILED";
                                    readonly message: "OAuth code is missing. Please try again.";
                                };
                                422: {
                                    type: "validation";
                                    on: string;
                                    summary?: string;
                                    message?: string;
                                    found?: unknown;
                                    property?: string;
                                    expected?: string;
                                };
                            }>>;
                        };
                    };
                    delete: (body?: unknown, options?: {
                        headers?: Record<string, unknown>;
                        query?: Record<string, unknown>;
                        fetch?: RequestInit;
                    } | undefined) => Promise<Treaty.TreatyResponse<{
                        204: null;
                        400: {
                            readonly code: "PROVIDER_NOT_LINKED";
                            readonly message: "Account is not linked to this provider. Please check your account connections.";
                        } | {
                            readonly code: "PASSWORD_NOT_SET";
                            readonly message: "Cannot unlink account without a password set. Please set a password first.";
                        } | {
                            readonly code: never;
                            readonly message: "Failed to unlink account connection. Please try again.";
                        };
                        401: {
                            readonly code: "UNAUTHORIZED";
                            readonly message: "It looks like you are not authenticated. Please login to continue.";
                        } | {
                            readonly code: "EXPIRED_SESSION";
                            readonly message: "It looks like your session is expired. Please login to continue.";
                        } | {
                            readonly code: "INVALID_SESSION";
                            readonly message: "It looks like your session is invalid. Please login to continue.";
                        } | {
                            readonly code: "REQUIRED_EMAIL_VERIFICATION";
                            readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                        };
                        422: {
                            type: "validation";
                            on: string;
                            summary?: string;
                            message?: string;
                            found?: unknown;
                            property?: string;
                            expected?: string;
                        };
                    }>>;
                }) & {};
            };
            email: {
                post: (body: {
                    email: string | null;
                }, options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    200: {
                        emailVerificationRequestToken: string;
                    };
                    204: null;
                    400: {
                        readonly code: "IP_ADDRESS_NOT_FOUND";
                        readonly message: "IP address not found";
                    } | {
                        readonly code: "EMAIL_ALREADY_REGISTERED";
                        readonly message: "Email is already registered by another user. Please use a different email address.";
                    };
                    401: {
                        readonly code: "UNAUTHORIZED";
                        readonly message: "It looks like you are not authenticated. Please login to continue.";
                    } | {
                        readonly code: "EXPIRED_SESSION";
                        readonly message: "It looks like your session is expired. Please login to continue.";
                    } | {
                        readonly code: "INVALID_SESSION";
                        readonly message: "It looks like your session is invalid. Please login to continue.";
                    } | {
                        readonly code: "REQUIRED_EMAIL_VERIFICATION";
                        readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        readonly code: "TOO_MANY_REQUESTS";
                        readonly message: "Too many requests. Please try again later.";
                    } | {
                        readonly code: "TOO_MANY_REQUESTS";
                        readonly message: "Too many requests. Please try again later.";
                    };
                }>>;
                verify: {
                    post: (body: {
                        emailVerificationRequestToken?: string;
                        code: string;
                    }, options?: {
                        headers?: Record<string, unknown>;
                        query?: Record<string, unknown>;
                        fetch?: RequestInit;
                    } | undefined) => Promise<Treaty.TreatyResponse<{
                        200: {
                            sessionToken: string;
                        };
                        204: null;
                        400: {
                            readonly code: "IP_ADDRESS_NOT_FOUND";
                            readonly message: "IP address not found";
                        } | {
                            readonly code: "INVALID_EMAIL_VERIFICATION_REQUEST";
                            readonly message: "Email verification session is invalid. Please request a new verification email.";
                        } | {
                            readonly code: "INVALID_EMAIL_VERIFICATION_REQUEST";
                            readonly message: "Invalid email verification request. Please request a new verification email.";
                        } | {
                            readonly code: "EXPIRED_EMAIL_VERIFICATION_REQUEST";
                            readonly message: "Email verification request has expired. Please request a new verification email.";
                        } | {
                            readonly code: "EMAIL_ALREADY_REGISTERED";
                            readonly message: "Email is already in use by another account. Please use a different email address.";
                        } | {
                            readonly code: "INVALID_CODE";
                            readonly message: "Invalid verification code. Please check the code and try again.";
                        };
                        401: {
                            readonly code: "UNAUTHORIZED";
                            readonly message: "It looks like you are not authenticated. Please login to continue.";
                        } | {
                            readonly code: "EXPIRED_SESSION";
                            readonly message: "It looks like your session is expired. Please login to continue.";
                        } | {
                            readonly code: "INVALID_SESSION";
                            readonly message: "It looks like your session is invalid. Please login to continue.";
                        } | {
                            readonly code: "REQUIRED_EMAIL_VERIFICATION";
                            readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                        };
                        422: {
                            type: "validation";
                            on: string;
                            summary?: string;
                            message?: string;
                            found?: unknown;
                            property?: string;
                            expected?: string;
                        };
                        429: {
                            readonly code: "TOO_MANY_REQUESTS";
                            readonly message: "Too many requests. Please try again later.";
                        };
                    }>>;
                };
            };
        };
    };
    get: (options?: {
        headers?: Record<string, unknown>;
        query?: Record<string, unknown>;
        fetch?: RequestInit;
    } | undefined) => Promise<Treaty.TreatyResponse<{
        200: string;
        400: {
            readonly code: "IP_ADDRESS_NOT_FOUND";
            readonly message: "IP address not found";
        };
    }>>;
};

export { createTreatyFetch };
