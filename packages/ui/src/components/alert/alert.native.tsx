import { tv } from "@mona-ca/tailwind-helpers";
import type { FC } from "react";
import { View } from "react-native";
import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from "../../icons/icons.native";
import { Text } from "../text/index.native";

type Props = {
	title: string;
	description?: string;
	type: "info" | "success" | "warning" | "error";
	className?: string;
};

const styleVariants = tv({
	slots: {
		body: "flex flex-row gap-2 rounded-lg border py-3 pr-4 pl-3",
		icon: "size-6",
		title: "max-w-full",
		description: null,
	},
	variants: {
		type: {
			info: {
				body: "border-blue-7 bg-blue-2",
				icon: "color-blue-9",
				title: "text-blue-9",
				description: "text-blue-12",
			},
			success: {
				body: "border-green-7 bg-green-2",
				icon: "color-green-9",
				title: "text-green-9",
				description: "text-green-12",
			},
			warning: {
				body: "border-yellow-7 bg-yellow-2",
				icon: "color-amber-10",
				title: "text-amber-10",
				description: "text-amber-12",
			},
			error: {
				body: "border-red-7 bg-red-2",
				icon: "color-red-9",
				title: "text-red-9",
				description: "text-red-12",
			},
		},
	},
});

const iconVariants = {
	info: InfoIcon,
	success: SuccessIcon,
	warning: WarningIcon,
	error: ErrorIcon,
};

export const Alert: FC<Props> = ({ title, description, type, className }) => {
	const {
		body: bodyStyle,
		icon: iconStyle,
		title: titleStyle,
		description: descriptionStyle,
	} = styleVariants({
		type,
	});

	const Icon = iconVariants[type];

	return (
		<View className={bodyStyle({ className })}>
			<Icon className={iconStyle()} />
			<View className="flex flex-1 flex-col gap-2">
				<View className="flex min-h-6 w-full items-start justify-center">
					<Text size="md" weight="medium" className={titleStyle()}>
						{title}
					</Text>
				</View>
				{description && (
					<Text size="sm" className={descriptionStyle()}>
						{description}
					</Text>
				)}
			</View>
		</View>
	);
};
