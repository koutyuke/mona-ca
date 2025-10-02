import { cn, tv } from "@mona-ca/tailwind-helpers";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "../text/index.native";

const variants = tv({
	slots: {
		wrapper: "flex w-full flex-col gap-1",
		labelContainer: "flex flex-row items-center gap-1",
		label: "text-slate-12",
		required: "text-red-9",
		description: "text-slate-11",
		error: "w-full text-red-9",
	},
	variants: {
		disabled: {
			true: {
				label: "text-slate-11",
				description: "text-slate-10",
			},
		},
	},
});

type Props = {
	children: ReactNode;
	label?: string;
	description?: string;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	className?: string;
};

const InputWrapper = ({
	children,
	label,
	description,
	error,
	required = false,
	disabled = false,
	className,
}: Props): ReactNode => {
	const {
		wrapper: wrapperStyle,
		labelContainer: labelContainerStyle,
		label: labelStyle,
		required: requiredStyle,
		description: descriptionStyle,
		error: errorStyle,
	} = variants({ disabled });

	return (
		<View className={cn(wrapperStyle(), className)}>
			{label && (
				<View className={labelContainerStyle()}>
					<Text className={labelStyle()} weight="medium">
						{label}
					</Text>
					{required && (
						<Text className={requiredStyle()} weight="medium">
							*
						</Text>
					)}
				</View>
			)}
			{description && !error && (
				<Text className={descriptionStyle()} size="sm">
					{description}
				</Text>
			)}
			{children}
			{error && (
				<Text className={errorStyle()} size="sm">
					{error}
				</Text>
			)}
		</View>
	);
};

export { InputWrapper };
