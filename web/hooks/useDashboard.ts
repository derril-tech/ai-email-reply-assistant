import { useState, useEffect } from "react";

export interface DashboardStats {
    repliesGenerated: number;
    successRate: number;
    avgDraftLength: number;
    timeSavedMinutes: number;
    activeProjects: number;
}

export interface RecentDraft {
    id: string;
    subject: string;
    snippet: string;
    threadId: string;
    tone: string;
    createdAt: string;
}

export function useDashboard(projectId: string = "default") {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentDrafts, setRecentDrafts] = useState<RecentDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                setError(null);

                // Fetch stats
                const statsResponse = await fetch(`${apiUrl}/dashboard/stats?projectId=${projectId}`);
                if (!statsResponse.ok) {
                    throw new Error("Failed to fetch dashboard stats");
                }
                const statsData = await statsResponse.json();
                setStats(statsData);

                // Fetch recent drafts
                const draftsResponse = await fetch(`${apiUrl}/dashboard/recent-drafts?projectId=${projectId}&limit=5`);
                if (!draftsResponse.ok) {
                    throw new Error("Failed to fetch recent drafts");
                }
                const draftsData = await draftsResponse.json();
                setRecentDrafts(draftsData.items || []);

            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [apiUrl, projectId]);

    return { stats, recentDrafts, loading, error };
}

