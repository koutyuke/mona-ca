import { DiscordButton, GoogleButton } from "@mona-ca/ui/native/social";
import type { ComponentProps, FC } from "react";
import type { OAuthProvider } from "../types/provider";

type ProviderButtonProps = {
	provider: OAuthProvider;
} & ComponentProps<typeof GoogleButton>;

const ProviderButton: FC<ProviderButtonProps> = ({ provider, ...props }) => {
	const Component = provider === "google" ? GoogleButton : provider === "discord" ? DiscordButton : null;

	if (!Component) {
		return null;
	}
	return <Component {...props} />;
};

export { ProviderButton };
