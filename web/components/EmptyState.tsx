export default function EmptyState({ 
	icon = "📭", 
	title = "No items yet", 
	description = "Get started by creating your first item." 
}: { 
	icon?: string; 
	title?: string; 
	description?: string; 
}) {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<div className="text-6xl mb-4 opacity-50">{icon}</div>
			<h3 className="text-lg font-semibold text-text font-display">{title}</h3>
			<p className="mt-2 text-sm text-text/60 max-w-sm">{description}</p>
		</div>
	);
}

