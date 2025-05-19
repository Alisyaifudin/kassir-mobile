import { Text, StyleSheet } from 'react-native';

export type TextHeaderProps = React.ComponentProps<typeof Text>

export function TextHeader({ children, ...props }: TextHeaderProps) {
  return <Text {...props} style={{
    fontWeight: "bold",
    fontSize: 40,
    paddingHorizontal: 10,
    fontStyle: "italic"
  }}>{children}</Text>
}


