from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, uuid, time, json

from api.adapters import openai_email_reply
from api.services import gmail, persistence

APP_NAME = "emailreply"
PREFIX = os.getenv("REDIS_PREFIX", APP_NAME)

app = FastAPI(title="AI Email Reply Assistant API")

# CORS (Railway domain + local dev)
railway_domain = os.getenv("RAILWAY_PUBLIC_DOMAIN")
web_origin = os.getenv("WEB_RAILWAY_URL")
vercel_url = os.getenv("NEXT_PUBLIC_VERCEL_URL")
app_url = os.getenv("NEXT_PUBLIC_APP_URL")
allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if railway_domain:
    allowed_origins.append(f"https://{railway_domain}")
for origin in (web_origin, vercel_url, app_url):
    if origin:
        allowed_origins.append(origin if origin.startswith("http") else f"https://{origin}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RunBody(BaseModel):
    projectId: str
    input: str  # optional user nudge like "confirm Tuesday 3pm"
    meta: dict | None = None  # { threadId, tone, length, bullets }

# In-memory fallback before wiring Redis/Supabase
JOBS = {}

@app.get("/jobs/health")
def jobs_health():
    return {"status": "ok"}

@app.post("/agent/run")
def run_agent(body: RunBody):
    if not body.meta or "threadId" not in body.meta:
        raise HTTPException(status_code=400, detail="meta.threadId is required")
    job_id = str(uuid.uuid4())
    JOBS[job_id] = {"status": "queued", "result": None, "started_at": time.time()}

    # Resolve Gmail token and fetch thread (stubbed)
    access_token = gmail.resolve_oauth_token(body.projectId)
    thread_text = gmail.fetch_thread_text(body.meta["threadId"], access_token)

    # Generate draft via adapter
    controls = dict(body.meta or {})
    draft = openai_email_reply.draft_reply(thread_text=thread_text, controls=controls)

    result_payload = {
        "text": draft.get("text", ""),
        "meta": {
            "threadId": body.meta["threadId"],
            "tone": body.meta.get("tone", "friendly"),
            "subject": draft.get("meta", {}).get("subject"),
            "participants": draft.get("meta", {}).get("participants"),
            "token_usage": draft.get("meta", {}).get("token_usage"),
        },
        "projectId": body.projectId,
        "input": body.input,
    }

    # Best-effort persistence (stubbed / optional)
    persistence.persist_message_to_supabase(body.projectId, result_payload)
    persistence.write_job_to_redis(job_id, {"status": "done", "result": result_payload})

    JOBS[job_id] = {"status": "done", "result": result_payload, "started_at": time.time()}
    return {"jobId": job_id}

@app.get("/jobs/{job_id}")
def get_job(job_id: str):
    data = JOBS.get(job_id)
    if not data:
        raise HTTPException(status_code=404, detail="Job not found")
    return data

@app.get("/messages")
def get_messages(projectId: str = Query(...)):
    # TODO: fetch from Supabase table emailreply.messages
    return {"items": []}


