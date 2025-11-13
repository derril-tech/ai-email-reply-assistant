'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { Copy, RotateCw, Trash2 } from 'lucide-react';

interface DraftEditorProps {
	initialDraft: string;
	onRegenerate: () => void;
	isRegenerating: boolean;
}

export function DraftEditor({ initialDraft, onRegenerate, isRegenerating }: DraftEditorProps) {
	const [draft, setDraft] = useState(initialDraft);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	// Update when new draft arrives from API
	useEffect(() => {
		setDraft(initialDraft);
		setHasUnsavedChanges(false);
	}, [initialDraft]);

	// Track unsaved changes
	useEffect(() => {
		setHasUnsavedChanges(draft !== initialDraft);
	}, [draft, initialDraft]);

	// Calculate word and character counts (memoized for performance)
	const { wordCount, charCount } = useMemo(() => {
		const words = draft.trim().split(/\s+/).filter(Boolean).length;
		const chars = draft.length;
		return { wordCount: words, charCount: chars };
	}, [draft]);

	// Copy to clipboard with fallback for older browsers
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(draft);
			toast.success('Draft copied to clipboard!');
		} catch (_error) {
			// Fallback for older browsers
			const textarea = document.createElement('textarea');
			textarea.value = draft;
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			toast.success('Draft copied to clipboard!');
		}
	};

	// Clear editor with confirmation
	const handleClear = () => {
		if (draft.trim().length === 0) return;
		if (confirm('Clear the draft? This cannot be undone.')) {
			setDraft('');
		}
	};

	// Re-generate with warning if edited
	const handleRegenerate = () => {
		if (hasUnsavedChanges) {
			if (!confirm('You have unsaved edits. Re-generate and lose changes?')) {
				return;
			}
		}
		onRegenerate();
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ctrl+Enter: Re-generate
			if (e.ctrlKey && e.key === 'Enter') {
				e.preventDefault();
				handleRegenerate();
			}
			// Ctrl+K: Clear
			if (e.ctrlKey && e.key === 'k') {
				e.preventDefault();
				handleClear();
			}
			// Ctrl+Shift+C: Copy
			if (e.ctrlKey && e.shiftKey && e.key === 'C') {
				e.preventDefault();
				handleCopy();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [draft, initialDraft, hasUnsavedChanges]);

	return (
		<div className="flex flex-col gap-3">
			{/* Editor Textarea */}
			<textarea
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				className="w-full min-h-[200px] max-h-[600px] p-4 rounded-xl border border-border bg-background text-foreground font-mono text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y transition-all"
				placeholder="Your AI-generated draft will appear here. You can edit it freely."
				aria-label="Draft editor"
				disabled={isRegenerating}
			/>

			{/* Counts and Actions */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				{/* Counts */}
				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
					<span>·</span>
					<span>{charCount} {charCount === 1 ? 'character' : 'characters'}</span>
					{hasUnsavedChanges && (
						<>
							<span>·</span>
							<span className="text-amber-500 dark:text-amber-400 font-medium">Edited</span>
						</>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="outline"
						onClick={handleClear}
						disabled={!draft || isRegenerating}
						title="Clear draft (Ctrl+K)"
						aria-label="Clear draft"
					>
						<Trash2 className="h-4 w-4 sm:mr-1" />
						<span className="hidden sm:inline">Clear</span>
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={handleCopy}
						disabled={!draft}
						title="Copy to clipboard (Ctrl+Shift+C)"
						aria-label="Copy to clipboard"
					>
						<Copy className="h-4 w-4 sm:mr-1" />
						<span className="hidden sm:inline">Copy</span>
					</Button>
					<Button
						size="sm"
						onClick={handleRegenerate}
						disabled={isRegenerating}
						title="Re-generate draft (Ctrl+Enter)"
						aria-label="Re-generate draft"
					>
						<RotateCw className={`h-4 w-4 sm:mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
						<span className="hidden sm:inline">Re-generate</span>
					</Button>
				</div>
			</div>
		</div>
	);
}

