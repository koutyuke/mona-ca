import { View } from "react-native";
import { ContinueWithDiscordButton, ContinueWithGoogleButton } from "../../../../shared/ui/continue-with-method-button";
import type { SupportProvider } from "../../model/support-provider";

type Props = {
	pendingProvider: SupportProvider | null;
	actions: {
		onPressGoogle: () => void;
		onPressDiscord: () => void;
	};
};

export const LoginWithSocialUI = ({ pendingProvider, actions: { onPressGoogle, onPressDiscord } }: Props) => {
	return (
		<View className="flex w-full flex-col gap-2">
			<ContinueWithGoogleButton fullWidth loading={pendingProvider === "google"} onPress={onPressGoogle} />
			<ContinueWithDiscordButton fullWidth loading={pendingProvider === "discord"} onPress={onPressDiscord} />
		</View>
	);
};
