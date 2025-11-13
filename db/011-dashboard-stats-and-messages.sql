-- Migration: Dashboard stats and messages tracking
-- Created automatically by Cursor AI (2025-11-13)

-- Ensure emailreply schema exists
CREATE SCHEMA IF NOT EXISTS emailreply;

-- Add draft_metadata column to messages table for tracking draft details
ALTER TABLE emailreply.messages 
ADD COLUMN IF NOT EXISTS draft_metadata JSONB;

-- Create index for faster dashboard queries
CREATE INDEX IF NOT EXISTS idx_messages_role_created 
ON emailreply.messages(role, created_at DESC);

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
    p_project_id TEXT DEFAULT 'default'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSON;
    v_replies_count INT;
    v_success_rate NUMERIC;
    v_avg_length NUMERIC;
    v_jobs_done INT;
    v_jobs_error INT;
BEGIN
    -- Count assistant messages (generated replies)
    SELECT COUNT(*)
    INTO v_replies_count
    FROM emailreply.messages
    WHERE role = 'assistant'
    AND (meta->>'projectId' = p_project_id OR p_project_id = 'default');
    
    -- Calculate success rate from jobs
    SELECT 
        COUNT(*) FILTER (WHERE status = 'done'),
        COUNT(*) FILTER (WHERE status = 'error')
    INTO v_jobs_done, v_jobs_error
    FROM emailreply.jobs
    WHERE kind = 'draft_reply';
    
    -- Calculate success rate (avoid division by zero)
    IF (v_jobs_done + v_jobs_error) > 0 THEN
        v_success_rate := ROUND((v_jobs_done::NUMERIC / (v_jobs_done + v_jobs_error)) * 100, 0);
    ELSE
        v_success_rate := 100;
    END IF;
    
    -- Calculate average draft length
    SELECT COALESCE(AVG(LENGTH(content)), 0)
    INTO v_avg_length
    FROM emailreply.messages
    WHERE role = 'assistant';
    
    -- Build result JSON
    v_result := json_build_object(
        'repliesGenerated', v_replies_count,
        'successRate', v_success_rate,
        'avgDraftLength', ROUND(v_avg_length, 0),
        'timeSavedMinutes', v_replies_count * 5, -- Estimate 5 min saved per reply
        'activeProjects', 1 -- TODO: count distinct projects when multi-project support added
    );
    
    RETURN v_result;
END;
$$;

-- Function to get recent drafts
CREATE OR REPLACE FUNCTION public.get_recent_drafts(
    p_project_id TEXT DEFAULT 'default',
    p_limit INT DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    subject TEXT,
    snippet TEXT,
    thread_id TEXT,
    tone TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        COALESCE(m.meta->>'subject', 'No Subject') AS subject,
        LEFT(m.content, 100) AS snippet,
        COALESCE(m.meta->>'threadId', '') AS thread_id,
        COALESCE(m.meta->>'tone', 'friendly') AS tone,
        m.created_at
    FROM emailreply.messages m
    WHERE m.role = 'assistant'
    AND (m.meta->>'projectId' = p_project_id OR p_project_id = 'default')
    ORDER BY m.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Function to get draft by ID
CREATE OR REPLACE FUNCTION public.get_draft_by_id(
    p_draft_id UUID
)
RETURNS TABLE(
    id UUID,
    subject TEXT,
    content TEXT,
    thread_id TEXT,
    tone TEXT,
    length INT,
    bullets BOOLEAN,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        COALESCE(m.meta->>'subject', 'No Subject') AS subject,
        m.content,
        COALESCE(m.meta->>'threadId', '') AS thread_id,
        COALESCE(m.meta->>'tone', 'friendly') AS tone,
        COALESCE((m.meta->>'length')::INT, 70) AS length,
        COALESCE((m.meta->>'bullets')::BOOLEAN, false) AS bullets,
        m.created_at
    FROM emailreply.messages m
    WHERE m.id = p_draft_id
    AND m.role = 'assistant'
    LIMIT 1;
END;
$$;

-- Grant execution rights to service_role and anon (for authenticated users)
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats(TEXT) TO service_role, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_drafts(TEXT, INT) TO service_role, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_draft_by_id(UUID) TO service_role, anon, authenticated;

-- Ensure service_role can read messages table
GRANT USAGE ON SCHEMA emailreply TO service_role;
GRANT SELECT, INSERT, UPDATE ON emailreply.messages TO service_role;
GRANT SELECT ON emailreply.jobs TO service_role;

-- Reload PostgREST configuration
NOTIFY pgrst, 'reload config';

