import { Dimensions } from "react-native";

export const screenHeight = Dimensions.get("screen").height;
export const screenWidth = Dimensions.get("screen").width;

export const vw = screenWidth / 100;
export const vh = screenHeight / 100;
