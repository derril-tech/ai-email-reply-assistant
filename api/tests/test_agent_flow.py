from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_agent_flow_with_mocks(monkeypatch):
	# Mock Gmail token + thread text
	monkeypatch.setattr("api.services.gmail.resolve_oauth_token", lambda project_id: "tok_123")
	monkeypatch.setattr("api.services.gmail.fetch_thread_text", lambda thread_id, token: "Sample thread content.")

	# Mock OpenAI adapter to deterministic output
	def mock_draft_reply(thread_text: str, controls: dict):
		return {
			"text": "Mock polite reply.\n\nBest regards,",
			"meta": {"subject": "Mock Subject", "participants": ["a@example.com", "b@example.com"], "token_usage": {"input": 10, "output": 20}},
		}

	monkeypatch.setattr("api.adapters.openai_email_reply.draft_reply", mock_draft_reply)

	# Run agent
	r = client.post(
		"/agent/run",
		json={
			"projectId": "default",
			"input": "please reply kindly",
			"meta": {"threadId": "t123", "tone": "friendly", "length": 120, "bullets": False},
		},
	)
	assert r.status_code == 200
	job_id = r.json()["jobId"]

	# Poll once (synchronous completion in current scaffold)
	jr = client.get(f"/jobs/{job_id}")
	assert jr.status_code == 200
	data = jr.json()
	assert data["status"] == "done"
	result = data["result"]
	assert result["text"].startswith("Mock polite reply")
	assert result["meta"]["subject"] == "Mock Subject"
	assert "participants" in result["meta"]
	assert result["projectId"] == "default"


