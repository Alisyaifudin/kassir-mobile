import { COLOR } from "@/lib/constants";
import React, { ComponentProps } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function FAB({ children, style, ...props }: ComponentProps<typeof TouchableOpacity>) {
	return (
		<View style={styles.container}>
			<TouchableOpacity style={[styles.button, style]} {...props}>
				{children}
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		bottom: 24,
		right: 24,
		zIndex: 999,
	},
	button: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: COLOR.zinc[900],
		justifyContent: "center",
		alignItems: "center",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
	},
});
