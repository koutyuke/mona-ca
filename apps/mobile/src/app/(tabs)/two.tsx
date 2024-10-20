import { openAuthSessionAsync } from "expo-web-browser";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function TabTwoScreen() {
	const [accessToken, setAccessToken] = useState<string | null>(null);

	const signupHandle = async () => {
		const authUrl = new URL("http://localhost:8787/auth/mobile/signup/discord");
		authUrl.searchParams.append("redirect-url", "/signup/discord");
		authUrl.searchParams.append("gender", "woman");
		const result = await openAuthSessionAsync(authUrl.toString(), "mona-ca://signup/discord", {
			preferEphemeralSession: true,
		});

		if (result.type === "success") {
			const parsedUrl = new URL(result.url);

			const accessToken = parsedUrl.searchParams.get("access-token");
			const errorCode = parsedUrl.searchParams.get("error");

			if (errorCode) {
				console.error(`Error: ${errorCode}`);
				return;
			}

			if (accessToken) {
				setAccessToken(accessToken);
				return;
			}
		}
	};

	const loginHandle = async () => {
		const authUrl = new URL("http://localhost:8787/auth/mobile/login/discord");
		authUrl.searchParams.append("redirect-url", "/login/discord");
		const result = await openAuthSessionAsync(authUrl.toString(), "mona-ca://login/discord", {
			preferEphemeralSession: true,
		});

		if (result.type === "success") {
			const parsedUrl = new URL(result.url);

			const accessToken = parsedUrl.searchParams.get("access-token");
			const errorCode = parsedUrl.searchParams.get("error");

			if (errorCode) {
				console.error(`Error: ${errorCode}`);
				return;
			}

			if (accessToken) {
				setAccessToken(accessToken);
				return;
			}
		}
	};

	return (
		<View className="flex h-full w-full items-center justify-center gap-2">
			<TouchableOpacity
				className="box-border h-12 w-64 flex-row items-center justify-center gap-x-2 rounded-lg border-2 border-sand-6 bg-sand-3 p-0"
				onPress={signupHandle}
			>
				<Text className="font-mPlusRounded1c text-sand-11 text-xl">Sign-up with Discord</Text>
			</TouchableOpacity>
			<TouchableOpacity
				className="box-border h-12 w-64 flex-row items-center justify-center gap-x-2 rounded-lg border-2 border-sand-6 bg-sand-3 p-0"
				onPress={loginHandle}
			>
				<Text className="font-mPlusRounded1c text-sand-11 text-xl">Log-in with Discord</Text>
			</TouchableOpacity>
			<TouchableOpacity
				className="box-border h-12 w-64 flex-row items-center justify-center gap-x-2 rounded-lg border-2 border-sand-6 bg-sand-3 p-0"
				onPress={() => {
					setAccessToken(null);
				}}
			>
				<Text className="font-mPlusRounded1c text-sand-11 text-xl">Reset Token</Text>
			</TouchableOpacity>
			<Text className="text-2xl text-pure">Token: {accessToken ?? "No token"}</Text>
		</View>
	);
}
