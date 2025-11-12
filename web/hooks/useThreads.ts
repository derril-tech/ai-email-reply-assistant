"use client";

import { useState, useEffect } from "react";

export interface Thread {
	id: string;
	subject: string;
	from: string;
	date: string;
	snippet: string;
}

export function useThreads(projectId: string = "default") {
	const [threads, setThreads] = useState<Thread[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const apiUrl = typeof window !== "undefined" 
		? process.env.NEXT_PUBLIC_API_URL 
		: "";

	async function fetchThreads() {
		if (!apiUrl) {
			setError("API URL not configured");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const res = await fetch(`${apiUrl}/threads?projectId=${projectId}&maxResults=20`);

			if (!res.ok) {
				throw new Error(`Failed to fetch threads: ${res.statusText}`);
			}

			const data = await res.json();
			setThreads(data.items || []);
		} catch (err: any) {
			setError(err.message || "Failed to fetch threads");
			console.error("Thread fetch error:", err);
		} finally {
			setLoading(false);
		}
	}

	// Auto-fetch on mount
	useEffect(() => {
		if (apiUrl && projectId) {
			fetchThreads();
		}
	}, [apiUrl, projectId]);

	return {
		threads,
		loading,
		error,
		refetch: fetchThreads,
	};
}

