'use client';

import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { Smile, Briefcase, Zap } from "lucide-react";

interface ToneSelectorProps {
	value: "friendly" | "formal" | "brief";
	onChange: (tone: "friendly" | "formal" | "brief") => void;
}

const tones = [
	{
		value: "friendly" as const,
		label: "Friendly",
		icon: Smile,
		color: "text-blue-500",
		bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
		borderColor: "border-blue-500",
		description: "Warm and approachable",
		example: "Hey! Thanks for reaching out. I'd be happy to help with that...",
	},
	{
		value: "formal" as const,
		label: "Formal",
		icon: Briefcase,
		color: "text-purple-500",
		bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
		borderColor: "border-purple-500",
		description: "Professional and polished",
		example: "Dear [Name], Thank you for your inquiry. I am pleased to assist...",
	},
	{
		value: "brief" as const,
		label: "Brief",
		icon: Zap,
		color: "text-orange-500",
		bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
		borderColor: "border-orange-500",
		description: "Concise and direct",
		example: "Got it. Will do. Thanks.",
	},
];

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
	return (
		<div className="grid gap-3 md:grid-cols-3">
			{tones.map((tone) => {
				const Icon = tone.icon;
				const isSelected = value === tone.value;

				return (
					<motion.div
						key={tone.value}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<Card
							className={cn(
								"p-4 cursor-pointer transition-all border-2",
								isSelected
									? `${tone.borderColor} ${tone.bgColor}`
									: "border-border hover:border-muted-foreground/50",
								tone.bgColor
							)}
							onClick={() => onChange(tone.value)}
						>
							<div className="flex items-start gap-3">
								<div className={cn("mt-0.5", tone.color)}>
									<Icon className="h-5 w-5" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<h4 className="font-semibold text-sm">{tone.label}</h4>
										{isSelected && (
											<span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
												Selected
											</span>
										)}
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{tone.description}
									</p>
									<div className="mt-3 p-2 rounded-md bg-background/50 border border-border/50">
										<p className="text-xs italic text-muted-foreground line-clamp-2">
											"{tone.example}"
										</p>
									</div>
								</div>
							</div>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}

