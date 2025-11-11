import { cn } from "@/lib/utils";
import { type ReactNode, type HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	className?: string;
}

export function Card({ 
	children, 
	className,
	...props
}: CardProps) {
	return (
		<div className={cn("glass rounded-2xl border p-6", className)} {...props}>
			{children}
		</div>
	);
}

