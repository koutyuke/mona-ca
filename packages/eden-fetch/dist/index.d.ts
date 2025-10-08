import { Treaty } from '@elysiajs/eden';

declare const createEdenFetch: (production: boolean, config?: Treaty.Config) => {
    "*": {
        options: (body?: unknown, options?: {
            headers?: Record<string, unknown>;
            query?: Record<string, unknown>;
            fetch?: RequestInit;
        } | undefined) => Promise<Treaty.TreatyResponse<{
            200: Response;
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
                200: null;
                302: null;
                400: {
                    code: "PARSE_ERROR";
                    message: string;
                } | {
                    code: "INVALID_COOKIE_SIGNATURE";
                    message: string;
                } | {
                    code: "INVALID_REDIRECT_URL";
                    message: string;
                };
                422: {
                    code: "VALIDATION_ERROR";
                    message: string;
                } & {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
                429: {
                    code: "TOO_MANY_REQUESTS";
                    message: string;
                };
                500: {
                    code: "INTERNAL_SERVER_ERROR";
                    message: string;
                } | {
                    code: "UNKNOWN_ERROR";
                    message: string;
                };
            }>>;
            callback: {
                get: (options: {
                    headers?: Record<string, unknown>;
                    query: {
                        code?: string;
                        error?: string;
                        state?: string;
                    };
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    200: null;
                    302: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_REDIRECT_URL";
                        message: string;
                    } | {
                        code: "OAUTH_CREDENTIALS_INVALID";
                        message: string;
                    } | {
                        code: "INVALID_OAUTH_STATE";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        code: "TOO_MANY_REQUESTS";
                        message: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
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
                200: null;
                302: null;
                400: {
                    code: "PARSE_ERROR";
                    message: string;
                } | {
                    code: "INVALID_COOKIE_SIGNATURE";
                    message: string;
                } | {
                    code: "INVALID_REDIRECT_URL";
                    message: string;
                };
                422: {
                    code: "VALIDATION_ERROR";
                    message: string;
                } & {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
                429: {
                    code: "TOO_MANY_REQUESTS";
                    message: string;
                };
                500: {
                    code: "INTERNAL_SERVER_ERROR";
                    message: string;
                } | {
                    code: "UNKNOWN_ERROR";
                    message: string;
                };
            }>>;
            callback: {
                get: (options: {
                    headers?: Record<string, unknown>;
                    query: {
                        code?: string;
                        error?: string;
                        state?: string;
                    };
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    200: null;
                    302: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_REDIRECT_URL";
                        message: string;
                    } | {
                        code: "OAUTH_CREDENTIALS_INVALID";
                        message: string;
                    } | {
                        code: "INVALID_OAUTH_STATE";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        code: "TOO_MANY_REQUESTS";
                        message: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
        };
        link: {
            get: (options: {
                headers: {
                    authorization?: string;
                    "mc-client-type": "web" | "mobile";
                };
                query: {
                    "redirect-uri"?: string;
                };
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                200: {
                    url: string;
                };
                400: {
                    code: "PARSE_ERROR";
                    message: string;
                } | {
                    code: "INVALID_COOKIE_SIGNATURE";
                    message: string;
                } | {
                    code: "INVALID_CLIENT_TYPE";
                    message: string;
                } | {
                    code: "INVALID_REDIRECT_URL";
                    message: string;
                };
                401: {
                    code: "EXPIRED_SESSION";
                    message: string;
                } | {
                    code: "INVALID_SESSION";
                    message: string;
                } | {
                    code: "EMAIL_VERIFICATION_REQUIRED";
                    message: string;
                };
                422: {
                    code: "VALIDATION_ERROR";
                    message: string;
                } & {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
                429: {
                    code: "TOO_MANY_REQUESTS";
                    message: string;
                };
                500: {
                    code: "INTERNAL_SERVER_ERROR";
                    message: string;
                } | {
                    code: "UNKNOWN_ERROR";
                    message: string;
                };
            }>>;
            callback: {
                get: (options: {
                    headers?: Record<string, unknown>;
                    query: {
                        code?: string;
                        error?: string;
                        state?: string;
                    };
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    200: null;
                    302: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_REDIRECT_URL";
                        message: string;
                    } | {
                        code: "OAUTH_CREDENTIALS_INVALID";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        code: "TOO_MANY_REQUESTS";
                        message: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
        };
    }) & {
        "email-verification": {
            index: {
                post: (body: {
                    email: string | null;
                }, options: {
                    headers: {
                        authorization?: string;
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    200: {
                        emailVerificationSessionToken: string;
                    };
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    } | {
                        code: "EMAIL_ALREADY_VERIFIED";
                        message: string;
                    } | {
                        code: "EMAIL_ALREADY_REGISTERED";
                        message: string;
                    };
                    401: {
                        code: "EXPIRED_SESSION";
                        message: string;
                    } | {
                        code: "INVALID_SESSION";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_REQUIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        code: "TOO_MANY_REQUESTS";
                        message: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
            confirm: {
                post: (body: {
                    emailVerificationSessionToken?: string;
                    code: string;
                }, options: {
                    headers: {
                        authorization?: string;
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    200: {
                        sessionToken: string;
                    };
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    } | {
                        code: "INVALID_VERIFICATION_CODE";
                        message: string;
                    } | {
                        code: "EMAIL_MISMATCH";
                        message: string;
                    };
                    401: {
                        code: "EXPIRED_SESSION";
                        message: string;
                    } | {
                        code: "INVALID_SESSION";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_REQUIRED";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_SESSION_INVALID";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_SESSION_EXPIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        code: "TOO_MANY_REQUESTS";
                        message: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
        };
        "forgot-password": {
            index: {
                post: (body: {
                    email: string;
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
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    } | {
                        code: "USER_NOT_FOUND";
                        message: string;
                    } | {
                        code: "IP_ADDRESS_NOT_FOUND";
                        message: string;
                    } | {
                        code: "CAPTCHA_VERIFICATION_FAILED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        code: "TOO_MANY_REQUESTS";
                        message: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
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
                    200: null;
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    } | {
                        code: "INVALID_CODE";
                        message: string;
                    };
                    401: {
                        code: "PASSWORD_RESET_SESSION_INVALID";
                        message: string;
                    } | {
                        code: "PASSWORD_RESET_SESSION_EXPIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        code: "TOO_MANY_REQUESTS";
                        message: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
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
                    200: null;
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    };
                    401: {
                        code: "PASSWORD_RESET_SESSION_INVALID";
                        message: string;
                    } | {
                        code: "PASSWORD_RESET_SESSION_EXPIRED";
                        message: string;
                    };
                    403: {
                        code: "REQUIRED_EMAIL_VERIFICATION";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
        };
        signup: {
            index: {
                post: (body: {
                    email: string;
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
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    } | {
                        code: "IP_ADDRESS_NOT_FOUND";
                        message: string;
                    } | {
                        code: "CAPTCHA_VERIFICATION_FAILED";
                        message: string;
                    } | {
                        code: "EMAIL_ALREADY_USED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        code: "TOO_MANY_REQUESTS";
                        message: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
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
                    200: null;
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    } | {
                        code: "INVALID_VERIFICATION_CODE";
                        message: string;
                    } | {
                        code: "ALREADY_VERIFIED";
                        message: string;
                    };
                    401: {
                        code: "SIGNUP_SESSION_INVALID";
                        message: string;
                    } | {
                        code: "SIGNUP_SESSION_EXPIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        code: "TOO_MANY_REQUESTS";
                        message: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
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
                    200: {
                        sessionToken: string;
                    };
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_REQUIRED";
                        message: string;
                    } | {
                        code: "EMAIL_ALREADY_REGISTERED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
        };
        login: {
            post: (body: {
                email: string;
                password: string;
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
                204: null;
                400: {
                    code: "PARSE_ERROR";
                    message: string;
                } | {
                    code: "INVALID_COOKIE_SIGNATURE";
                    message: string;
                } | {
                    code: "INVALID_CLIENT_TYPE";
                    message: string;
                } | {
                    code: "IP_ADDRESS_NOT_FOUND";
                    message: string;
                } | {
                    code: "CAPTCHA_VERIFICATION_FAILED";
                    message: string;
                } | {
                    code: "INVALID_CREDENTIALS";
                    message: string;
                };
                422: {
                    code: "VALIDATION_ERROR";
                    message: string;
                } & {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
                429: {
                    code: "TOO_MANY_REQUESTS";
                    message: string;
                };
                500: {
                    code: "INTERNAL_SERVER_ERROR";
                    message: string;
                } | {
                    code: "UNKNOWN_ERROR";
                    message: string;
                };
            }>>;
        };
        logout: {
            post: (body: unknown, options: {
                headers: {
                    authorization?: string;
                    "mc-client-type": "web" | "mobile";
                };
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                200: null;
                204: null;
                400: {
                    code: "PARSE_ERROR";
                    message: string;
                } | {
                    code: "INVALID_COOKIE_SIGNATURE";
                    message: string;
                } | {
                    code: "INVALID_CLIENT_TYPE";
                    message: string;
                };
                401: {
                    code: "EXPIRED_SESSION";
                    message: string;
                } | {
                    code: "INVALID_SESSION";
                    message: string;
                } | {
                    code: "EMAIL_VERIFICATION_REQUIRED";
                    message: string;
                };
                422: {
                    code: "VALIDATION_ERROR";
                    message: string;
                } & {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
                500: {
                    code: "INTERNAL_SERVER_ERROR";
                    message: string;
                } | {
                    code: "UNKNOWN_ERROR";
                    message: string;
                };
            }>>;
        };
        association: {
            post: (body: {
                accountAssociationSessionToken?: string;
            } | null, options: {
                headers: {
                    "mc-client-type": "web" | "mobile";
                };
                query?: Record<string, unknown>;
                fetch?: RequestInit;
            }) => Promise<Treaty.TreatyResponse<{
                200: {
                    accountAssociationSessionToken: string;
                };
                204: null;
                400: {
                    code: "PARSE_ERROR";
                    message: string;
                } | {
                    code: "INVALID_COOKIE_SIGNATURE";
                    message: string;
                } | {
                    code: "INVALID_CLIENT_TYPE";
                    message: string;
                };
                401: {
                    code: "ACCOUNT_ASSOCIATION_SESSION_INVALID";
                    message: string;
                } | {
                    code: "ACCOUNT_ASSOCIATION_SESSION_EXPIRED";
                    message: string;
                };
                422: {
                    code: "VALIDATION_ERROR";
                    message: string;
                } & {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
                429: {
                    code: "TOO_MANY_REQUESTS";
                    message: string;
                };
                500: {
                    code: "INTERNAL_SERVER_ERROR";
                    message: string;
                } | {
                    code: "UNKNOWN_ERROR";
                    message: string;
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
                    200: {
                        sessionToken: string;
                    };
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    } | {
                        code: "INVALID_ASSOCIATION_CODE";
                        message: string;
                    } | {
                        code: "OAUTH_PROVIDER_ALREADY_LINKED";
                        message: string;
                    } | {
                        code: "OAUTH_ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER";
                        message: string;
                    } | {
                        code: "USER_NOT_FOUND";
                        message: string;
                    };
                    401: {
                        code: "ACCOUNT_ASSOCIATION_SESSION_INVALID";
                        message: string;
                    } | {
                        code: "ACCOUNT_ASSOCIATION_SESSION_EXPIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    429: {
                        code: "TOO_MANY_REQUESTS";
                        message: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
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
                    200: {
                        provider: string;
                        providerId: string;
                        user: {
                            name: string;
                            gender: "man" | "woman";
                            id: string;
                            email: string;
                            emailVerified: boolean;
                            iconUrl: string | null;
                            createdAt: string;
                            updatedAt: string;
                        };
                    };
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    };
                    401: {
                        code: "ACCOUNT_ASSOCIATION_SESSION_INVALID";
                        message: string;
                    } | {
                        code: "ACCOUNT_ASSOCIATION_SESSION_EXPIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
        };
    };
    users: {
        "@me": {
            index: {
                get: (options: {
                    headers: {
                        authorization?: string;
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    200: {
                        name: string;
                        gender: "man" | "woman";
                        id: string;
                        email: string;
                        emailVerified: boolean;
                        iconUrl: string | null;
                        createdAt: string;
                        updatedAt: string;
                    };
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    };
                    401: {
                        code: "EXPIRED_SESSION";
                        message: string;
                    } | {
                        code: "INVALID_SESSION";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_REQUIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
                patch: (body: {
                    name?: string;
                    gender?: "man" | "woman";
                    iconUrl?: string;
                }, options: {
                    headers: {
                        authorization?: string;
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    200: {
                        name: string;
                        gender: "man" | "woman";
                        id: string;
                        email: string;
                        emailVerified: boolean;
                        iconUrl: string | null;
                        createdAt: string;
                        updatedAt: string;
                    };
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    };
                    401: {
                        code: "EXPIRED_SESSION";
                        message: string;
                    } | {
                        code: "INVALID_SESSION";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_REQUIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
            email: {
                patch: (body: {
                    emailVerificationSessionToken?: string;
                    code: string;
                }, options: {
                    headers: {
                        authorization?: string;
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    200: {
                        sessionToken: string;
                    };
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    } | {
                        code: "INVALID_VERIFICATION_CODE";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_SESSION_INVALID";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_SESSION_EXPIRED";
                        message: string;
                    } | {
                        code: "EMAIL_ALREADY_REGISTERED";
                        message: string;
                    };
                    401: {
                        code: "EXPIRED_SESSION";
                        message: string;
                    } | {
                        code: "INVALID_SESSION";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_REQUIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
            password: {
                patch: (body: {
                    currentPassword?: string;
                    newPassword: string;
                }, options: {
                    headers: {
                        authorization?: string;
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    200: {
                        sessionToken: string;
                    };
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    } | {
                        code: "INVALID_CURRENT_PASSWORD";
                        message: string;
                    };
                    401: {
                        code: "EXPIRED_SESSION";
                        message: string;
                    } | {
                        code: "INVALID_SESSION";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_REQUIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
            connections: ((params: {
                provider: string | number;
            }) => {
                delete: (body: unknown, options: {
                    headers: {
                        authorization?: string;
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    200: null;
                    204: null;
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    } | {
                        code: "ACCOUNT_NOT_LINKED";
                        message: string;
                    } | {
                        code: "UNLINK_OPERATION_FAILED";
                        message: string;
                    } | {
                        code: "PASSWORD_NOT_SET";
                        message: string;
                    };
                    401: {
                        code: "EXPIRED_SESSION";
                        message: string;
                    } | {
                        code: "INVALID_SESSION";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_REQUIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            }) & {
                get: (options: {
                    headers: {
                        authorization?: string;
                        "mc-client-type": "web" | "mobile";
                    };
                    query?: Record<string, unknown>;
                    fetch?: RequestInit;
                }) => Promise<Treaty.TreatyResponse<{
                    200: {
                        discord: {
                            provider: string;
                            providerId: string;
                            linkedAt: string;
                        } | null;
                        google: {
                            provider: string;
                            providerId: string;
                            linkedAt: string;
                        } | null;
                        password: boolean;
                    };
                    400: {
                        code: "PARSE_ERROR";
                        message: string;
                    } | {
                        code: "INVALID_COOKIE_SIGNATURE";
                        message: string;
                    } | {
                        code: "INVALID_CLIENT_TYPE";
                        message: string;
                    };
                    401: {
                        code: "EXPIRED_SESSION";
                        message: string;
                    } | {
                        code: "INVALID_SESSION";
                        message: string;
                    } | {
                        code: "EMAIL_VERIFICATION_REQUIRED";
                        message: string;
                    };
                    422: {
                        code: "VALIDATION_ERROR";
                        message: string;
                    } & {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                    500: {
                        code: "INTERNAL_SERVER_ERROR";
                        message: string;
                    } | {
                        code: "UNKNOWN_ERROR";
                        message: string;
                    };
                }>>;
            };
        };
    };
    index: {
        get: (options?: {
            headers?: Record<string, unknown>;
            query?: Record<string, unknown>;
            fetch?: RequestInit;
        } | undefined) => Promise<Treaty.TreatyResponse<{
            200: string;
        }>>;
    };
};

export { createEdenFetch };
