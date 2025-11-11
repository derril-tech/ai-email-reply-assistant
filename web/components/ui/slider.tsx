"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export interface SliderProps
	extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

export const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	SliderProps
>(({ className, ...props }, ref) => (
	<SliderPrimitive.Root
		ref={ref}
		className={cn(
			"relative flex w-full touch-none select-none items-center h-10",
			className
		)}
		{...props}
	>
		<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
			<SliderPrimitive.Range className="absolute h-full bg-primary" />
		</SliderPrimitive.Track>
		<SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-background bg-primary shadow-soft transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
	</SliderPrimitive.Root>
));
Slider.displayName = "Slider";

