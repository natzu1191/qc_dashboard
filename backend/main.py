from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import qc_controller

app = FastAPI()
origins = [
    "https://qc-dashboard-8fq5.vercel.app",
    "http://localhost:5173"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "QC Dashboard API"}

app.include_router(qc_controller.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
