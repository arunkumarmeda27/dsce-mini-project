from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
import traceback
import os
import asyncio

# ROUTES
from auth_routes import router as auth_router
from user_routes import router as user_router
from group_routes import router as group_router

import time
from collections import defaultdict

# Simple In-Memory Rate Limiting
request_counts = defaultdict(list)
RATE_LIMIT = 120 # Requests allowed per IP
RATE_WINDOW = 60 # In seconds

# SYSTEM INIT
from system_initializer import create_branch_admins


# ===============================
# CREATE UPLOAD FOLDER
# ===============================
UPLOAD_DIR = "uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


# ===============================
# FASTAPI APP
# ===============================
app = FastAPI(
    title="DSCE Mini Project Backend",
    description="Backend API for DSCE Mini Project Management System",
    version="3.0.0"
)


# ===============================
# CORS
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vercel frontend to talk to Render backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# RATE LIMITING (BRUTE FORCE PROTECTION)
# ===============================
class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        forwarded_for = request.headers.get("x-forwarded-for")
        client_ip = forwarded_for.split(",")[0] if forwarded_for else (request.client.host if request.client else "127.0.0.1")
        
        current_time = time.time()
        
        # Keep only timestamps within the window
        request_counts[client_ip] = [t for t in request_counts[client_ip] if current_time - t < RATE_WINDOW]
        
        if len(request_counts[client_ip]) >= RATE_LIMIT:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."}
            )
            
        request_counts[client_ip].append(current_time)
        return await call_next(request)

app.add_middleware(RateLimitMiddleware)

# ===============================
# STATIC FILES (🔥 FIX 404 DOWNLOAD)
# ===============================
app.mount("/files", StaticFiles(directory=UPLOAD_DIR), name="files")


# ===============================
# STARTUP
# ===============================
@app.on_event("startup")
async def startup_event():

    print("\n🚀 Starting DSCE Backend...\n")

    try:
        loop = asyncio.get_running_loop()
        loop.run_in_executor(None, create_branch_admins)
        print("✔ Branch admins initialization started in background")
    except Exception as e:
        print("⚠ Initialization warning:", e)

    print("📁 Upload folder:", os.path.abspath(UPLOAD_DIR))
    print("🌐 API running successfully\n")


# ===============================
# GLOBAL ERROR HANDLER
# ===============================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):

    print("\n❌ SERVER ERROR ❌")
    print("Path:", request.url)
    print("Error:", str(exc))
    traceback.print_exc()
    print("--------------------------\n")

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )


# ===============================
# ROUTERS
# ===============================
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(group_router, prefix="/groups", tags=["Groups"])


# ===============================
# ROOT
# ===============================
@app.get("/")
def root():
    return {"message": "DSCE Backend Running 🚀"}


# ===============================
# HEALTH CHECK
# ===============================
@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "uploads": os.path.abspath(UPLOAD_DIR)
    }