import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react-native";
import * as React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { Button } from "./button";

const Password = React.forwardRef<React.ComponentRef<typeof TextInput>, TextInputProps>(
	({ className, placeholderClassName, ...props }, ref) => {
		const [show, setShow] = React.useState(false);
		return (
			<View className="relative w-full native:h-12 h-10">
				<TextInput
					autoComplete="password-new"
					secureTextEntry={!show}
					ref={ref}
					style={{ paddingRight: 60 }}
					className={cn(
						"web:flex h-10 native:h-12 web:w-full rounded-md border border-input bg-background px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
						props.editable === false && "opacity-50 web:cursor-not-allowed",
						className
					)}
					placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
					{...props}
				/>
				<Button variant="ghost" className="absolute top-0 right-0" onPress={() => setShow(!show)}>
					{show ? <Eye /> : <EyeOff />}
				</Button>
			</View>
		);
	}
);

Password.displayName = "Password";

export { Password };
