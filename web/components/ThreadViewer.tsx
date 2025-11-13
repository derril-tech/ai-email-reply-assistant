'use client';

import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, User, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
	from: string;
	date: string;
	snippet: string;
}

interface ThreadViewerProps {
	subject: string;
	messages: Message[];
	className?: string;
}

export function ThreadViewer({ subject, messages, className }: ThreadViewerProps) {
	const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set([0])); // First message expanded by default

	const toggleMessage = (index: number) => {
		setExpandedIndices((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(index)) {
				newSet.delete(index);
			} else {
				newSet.add(index);
			}
			return newSet;
		});
	};

	const expandAll = () => {
		setExpandedIndices(new Set(messages.map((_, i) => i)));
	};

	const collapseAll = () => {
		setExpandedIndices(new Set([0])); // Keep first message expanded
	};

	// Get initials from email/name
	const getInitials = (from: string): string => {
		const match = from.match(/([A-Z])[a-z]+\s+([A-Z])/);
		if (match) {
			return `${match[1]}${match[2]}`;
		}
		return from.substring(0, 2).toUpperCase();
	};

	// Get color for avatar based on from address
	const getAvatarColor = (from: string): string => {
		const colors = [
			"bg-blue-500",
			"bg-green-500",
			"bg-purple-500",
			"bg-orange-500",
			"bg-pink-500",
			"bg-teal-500",
		];
		const index = from.charCodeAt(0) % colors.length;
		return colors[index];
	};

	return (
		<div className={cn("space-y-3", className)}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold">
					Conversation ({messages.length} message{messages.length !== 1 ? "s" : ""})
				</h3>
				<div className="flex gap-2">
					<Button variant="ghost" size="sm" onClick={expandAll}>
						Expand All
					</Button>
					<Button variant="ghost" size="sm" onClick={collapseAll}>
						Collapse All
					</Button>
				</div>
			</div>

			{/* Messages */}
			<div className="space-y-2">
				{messages.map((message, index) => {
					const isExpanded = expandedIndices.has(index);
					const initials = getInitials(message.from);
					const avatarColor = getAvatarColor(message.from);

					return (
						<Card key={index} className="overflow-hidden">
							<button
								onClick={() => toggleMessage(index)}
								className="w-full p-4 text-left hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<div className="flex items-start gap-3">
									{/* Avatar */}
									<div
										className={cn(
											"flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm",
											avatarColor
										)}
									>
										{initials}
									</div>

									{/* Message Info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<User className="h-3 w-3 text-muted-foreground" />
											<span className="font-medium text-sm truncate">{message.from}</span>
										</div>
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<Calendar className="h-3 w-3" />
											<span>{new Date(message.date).toLocaleString()}</span>
										</div>
										{!isExpanded && (
											<p className="text-xs text-muted-foreground mt-2 line-clamp-1">
												{message.snippet}
											</p>
										)}
									</div>

									{/* Expand/Collapse Icon */}
									{isExpanded ? (
										<ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
									) : (
										<ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
									)}
								</div>
							</button>

							{/* Expanded Content */}
							<AnimatePresence>
								{isExpanded && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.2 }}
									>
										<div className="px-4 pb-4 pt-2 border-t border-border">
											<p className="text-sm text-foreground whitespace-pre-wrap">
												{message.snippet}
											</p>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

