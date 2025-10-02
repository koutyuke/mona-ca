import BlueVioletDiscord from "@mona-ca/core/assets/social/discord/blue-violet-icon.svg";
import WhiteDiscord from "@mona-ca/core/assets/social/discord/white-icon.svg";
import Google from "@mona-ca/core/assets/social/google/icon.svg";
import {
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	CalendarHeart,
	CalendarX2,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	CircleCheck,
	CircleX,
	Eye,
	EyeOff,
	Info,
	KeyRound,
	Mail,
	Pen,
	PenOff,
	RectangleEllipsis,
	TriangleAlert,
	UserRound,
} from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "./type";

const interopIcons = [
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	RectangleEllipsis,
	Mail,
	Eye,
	EyeOff,
	KeyRound,
	Pen,
	PenOff,
	UserRound,
	CalendarHeart,
	CalendarX2,
	Google,
	WhiteDiscord,
	BlueVioletDiscord,
	Info,
	CircleCheck,
	TriangleAlert,
	CircleX,
] as const;

for (const Icon of interopIcons) {
	cssInterop(Icon, {
		className: {
			target: "style",
			nativeStyleToProp: { width: true, height: true, stroke: true, fill: true },
		},
	});
}

export const ArrowLeftIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ArrowLeft size={size ?? 0} {...otherProps} />;
};

export const ArrowRightIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ArrowRight size={size ?? 0} {...otherProps} />;
};

export const ArrowUpIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ArrowUp size={size ?? 0} {...otherProps} />;
};

export const ArrowDownIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ArrowDown size={size ?? 0} {...otherProps} />;
};

export const CheckIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <Check size={size ?? 0} {...otherProps} />;
};

export const ChevronDownIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ChevronDown size={size ?? 0} {...otherProps} />;
};

export const ChevronLeftIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ChevronLeft size={size ?? 0} {...otherProps} />;
};

export const ChevronRightIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ChevronRight size={size ?? 0} {...otherProps} />;
};

export const ChevronUpIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ChevronUp size={size ?? 0} {...otherProps} />;
};

export const CodeIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <RectangleEllipsis size={size ?? 0} {...otherProps} />;
};

export const EmailIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <Mail size={size ?? 0} {...otherProps} />;
};

export const EyeIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <Eye size={size ?? 0} {...otherProps} />;
};

export const EyeCloseIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <EyeOff size={size ?? 0} {...otherProps} />;
};

export const PasswordIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <KeyRound size={size ?? 0} {...otherProps} />;
};

export const PenIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <Pen size={size ?? 0} {...otherProps} />;
};

export const PenOffIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <PenOff size={size ?? 0} {...otherProps} />;
};

export const UserIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <UserRound size={size ?? 0} {...otherProps} />;
};

export const CalendarHeartIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <CalendarHeart size={size ?? 0} {...otherProps} />;
};

export const CalendarXIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <CalendarX2 size={size ?? 0} {...otherProps} />;
};

export const BlueVioletDiscordIcon: FC<IconProps> = props => {
	return <BlueVioletDiscord {...props} />;
};

export const WhiteDiscordIcon: FC<IconProps> = props => {
	return <WhiteDiscord {...props} />;
};

export const GoogleIcon: FC<IconProps> = props => {
	return <Google {...props} />;
};

export const InfoIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <Info size={size ?? 0} {...otherProps} />;
};

export const SuccessIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <CircleCheck size={size ?? 0} {...otherProps} />;
};

export const WarningIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <TriangleAlert size={size ?? 0} {...otherProps} />;
};

export const ErrorIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <CircleX size={size ?? 0} {...otherProps} />;
};
