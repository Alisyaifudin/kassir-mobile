import { Text } from "react-native";

type Props = React.ComponentProps<typeof Text> & { when?: boolean };

export function TextError({ style, when = true, ...props }: Props) {
	if (!when) return null;
	return <Text {...props} style={[{ color: "red" }, style]} />;
}
