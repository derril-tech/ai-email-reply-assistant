export default function LoaderDots({ label = "Loading" }: { label?: string }) {
	return (
		<div className="inline-flex items-center gap-2" aria-live="polite" aria-busy="true">
			<span className="text-sm text-text/70">{label}</span>
			<span className="inline-flex gap-1">
				<span className="h-2 w-2 animate-bounce rounded-full bg-text/60 [animation-delay:-0.3s]" />
				<span className="h-2 w-2 animate-bounce rounded-full bg-text/60 [animation-delay:-0.15s]" />
				<span className="h-2 w-2 animate-bounce rounded-full bg-text/60" />
			</span>
		</div>
	);
}


