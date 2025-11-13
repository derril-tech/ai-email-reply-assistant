'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { toast } from "react-hot-toast";
import { FileText, Plus, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Template {
	id: string;
	name: string;
	content: string;
}

const DEFAULT_TEMPLATES: Template[] = [
	{
		id: "meeting-request",
		name: "Meeting Request",
		content: "Hi [Name],\n\nI hope this email finds you well. I'd like to schedule a meeting to discuss [topic]. Would you be available for a [duration] call sometime [timeframe]?\n\nPlease let me know what works best for your schedule.\n\nBest regards,",
	},
	{
		id: "follow-up",
		name: "Follow-up",
		content: "Hi [Name],\n\nI wanted to follow up on my previous email regarding [topic]. Have you had a chance to review it?\n\nPlease let me know if you need any additional information.\n\nLooking forward to your response.\n\nBest,",
	},
	{
		id: "thank-you",
		name: "Thank You",
		content: "Hi [Name],\n\nThank you so much for [action/help]. I really appreciate your [time/assistance/support].\n\nLooking forward to [next steps/working together].\n\nBest regards,",
	},
	{
		id: "out-of-office",
		name: "Out of Office",
		content: "Thank you for your email. I am currently out of the office and will return on [date]. I will have limited access to email during this time.\n\nFor urgent matters, please contact [alternative contact].\n\nBest regards,",
	},
];

interface TemplatesSidebarProps {
	onInsert: (content: string) => void;
	onClose: () => void;
}

export function TemplatesSidebar({ onInsert, onClose }: TemplatesSidebarProps) {
	const [templates, setTemplates] = useState<Template[]>(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('email-templates');
			if (saved) {
				try {
					return JSON.parse(saved);
				} catch {
					return DEFAULT_TEMPLATES;
				}
			}
		}
		return DEFAULT_TEMPLATES;
	});

	const [isAdding, setIsAdding] = useState(false);
	const [newName, setNewName] = useState("");
	const [newContent, setNewContent] = useState("");

	const saveTemplates = (updatedTemplates: Template[]) => {
		setTemplates(updatedTemplates);
		if (typeof window !== 'undefined') {
			localStorage.setItem('email-templates', JSON.stringify(updatedTemplates));
		}
	};

	const handleAdd = () => {
		if (!newName.trim() || !newContent.trim()) {
			toast.error("Please provide both name and content");
			return;
		}

		const newTemplate: Template = {
			id: Date.now().toString(),
			name: newName,
			content: newContent,
		};

		saveTemplates([...templates, newTemplate]);
		setIsAdding(false);
		setNewName("");
		setNewContent("");
		toast.success("Template added!");
	};

	const handleDelete = (id: string) => {
		if (confirm("Delete this template?")) {
			saveTemplates(templates.filter((t) => t.id !== id));
			toast.success("Template deleted");
		}
	};

	const handleInsert = (content: string) => {
		onInsert(content);
		toast.success("Template inserted!");
	};

	return (
		<motion.div
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			exit={{ x: "100%" }}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			className="fixed right-0 top-0 h-full w-full md:w-96 bg-background border-l border-border shadow-2xl z-50 overflow-y-auto"
		>
			<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold font-display flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Templates
					</h2>
					<Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 sm:h-8 sm:w-8" aria-label="Close templates">
						<X className="h-5 w-5 sm:h-4 sm:w-4" />
					</Button>
				</div>

				{!isAdding ? (
					<Button
						onClick={() => setIsAdding(true)}
						className="w-full mb-4"
						variant="outline"
					>
						<Plus className="h-4 w-4 mr-2" />
						New Template
					</Button>
				) : (
					<Card className="p-4 mb-4">
						<h3 className="text-sm font-semibold mb-3">New Template</h3>
						<Input
							placeholder="Template name"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							className="mb-3"
						/>
						<textarea
							placeholder="Template content (use [placeholders] for variables)"
							value={newContent}
							onChange={(e) => setNewContent(e.target.value)}
							className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
						/>
						<div className="flex gap-2 mt-3">
							<Button size="sm" onClick={handleAdd}>
								Save
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									setIsAdding(false);
									setNewName("");
									setNewContent("");
								}}
							>
								Cancel
							</Button>
						</div>
					</Card>
				)}

				<div className="space-y-3">
					<AnimatePresence>
						{templates.map((template) => (
							<motion.div
								key={template.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
							>
								<Card className="p-4 hover:shadow-md transition-shadow">
									<div className="flex items-start justify-between mb-2">
										<h4 className="font-semibold text-sm">{template.name}</h4>
										{!DEFAULT_TEMPLATES.some((t) => t.id === template.id) && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(template.id)}
												className="h-6 w-6 p-0"
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										)}
									</div>
									<p className="text-xs text-muted-foreground line-clamp-3 mb-3">
										{template.content}
									</p>
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleInsert(template.content)}
										className="w-full"
									>
										Insert
									</Button>
								</Card>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
	);
}

