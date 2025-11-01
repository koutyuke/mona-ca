// Domain
export const PRODUCTION_BASE_DOMAIN = "mona-ca.com" as const;

// Cookie
export const SESSION_COOKIE_NAME = "__Secure-mc_session_token" as const;
export const PASSWORD_RESET_SESSION_COOKIE_NAME = "__Secure-mc_password_reset_session_token" as const;
export const EMAIL_VERIFICATION_SESSION_COOKIE_NAME = "__Secure-mc_email_verification_session_token" as const;
export const ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME = "__Secure-mc_account_association_session_token" as const;
export const SIGNUP_SESSION_COOKIE_NAME = "__Secure-mc_signup_session_token" as const;

export const OAUTH_STATE_COOKIE_NAME = "mc_oauth_state" as const;
export const OAUTH_CODE_VERIFIER_COOKIE_NAME = "mc_oauth_code_verifier" as const;
export const OAUTH_REDIRECT_URI_COOKIE_NAME = "mc_oauth_redirect_uri" as const;

// Header
export const CLIENT_TYPE_HEADER_NAME = "mc-client-type" as const;
