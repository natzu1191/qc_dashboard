from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import qc_controller, complaint_controller, broadcast_controller
import os
import re

app = FastAPI()
origins = [
    "https://qc-dashboard-8fq5.vercel.app",
    "http://localhost:5173",
]
# Allow any device on the production LAN (e.g. the TV browser) to connect to
# the dev server. Matches http(s)://<host>(:port) for private IP ranges.
lan_origin_regex = re.compile(
    r"^https?://("
    r"localhost|127\.0\.0\.1"
    r"|10\.\d{1,3}\.\d{1,3}\.\d{1,3}"
    r"|192\.168\.\d{1,3}\.\d{1,3}"
    r"|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}"
    r")(:\d+)?$"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=lan_origin_regex.pattern,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files — use /tmp on Vercel (read-only filesystem)
if os.environ.get("VERCEL"):
    UPLOAD_DIR = "/tmp/uploads"
else:
    UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
async def root():
    return {"message": "QC Dashboard API"}

app.include_router(qc_controller.router)
app.include_router(complaint_controller.router)
app.include_router(broadcast_controller.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
