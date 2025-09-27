import { useAtomValue } from "jotai";
import { accountAssociationSessionTokenAtom, isAuthenticatedAtom } from "../../../entities/session";
import { userAtom } from "../../../entities/user";
import { visitPersonalizePageFlagAtom } from "../model/visit-personalize-page-flag";

type ProtectedRoute = "app" | "emailVerification" | "accountAssociation" | "unauthenticated" | "personalize";

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
	const accountAssociationSessionTokenState = useAtomValue(accountAssociationSessionTokenAtom);
	const userState = useAtomValue(userAtom);
	const visitPersonalizePageFlag = useAtomValue(visitPersonalizePageFlagAtom);

	if (userState.loading) {
		return {
			loading: true,
			data: null,
		};
	}

	if (isAuthenticated) {
		if (userState.data && !userState.data.emailVerified) {
			if (visitPersonalizePageFlag) {
				return {
					loading: false,
					data: "personalize",
				};
			}

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

	if (accountAssociationSessionTokenState) {
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
