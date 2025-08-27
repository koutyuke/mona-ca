import { isErr } from "@mona-ca/core/utils";
import { Text } from "@mona-ca/ui/native/components";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { View } from "react-native";
import { accountAssociationSessionTokenAtom, lastLoginMethodAtom, sessionTokenAtom } from "../../../entities/session";
import { ContinueWithDiscordButton, ContinueWithGoogleButton } from "../../../shared/ui";
import { loginWithSocial } from "../api/login-with-social";
import type { SupportProvider } from "../model/support-provider";

export const LoginWithSocial = () => {
	const setAccountAssociationToken = useSetAtom(accountAssociationSessionTokenAtom);
	const setSessionToken = useSetAtom(sessionTokenAtom);
	const setLastLoginMethod = useSetAtom(lastLoginMethodAtom);

	const [pendingProvider, setPendingProvider] = useState<SupportProvider | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleLoginWithSocial = async (provider: SupportProvider) => {
		setPendingProvider(provider);
		const result = await loginWithSocial(provider);
		if (isErr(result)) {
			if (result.code === "ACCOUNT_ASSOCIATION") {
				setAccountAssociationToken(result.value.associationSessionToken);
				setPendingProvider(null);
				return;
			}

			setErrorMessage(result.value.errorMessage);
			setPendingProvider(null);
			return;
		}
		const { sessionToken } = result.value;
		setSessionToken(sessionToken);
		setPendingProvider(null);
		setLastLoginMethod(provider);
	};

	return (
		<View className="flex w-full flex-col gap-2">
			{errorMessage && (
				<Text size="xs" className="text-red-9">
					{errorMessage}
				</Text>
			)}
			<ContinueWithGoogleButton
				fullWidth
				loading={pendingProvider === "google"}
				onPress={() => handleLoginWithSocial("google")}
			/>
			<ContinueWithDiscordButton
				fullWidth
				loading={pendingProvider === "discord"}
				onPress={() => handleLoginWithSocial("discord")}
			/>
		</View>
	);
};
