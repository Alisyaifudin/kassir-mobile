import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

export function Loader() {
	const rotateValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.loop(
			Animated.timing(rotateValue, {
				toValue: 1,
				duration: 1000,
				easing: Easing.linear,
				useNativeDriver: true,
			})
		).start();
	}, [rotateValue]);

	const rotate = rotateValue.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "360deg"],
	});

	return (
		<View style={styles.container}>
			<Animated.View style={{ transform: [{ rotate }] }}>
				<AntDesign name="loading1" size={20} color="white" />
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
	},
	// image: {
	// 	width: 40,
	// 	height: 40,
	// },
});
