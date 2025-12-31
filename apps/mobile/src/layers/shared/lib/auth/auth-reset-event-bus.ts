type AuthResetReason = "logout" | "session-expired" | "session-revoked" | "invalid-token";

type AuthResetSubscriber = (reason: AuthResetReason) => void;

const subscribers = new Set<AuthResetSubscriber>();

/**
 * Subscribe to the logout event.
 * @param subscriber - The subscriber to add.
 * @returns A function to unsubscribe from the event.
 */
export const subscribeToAuthReset = (subscriber: AuthResetSubscriber): (() => void) => {
	subscribers.add(subscriber);
	return () => {
		subscribers.delete(subscriber);
	};
};

let isFlushScheduled = false;
let lastLogoutReason: AuthResetReason | null = null;

const flush = () => {
	isFlushScheduled = false;
	if (!lastLogoutReason) {
		return;
	}

	const snapshot = Array.from(subscribers);

	for (const subscriber of snapshot) {
		try {
			subscriber(lastLogoutReason);
		} catch (_error) {
			// Silently ignore subscriber errors to prevent cascade failures
		}
	}

	lastLogoutReason = null;
};

/**
 * Publish the logout event.
 * Use this function to notify all subscribers when the user is logged out.
 * Use this function where you want to call storage or cache initialization processes (e.g., when detecting a 401 error or when clicking the logout button).
 *
 * @param reason - The reason for the logout.
 */
export const publishAuthReset = (reason: AuthResetReason) => {
	lastLogoutReason = reason;
	if (!isFlushScheduled) {
		isFlushScheduled = true;
		queueMicrotask(flush);
	}
};

/**
 * Clear all subscribers.
 * Use this function only in tests.
 */
export const __unsafe_clearAllAuthResetSubscribers = () => {
	subscribers.clear();
};
