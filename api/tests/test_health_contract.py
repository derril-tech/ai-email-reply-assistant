from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_health_endpoint():
	r = client.get("/jobs/health")
	assert r.status_code == 200
	data = r.json()
	assert data.get("status") == "ok"


def test_messages_endpoint_shape():
	r = client.get("/messages", params={"projectId": "default"})
	assert r.status_code == 200
	data = r.json()
	assert "items" in data and isinstance(data["items"], list)


def test_agent_run_requires_meta_thread_id():
	r = client.post("/agent/run", json={"projectId": "default", "input": "", "meta": {}})
	assert r.status_code == 400


def test_agent_run_and_job_status_contract(monkeypatch):
	# Valid run
	r = client.post(
		"/agent/run",
		json={
			"projectId": "default",
			"input": "please confirm meeting",
			"meta": {"threadId": "t1", "tone": "friendly"},
		},
	)
	assert r.status_code == 200
	job_id = r.json().get("jobId")
	assert isinstance(job_id, str) and job_id

	# Poll job
	jr = client.get(f"/jobs/{job_id}")
	assert jr.status_code == 200
	jd = jr.json()
	assert jd.get("status") == "done"
	assert "result" in jd
	res = jd["result"]
	assert "text" in res and isinstance(res["text"], str)
	assert "meta" in res and isinstance(res["meta"], dict)
	assert res.get("projectId") == "default"


