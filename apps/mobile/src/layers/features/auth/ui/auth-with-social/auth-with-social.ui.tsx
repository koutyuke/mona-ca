import { Alert } from "@mona-ca/ui/native/components";
import { View } from "react-native";
import { ContinueWithDiscordButton, ContinueWithGoogleButton } from "../../../../shared/ui/continue-with-method-button";

import type { SupportProvider } from "../../model/support-provider";

type Props = {
	pendingProvider: SupportProvider | null;
	error: string | null;
	actions: {
		onPressGoogle: () => void;
		onPressDiscord: () => void;
	};
};

export const AuthWithSocialUI = ({ pendingProvider, error, actions: { onPressGoogle, onPressDiscord } }: Props) => {
	return (
		<View className="flex w-full flex-col gap-2">
			{error && <Alert title={error} type="error" />}
			<ContinueWithGoogleButton fullWidth loading={pendingProvider === "google"} onPress={onPressGoogle} />
			<ContinueWithDiscordButton fullWidth loading={pendingProvider === "discord"} onPress={onPressDiscord} />
		</View>
	);
};
