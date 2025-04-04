import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "@mona-ca/design-tokens";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { useTheme } from "../../features/theme";

function TabBarIcon(props: {
	name: ComponentProps<typeof FontAwesome>["name"];
	color: string;
}) {
	return <FontAwesome size={28} {...props} />;
}

export default function TabLayout() {
	const [colorTheme] = useTheme();
	return (
		<Tabs
			screenOptions={{
				headerTitleStyle: {
					fontSize: 20,
					color: colors[colorTheme].orange[9],
				},
				headerStyle: {
					backgroundColor: colors[colorTheme].sand[2],
					borderBottomWidth: 1,
					borderBottomColor: colors[colorTheme].sand[5],
					shadowOpacity: 0,
					height: 110,
				},
				tabBarActiveTintColor: colors[colorTheme].orange[10],
				tabBarInactiveTintColor: colors[colorTheme].sand[8],
				tabBarItemStyle: {
					height: 50,
				},
				tabBarStyle: {
					backgroundColor: colors[colorTheme].sand[2],
					height: 85,
					borderTopWidth: 1,
					borderTopColor: colors[colorTheme].sand[5],
				},
				sceneStyle: {
					backgroundColor: colors[colorTheme].sand[1],
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Tab One",
					tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="two"
				options={{
					title: "Tab Two",
					tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
				}}
			/>
		</Tabs>
	);
}
