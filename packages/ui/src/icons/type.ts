import type { LucideProps } from "lucide-react-native";

export type IconProps = Pick<LucideProps, "size" | "color" | "strokeWidth"> & {
	className?: string;
};
