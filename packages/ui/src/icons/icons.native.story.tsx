import { View } from "react-native";
import {
	ArrowDownIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	ArrowUpIcon,
	BlueVioletDiscordIcon,
	CalendarHeartIcon,
	CalendarXIcon,
	CheckIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpIcon,
	CodeIcon,
	EmailIcon,
	ErrorIcon,
	EyeCloseIcon,
	EyeIcon,
	GoogleIcon,
	InfoIcon,
	PasswordIcon,
	PenIcon,
	PenOffIcon,
	SuccessIcon,
	UserIcon,
	WarningIcon,
	WhiteDiscordIcon,
} from "./icons.native";

import type { Meta, StoryObj } from "@storybook/react-webpack5";
import type { FC } from "react";
import type { IconProps } from "./type";

const meta: Meta = {
	title: "Icons/Icons",
	args: {
		size: 48,
		strokeWidth: 2,
		className: "color-slate-9",
	},
	argTypes: {
		className: {
			control: "text",
		},
		size: {
			control: "number",
		},
		strokeWidth: {
			control: "number",
		},
		color: {
			control: "color",
		},
	},
};

export default meta;

type Story = StoryObj<FC<IconProps>>;

export const Arrow: Story = {
	render: args => {
		return (
			<View className="flex flex-col gap-2">
				<ArrowDownIcon {...args} />
				<ArrowLeftIcon {...args} />
				<ArrowRightIcon {...args} />
				<ArrowUpIcon {...args} />
			</View>
		);
	},
};

export const Check: Story = {
	render: args => {
		return <CheckIcon {...args} />;
	},
};

export const Chevron: Story = {
	render: args => {
		return (
			<View className="flex flex-col gap-2">
				<ChevronDownIcon {...args} />
				<ChevronLeftIcon {...args} />
				<ChevronRightIcon {...args} />
				<ChevronUpIcon {...args} />
			</View>
		);
	},
};

export const Code: Story = {
	render: args => {
		return <CodeIcon {...args} />;
	},
};

export const Email: Story = {
	render: args => {
		return <EmailIcon {...args} />;
	},
};

export const Eye: Story = {
	render: args => {
		return (
			<View className="flex flex-col gap-2">
				<EyeIcon {...args} />
				<EyeCloseIcon {...args} />
			</View>
		);
	},
};

export const Password: Story = {
	render: args => {
		return <PasswordIcon {...args} />;
	},
};

export const Pen: Story = {
	render: args => {
		return (
			<View className="flex flex-col gap-2">
				<PenIcon {...args} />
				<PenOffIcon {...args} />
			</View>
		);
	},
};

export const User: Story = {
	render: args => {
		return <UserIcon {...args} />;
	},
};

export const Calendar: Story = {
	render: args => {
		return (
			<View className="flex flex-col gap-2">
				<CalendarHeartIcon {...args} />
				<CalendarXIcon {...args} />
			</View>
		);
	},
};

export const Discord: Story = {
	args: {
		className: "size-16",
	},
	render: args => {
		return (
			<View className="flex flex-col gap-2">
				<BlueVioletDiscordIcon {...args} />
				<WhiteDiscordIcon {...args} />
			</View>
		);
	},
};

export const Google: Story = {
	args: {
		className: "size-16",
	},
	render: args => {
		return <GoogleIcon {...args} />;
	},
};

export const Alert: Story = {
	render: args => {
		return (
			<View className="flex flex-col gap-2">
				<InfoIcon {...args} />
				<SuccessIcon {...args} />
				<WarningIcon {...args} />
				<ErrorIcon {...args} />
			</View>
		);
	},
};
