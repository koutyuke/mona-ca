import { Dimensions } from "react-native";

export const screenHeight = Dimensions.get("screen").height;
export const screenWidth = Dimensions.get("screen").width;

export const vw = (width: number) => (screenWidth / 100) * width;
export const vh = (height: number) => (screenHeight / 100) * height;
