"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

export default function HeroVideo({ children }: { children?: ReactNode }) {
	return (
		<section className="relative isolate h-[72vh] w-full overflow-hidden rounded-2xl">
			<video
				className="absolute inset-0 h-full w-full object-cover"
				src="/hero-bg.mp4"
				autoPlay
				muted
				loop
				playsInline
				aria-label="Floating abstract background"
			/>
			{/* Enhanced gradient overlay for better text contrast */}
			<div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/60 to-background/30"></div>
			
			{/* Additional center vignette for text clarity */}
			<div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-background/40"></div>
			
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center"
			>
				{children}
			</motion.div>
		</section>
	);
}

