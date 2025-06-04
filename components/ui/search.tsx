import { cn } from "@/lib/utils";
import { X } from "lucide-react-native";
import * as React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { Button } from "./button";
import { Show } from "../Show";

const Search = React.forwardRef<React.ComponentRef<typeof TextInput>, TextInputProps>(
	({ className, placeholderClassName, value, onChangeText, ...props }, ref) => {
		return (
			<View className="w-full native:h-12 h-10 flex-1 flex-row items-center">
				<TextInput
					ref={ref}
					style={{ paddingRight: 60 }}
					className={cn(
						"h-10 native:h-12 rounded-md border border-input bg-background native:w-full flex-1 px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
						props.editable === false && "opacity-50 web:cursor-not-allowed",
						className
					)}
					value={value}
					onChangeText={onChangeText}
					placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
					{...props}
				/>
				<Show when={value !== ""}>
					<Button variant="ghost" size="icon" onPress={() => onChangeText?.("")}>
						<X />
					</Button>
				</Show>
			</View>
		);
	}
);

Search.displayName = "Password";

export { Search };
