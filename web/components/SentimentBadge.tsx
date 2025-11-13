'use client';

import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentimentBadgeProps {
	subject: string;
	snippet: string;
}

// Simple keyword-based sentiment analysis (MVP - can be replaced with real AI later)
function analyzeSentiment(subject: string, snippet: string): {
	sentiment: "urgent" | "positive" | "neutral" | "negative";
	label: string;
} {
	const text = `${subject} ${snippet}`.toLowerCase();

	// Urgent keywords
	const urgentKeywords = ["urgent", "asap", "immediately", "critical", "emergency", "deadline", "important", "time-sensitive"];
	if (urgentKeywords.some((keyword) => text.includes(keyword))) {
		return { sentiment: "urgent", label: "Urgent" };
	}

	// Positive keywords
	const positiveKeywords = ["thank", "great", "excellent", "wonderful", "appreciate", "congrat", "success", "perfect", "love"];
	if (positiveKeywords.some((keyword) => text.includes(keyword))) {
		return { sentiment: "positive", label: "Positive" };
	}

	// Negative keywords
	const negativeKeywords = ["problem", "issue", "error", "fail", "concern", "disappointed", "unhappy", "wrong", "complaint"];
	if (negativeKeywords.some((keyword) => text.includes(keyword))) {
		return { sentiment: "negative", label: "Needs Attention" };
	}

	return { sentiment: "neutral", label: "Neutral" };
}

export function SentimentBadge({ subject, snippet }: SentimentBadgeProps) {
	const { sentiment, label } = analyzeSentiment(subject, snippet);

	const config = {
		urgent: {
			icon: AlertCircle,
			className: "bg-red-500/10 text-red-500 border-red-500/20",
		},
		positive: {
			icon: CheckCircle,
			className: "bg-green-500/10 text-green-500 border-green-500/20",
		},
		negative: {
			icon: AlertTriangle,
			className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
		},
		neutral: {
			icon: Clock,
			className: "bg-muted text-muted-foreground border-border",
		},
	};

	const { icon: Icon, className } = config[sentiment];

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
				className
			)}
			title={`Sentiment: ${label}`}
		>
			<Icon className="h-3 w-3" />
			<span className="hidden sm:inline">{label}</span>
		</span>
	);
}

