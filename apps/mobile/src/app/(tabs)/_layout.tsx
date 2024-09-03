import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTheme } from "@mobile/features/theme/hooks";
import { colors } from "@mona-ca/design-tokens";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";

function TabBarIcon(props: {
	name: ComponentProps<typeof FontAwesome>["name"];
	color: string;
}) {
	return <FontAwesome size={28} {...props} />;
}

export default function TabLayout() {
	const [colorScheme] = useTheme();
	return (
		<Tabs
			screenOptions={{
				headerTitleStyle: {
					fontSize: 20,
					color: colors[colorScheme].orange[9],
				},
				headerStyle: {
					backgroundColor: colors[colorScheme].sand[2],
					borderBottomWidth: 1,
					borderBottomColor: colors[colorScheme].sand[5],
					shadowOpacity: 0,
					height: 110,
				},
				tabBarActiveTintColor: colors[colorScheme].orange[10],
				tabBarInactiveTintColor: colors[colorScheme].sand[8],
				tabBarItemStyle: {
					height: 50,
				},
				tabBarStyle: {
					backgroundColor: colors[colorScheme].sand[2],
					height: 85,
					borderTopWidth: 1,
					borderTopColor: colors[colorScheme].sand[5],
				},
			}}
			sceneContainerStyle={{
				backgroundColor: colors[colorScheme].sand[1],
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
