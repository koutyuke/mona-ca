import { Treaty } from '@elysiajs/eden';

declare const createTreatyFetch: (production: boolean, config?: Treaty.Config) => {
    auth: ((params: {
        provider: string | number;
    }) => {
        login: {
            get: (options: {
                headers?: Record<string, unknown>;
                query: {
                    "redirect-uri"?: string;
                    "client-type": "web" | "mobile";
                };
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                200: Response;
                400: {
                    readonly code: "IP_ADDRESS_NOT_FOUND";
                    readonly message: "IP address not found";
                } | {
                    readonly code: "INVALID_REDIRECT_URI";
                    readonly message: "Invalid redirect URI. Please check the URI and try again.";
                } | {
                    readonly code: never;
                    readonly message: "External Auth login request failed. Please try again.";
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
            callback: {
                get: (options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    200: Response;
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
                    429: {
                        readonly code: "TOO_MANY_REQUESTS";
                        readonly message: "Too many requests. Please try again later.";
                    };
                }>>;
            };
        };
        signup: {
            get: (options: {
                headers?: Record<string, unknown>;
                query: {
                    "redirect-uri"?: string;
                    "client-type": "web" | "mobile";
                };
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                200: Response;
                400: {
                    readonly code: "IP_ADDRESS_NOT_FOUND";
                    readonly message: "IP address not found";
                } | {
                    readonly code: "INVALID_REDIRECT_URI";
                    readonly message: "Invalid redirect URI. Please check the URI and try again.";
                } | {
                    readonly code: never;
                    readonly message: "External Auth signup request failed. Please try again.";
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
            callback: {
                get: (options?: {
                    headers?: Record<string, unknown>;
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                } | undefined) => Promise<Treaty.TreatyResponse<{
                    200: Response;
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
                    429: {
                        readonly code: "TOO_MANY_REQUESTS";
                        readonly message: "Too many requests. Please try again later.";
                    };
                }>>;
            };
        };
        link: {
            get: (options: {
                headers: {
                    "mc-client-type": "web" | "mobile";
                    authorization?: string;
                };
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                401: {
                    readonly code: "UNAUTHORIZED";
                    readonly message: "It looks like you are not authenticated. Please login to continue.";
                } | {
                    readonly code: "SESSION_EXPIRED" | "SESSION_INVALID";
                    readonly message: "It looks like your session is invalid. Please login to continue.";
                } | {
                    readonly code: "EMAIL_VERIFICATION_REQUIRED";
                    readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                };
                200: {
                    url: string;
                };
                400: {
                    readonly code: "INVALID_REDIRECT_URI";
                    readonly message: "Invalid redirect URI. Please check the URI and try again.";
                } | {
                    readonly code: never;
                    readonly message: "Account link request failed. Please try again.";
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
                    200: Response;
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
    }) & {
        login: {
            post: (body: {
                email: string;
                password: string;
            } & {
                cfTurnstileResponse: string;
            }, options: {
                headers: {
                    "mc-client-type": "web" | "mobile";
                };
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                200: {
                    sessionToken: string;
                };
                204: "No Content";
                400: {
                    readonly code: "IP_ADDRESS_NOT_FOUND";
                    readonly message: "IP address not found";
                } | {
                    readonly code: "CAPTCHA_VERIFICATION_FAILED";
                    readonly message: "Verification failed.";
                } | {
                    readonly code: "INVALID_CREDENTIALS";
                    readonly message: "Invalid email or password. Please check your credentials and try again.";
                } | {
                    readonly code: never;
                    readonly message: "Login failed. Please try again.";
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
            post: (body: unknown, options: {
                headers: {
                    "mc-client-type": "web" | "mobile";
                } & {
                    authorization?: string;
                };
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                401: {
                    readonly code: "UNAUTHORIZED";
                    readonly message: "It looks like you are not authenticated. Please login to continue.";
                } | {
                    readonly code: "SESSION_EXPIRED" | "SESSION_INVALID";
                    readonly message: "It looks like your session is invalid. Please login to continue.";
                } | {
                    readonly code: "EMAIL_VERIFICATION_REQUIRED";
                    readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                };
                204: "No Content";
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
        "email-verification": {
            post: (body: {
                email: string | null;
            }, options: {
                headers: {
                    "mc-client-type": "web" | "mobile";
                } & {
                    authorization?: string;
                };
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                401: {
                    readonly code: "UNAUTHORIZED";
                    readonly message: "It looks like you are not authenticated. Please login to continue.";
                } | {
                    readonly code: "SESSION_EXPIRED" | "SESSION_INVALID";
                    readonly message: "It looks like your session is invalid. Please login to continue.";
                } | {
                    readonly code: "EMAIL_VERIFICATION_REQUIRED";
                    readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                };
                200: {
                    emailVerificationSessionToken: string;
                };
                204: "No Content";
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
            confirm: {
                post: (body: {
                    emailVerificationSessionToken?: string;
                    code: string;
                }, options: {
                    headers: {
                        "mc-client-type": "web" | "mobile";
                    } & {
                        authorization?: string;
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    401: {
                        readonly code: "UNAUTHORIZED";
                        readonly message: "It looks like you are not authenticated. Please login to continue.";
                    } | {
                        readonly code: "SESSION_EXPIRED" | "SESSION_INVALID";
                        readonly message: "It looks like your session is invalid. Please login to continue.";
                    } | {
                        readonly code: "EMAIL_VERIFICATION_REQUIRED";
                        readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                    } | {
                        readonly code: "EMAIL_VERIFICATION_SESSION_INVALID";
                        readonly message: "Email verification session token not found. Please request email verification again.";
                    } | {
                        readonly code: "EMAIL_VERIFICATION_SESSION_INVALID";
                        readonly message: "Invalid email verification session. Please request email verification again.";
                    } | {
                        readonly code: "EMAIL_VERIFICATION_SESSION_EXPIRED";
                        readonly message: "Email verification session has expired. Please request email verification again.";
                    };
                    204: "No Content";
                    400: {
                        readonly code: "IP_ADDRESS_NOT_FOUND";
                        readonly message: "IP address not found";
                    } | {
                        readonly code: "INVALID_VERIFICATION_CODE";
                        readonly message: "Invalid verification code. Please check your email and try again.";
                    } | {
                        readonly code: "EMAIL_MISMATCH";
                        readonly message: "Email mismatch. Please use the email address you requested verification for.";
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
        };
        "forgot-password": {
            post: (body: {
                email: string;
            } & {
                cfTurnstileResponse: string;
            }, options: {
                headers: {
                    "mc-client-type": "web" | "mobile";
                };
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                200: {
                    passwordResetSessionToken: string;
                };
                204: "No Content";
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
            "verify-email": {
                post: (body: {
                    passwordResetSessionToken?: string;
                    code: string;
                }, options: {
                    headers: {
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    401: {
                        readonly code: "PASSWORD_RESET_SESSION_INVALID";
                        readonly message: "Password reset session token not found. Please request password reset again.";
                    } | {
                        readonly code: "PASSWORD_RESET_SESSION_INVALID";
                        readonly message: "Invalid password reset session. Please request password reset again.";
                    } | {
                        readonly code: "PASSWORD_RESET_SESSION_EXPIRED";
                        readonly message: "Password reset session has expired. Please request password reset again.";
                    };
                    204: "No Content";
                    400: {
                        readonly code: "IP_ADDRESS_NOT_FOUND";
                        readonly message: "IP address not found";
                    } | {
                        readonly code: "INVALID_VERIFICATION_CODE";
                        readonly message: "Invalid verification code. Please check your email and try again.";
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
                }, options: {
                    headers: {
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    401: {
                        readonly code: "PASSWORD_RESET_SESSION_INVALID";
                        readonly message: "Password reset session token not found. Please request password reset again.";
                    } | {
                        readonly code: "PASSWORD_RESET_SESSION_INVALID";
                        readonly message: "Invalid password reset session. Please request password reset again.";
                    } | {
                        readonly code: "PASSWORD_RESET_SESSION_EXPIRED";
                        readonly message: "Password reset session has expired. Please request password reset again.";
                    };
                    204: "No Content";
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
        signup: {
            post: (body: {
                email: string;
            } & {
                cfTurnstileResponse: string;
            }, options: {
                headers: {
                    "mc-client-type": "web" | "mobile";
                };
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                200: {
                    signupSessionToken: string;
                };
                204: "No Content";
                400: {
                    readonly code: "IP_ADDRESS_NOT_FOUND";
                    readonly message: "IP address not found";
                } | {
                    readonly code: "CAPTCHA_VERIFICATION_FAILED";
                    readonly message: "Verification failed.";
                } | {
                    readonly code: "EMAIL_ALREADY_USED";
                    readonly message: "Email is already used. Please use a different email address or try logging in.";
                } | {
                    readonly code: never;
                    readonly message: "Signup request failed. Please try again.";
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
            "verify-email": {
                post: (body: {
                    signupSessionToken?: string;
                    code: string;
                }, options: {
                    headers: {
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    401: {
                        readonly code: "SIGNUP_SESSION_INVALID";
                        readonly message: "Signup session token not found. Please request signup again.";
                    } | {
                        readonly code: "SIGNUP_SESSION_INVALID";
                        readonly message: "Signup session token is invalid. Please request signup again.";
                    } | {
                        readonly code: "SIGNUP_SESSION_EXPIRED";
                        readonly message: "Signup session token has expired. Please request signup again.";
                    };
                    204: "No Content";
                    400: {
                        readonly code: "IP_ADDRESS_NOT_FOUND";
                        readonly message: "IP address not found";
                    } | {
                        readonly code: "INVALID_VERIFICATION_CODE";
                        readonly message: "Invalid verification code. Please check your email and try again.";
                    } | {
                        readonly code: "ALREADY_VERIFIED";
                        readonly message: "Email is already verified. Please login.";
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
            confirm: {
                post: (body: {
                    signupSessionToken?: string;
                    name: string;
                    gender: "man" | "woman";
                    password: string;
                }, options: {
                    headers: {
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    401: {
                        readonly code: "SIGNUP_SESSION_INVALID";
                        readonly message: "Signup session token not found. Please request signup again.";
                    } | {
                        readonly code: "SIGNUP_SESSION_INVALID";
                        readonly message: "Signup session token is invalid. Please request signup again.";
                    } | {
                        readonly code: "SIGNUP_SESSION_EXPIRED";
                        readonly message: "Signup session token has expired. Please request signup again.";
                    };
                    200: {
                        sessionToken: string;
                    };
                    204: "No Content";
                    400: {
                        readonly code: "EMAIL_ALREADY_REGISTERED";
                        readonly message: "Email is already registered. Please use a different email address or try logging in.";
                    } | {
                        readonly code: "EMAIL_VERIFICATION_REQUIRED";
                        readonly message: "Email verification is required. Please verify your email address.";
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
        association: {
            post: (body: Partial<{
                accountAssociationSessionToken?: string;
            }> | null, options: {
                headers: {
                    "mc-client-type": "web" | "mobile";
                };
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                401: {
                    readonly code: "ACCOUNT_ASSOCIATION_SESSION_INVALID";
                    readonly message: "Account association session not found. Please login again.";
                } | {
                    readonly code: "ACCOUNT_ASSOCIATION_SESSION_INVALID";
                    readonly message: "Invalid account association session. Please login again.";
                } | {
                    readonly code: "ACCOUNT_ASSOCIATION_SESSION_EXPIRED";
                    readonly message: "Account association session has expired. Please login again.";
                };
                200: {
                    readonly accountAssociationSessionToken: string;
                };
                204: "No Content";
                400: {
                    readonly code: "IP_ADDRESS_NOT_FOUND";
                    readonly message: "IP address not found";
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
            confirm: {
                post: (body: {
                    accountAssociationSessionToken?: string;
                    code: string;
                }, options: {
                    headers: {
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    401: {
                        readonly code: "ACCOUNT_ASSOCIATION_SESSION_INVALID";
                        readonly message: "Account association session not found. Please login again.";
                    } | {
                        readonly code: "ACCOUNT_ASSOCIATION_SESSION_INVALID";
                        readonly message: "Invalid account association session. Please login again.";
                    } | {
                        readonly code: "ACCOUNT_ASSOCIATION_SESSION_EXPIRED";
                        readonly message: "Account association session has expired. Please login again.";
                    };
                    200: {
                        sessionToken: string;
                    };
                    204: "No Content";
                    400: {
                        readonly code: "IP_ADDRESS_NOT_FOUND";
                        readonly message: "IP address not found";
                    } | {
                        readonly code: "INVALID_ASSOCIATION_CODE";
                        readonly message: "Invalid association code. Please check your email and try again.";
                    } | {
                        readonly code: "ACCOUNT_ALREADY_LINKED";
                        readonly message: "This OAuth provider is already linked to your account.";
                    } | {
                        readonly code: "ACCOUNT_LINKED_ELSEWHERE";
                        readonly message: "This OAuth account is already linked to another user.";
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
                post: (body: {
                    accountAssociationSessionToken?: string;
                }, options: {
                    headers: {
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    401: {
                        readonly code: "ACCOUNT_ASSOCIATION_SESSION_INVALID";
                        readonly message: "Account association session not found. Please login again.";
                    } | {
                        readonly code: "ACCOUNT_ASSOCIATION_SESSION_INVALID";
                        readonly message: "Invalid account association session. Please login again.";
                    } | {
                        readonly code: "ACCOUNT_ASSOCIATION_SESSION_EXPIRED";
                        readonly message: "Account association session has expired. Please login again.";
                    };
                    200: {
                        provider: "discord" | "google";
                        providerId: string;
                        user: {
                            id: string;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            iconUrl: string | null;
                            gender: "man" | "woman";
                            createdAt: string;
                            updatedAt: string;
                        };
                    };
                    400: {
                        readonly code: "PROFILE_NOT_FOUND";
                        readonly message: "Failed to get profile";
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
        "@me": {
            get: (options: {
                headers: {
                    "mc-client-type": "web" | "mobile";
                } & {
                    authorization?: string;
                };
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                401: {
                    readonly code: "UNAUTHORIZED";
                    readonly message: "It looks like you are not authenticated. Please login to continue.";
                } | {
                    readonly code: "SESSION_EXPIRED" | "SESSION_INVALID";
                    readonly message: "It looks like your session is invalid. Please login to continue.";
                } | {
                    readonly code: "EMAIL_VERIFICATION_REQUIRED";
                    readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                };
                200: {
                    id: string;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    iconUrl: string | null;
                    gender: "man" | "woman";
                    createdAt: string;
                    updatedAt: string;
                };
                400: {
                    readonly code: "PROFILE_NOT_FOUND";
                    readonly message: "Failed to get profile";
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
            patch: (body: {
                name?: string;
                iconUrl?: string;
                gender?: "man" | "woman";
            }, options: {
                headers: {
                    "mc-client-type": "web" | "mobile";
                } & {
                    authorization?: string;
                };
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                401: {
                    readonly code: "UNAUTHORIZED";
                    readonly message: "It looks like you are not authenticated. Please login to continue.";
                } | {
                    readonly code: "SESSION_EXPIRED" | "SESSION_INVALID";
                    readonly message: "It looks like your session is invalid. Please login to continue.";
                } | {
                    readonly code: "EMAIL_VERIFICATION_REQUIRED";
                    readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                };
                200: {
                    id: string;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    iconUrl: string | null;
                    gender: "man" | "woman";
                    createdAt: string;
                    updatedAt: string;
                };
                400: {
                    readonly code: "PROFILE_NOT_FOUND";
                    readonly message: "Failed to update profile";
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
                patch: (body: {
                    newPassword: string;
                    currentPassword: string | null;
                }, options: {
                    headers: {
                        "mc-client-type": "web" | "mobile";
                    } & {
                        authorization?: string;
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    401: {
                        readonly code: "UNAUTHORIZED";
                        readonly message: "It looks like you are not authenticated. Please login to continue.";
                    } | {
                        readonly code: "SESSION_EXPIRED" | "SESSION_INVALID";
                        readonly message: "It looks like your session is invalid. Please login to continue.";
                    } | {
                        readonly code: "EMAIL_VERIFICATION_REQUIRED";
                        readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                    };
                    200: {
                        sessionToken: string;
                    };
                    204: "No Content";
                    400: {
                        readonly code: "INVALID_CURRENT_PASSWORD";
                        readonly message: "Current password is incorrect. Please check your password and try again.";
                    } | {
                        readonly code: never;
                        readonly message: "Failed to update password. Please try again.";
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
            connections: ((params: {
                provider: string | number;
            }) => {
                delete: (body: unknown, options: {
                    headers: {
                        "mc-client-type": "web" | "mobile";
                    } & {
                        authorization?: string;
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    401: {
                        readonly code: "UNAUTHORIZED";
                        readonly message: "It looks like you are not authenticated. Please login to continue.";
                    } | {
                        readonly code: "SESSION_EXPIRED" | "SESSION_INVALID";
                        readonly message: "It looks like your session is invalid. Please login to continue.";
                    } | {
                        readonly code: "EMAIL_VERIFICATION_REQUIRED";
                        readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                    };
                    204: "No Content";
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
            }) & {
                get: (options: {
                    headers: {
                        "mc-client-type": "web" | "mobile";
                    } & {
                        authorization?: string;
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    401: {
                        readonly code: "UNAUTHORIZED";
                        readonly message: "It looks like you are not authenticated. Please login to continue.";
                    } | {
                        readonly code: "SESSION_EXPIRED" | "SESSION_INVALID";
                        readonly message: "It looks like your session is invalid. Please login to continue.";
                    } | {
                        readonly code: "EMAIL_VERIFICATION_REQUIRED";
                        readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                    };
                    200: {
                        password: boolean;
                        discord: ({
                            provider: string;
                            providerUserId: string;
                            linkedAt: string;
                        } | null) | null;
                        google: ({
                            provider: string;
                            providerUserId: string;
                            linkedAt: string;
                        } | null) | null;
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
            email: {
                email: {
                    patch: (body: {
                        emailVerificationSessionToken?: string;
                        code: string;
                    }, options: {
                        headers: {
                            "mc-client-type": "web" | "mobile";
                        } & {
                            authorization?: string;
                        };
                        query?: Record<string, unknown>;
                        fetch?: RequestInit;
                    }) => Promise<Treaty.TreatyResponse<{
                        401: {
                            readonly code: "UNAUTHORIZED";
                            readonly message: "It looks like you are not authenticated. Please login to continue.";
                        } | {
                            readonly code: "SESSION_EXPIRED" | "SESSION_INVALID";
                            readonly message: "It looks like your session is invalid. Please login to continue.";
                        } | {
                            readonly code: "EMAIL_VERIFICATION_REQUIRED";
                            readonly message: "It looks like your email is not verified. Please verify your email to continue.";
                        };
                        200: {
                            sessionToken: string;
                        };
                        204: "No Content";
                        400: {
                            readonly code: "IP_ADDRESS_NOT_FOUND";
                            readonly message: "IP address not found";
                        } | {
                            readonly code: "EMAIL_VERIFICATION_SESSION_INVALID";
                            readonly message: "Email verification session is invalid. Please request a new verification email.";
                        } | {
                            readonly code: "EMAIL_VERIFICATION_SESSION_EXPIRED";
                            readonly message: "Email verification session has expired. Please request a new verification email.";
                        } | {
                            readonly code: "EMAIL_VERIFICATION_SESSION_INVALID";
                            readonly message: "Invalid email verification session. Please request a new verification email.";
                        } | {
                            readonly code: "EMAIL_ALREADY_REGISTERED";
                            readonly message: "Email is already in use by another account. Please use a different email address.";
                        } | {
                            readonly code: "INVALID_VERIFICATION_CODE";
                            readonly message: "Invalid verification code. Please check the code and try again.";
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
