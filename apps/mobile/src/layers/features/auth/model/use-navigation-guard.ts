import { useAtomValue } from "jotai";
import { hasAccountAssociationSessionTokenAtom, hasSessionTokenAtom } from "../../../entities/session";
import { userAtom } from "../../../entities/user";
import { visitPersonalizePageFlagAtom } from "./visit-personalize-page-flag-atom";

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
	const hasSessionToken = useAtomValue(hasSessionTokenAtom);
	const hasAccountAssociationSessionToken = useAtomValue(hasAccountAssociationSessionTokenAtom);
	const userState = useAtomValue(userAtom);
	const visitPersonalizePageFlag = useAtomValue(visitPersonalizePageFlagAtom);

	if (userState.loading) {
		return {
			loading: true,
			data: null,
		};
	}

	if (hasSessionToken) {
		if (userState.data) {
			if (visitPersonalizePageFlag) {
				return {
					loading: false,
					data: "personalize",
				};
			}

			if (!userState.data.emailVerified) {
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

		return {
			loading: false,
			data: "unauthenticated",
		};
	}

	if (hasAccountAssociationSessionToken) {
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
