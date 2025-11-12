"use client";

import { useState, useEffect } from "react";

export function useGmailAuth(projectId: string = "default") {
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const apiUrl = typeof window !== "undefined" 
		? process.env.NEXT_PUBLIC_API_URL 
		: "";

	// Check auth status on mount
	useEffect(() => {
		if (!apiUrl) return;
		
		checkAuthStatus();
	}, [apiUrl, projectId]);

	async function checkAuthStatus() {
		try {
			const res = await fetch(`${apiUrl}/auth/status?project_id=${projectId}`);
			if (res.ok) {
				const data = await res.json();
				setIsAuthorized(data.connected);
			}
		} catch (err) {
			console.error("Auth status check failed:", err);
		}
	}

	async function connectGmail() {
		if (!apiUrl) {
			setError("API URL not configured");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// Get authorization URL from backend
			const res = await fetch(
				`${apiUrl}/auth/google?project_id=${projectId}&redirect_to=${encodeURIComponent(window.location.origin + "/playground?connected=true")}`
			);

			if (!res.ok) {
				throw new Error("Failed to initiate OAuth");
			}

			const data = await res.json();

			// Redirect to Google OAuth
			window.location.href = data.authorization_url;
		} catch (err: any) {
			setError(err.message || "Failed to connect Gmail");
			setLoading(false);
		}
	}

	function disconnect() {
		// TODO: Implement token revocation
		setIsAuthorized(false);
	}

	return {
		isAuthorized,
		loading,
		error,
		connectGmail,
		disconnect,
		checkAuthStatus,
	};
}

