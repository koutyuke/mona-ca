import { useAtomValue } from "jotai";
import { accountAssociationSessionTokenAtom, isAuthenticatedAtom } from "../../../entities/session";
import { userAtom } from "../../../entities/user";
import { visitableSetupPageAtom } from "../model/visitable-setup-page";

type ProtectedRoute = "app" | "emailVerification" | "accountAssociation" | "unauthenticated" | "ready" | "personalize";

type GuardState =
	| {
			loading: true;
			data: null;
	  }
	| {
			loading: false;
			data: ProtectedRoute;
	  };

export const useNavigationGuard = (): GuardState => {
	const isAuthenticated = useAtomValue(isAuthenticatedAtom);
	const accountAssociationTokenState = useAtomValue(accountAssociationSessionTokenAtom);
	const userState = useAtomValue(userAtom);

	const visitableSetupPage = useAtomValue(visitableSetupPageAtom);

	if (userState.loading) {
		return {
			loading: true,
			data: null,
		};
	}

	if (isAuthenticated) {
		if (visitableSetupPage) {
			return {
				loading: false,
				data: visitableSetupPage,
			};
		}

		if (userState.data && !userState.data.emailVerified) {
			return {
				loading: false,
				data: "emailVerification",
			};
		}

		return {
			loading: false,
			data: "app",
		};
	}

	if (accountAssociationTokenState) {
		return {
			loading: false,
			data: "accountAssociation",
		};
	}

	return {
		loading: false,
		data: "unauthenticated",
	};
};
