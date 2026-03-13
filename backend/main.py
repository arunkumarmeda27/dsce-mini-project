from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback

# Routers
from backend.user_routes import router as user_router
from backend.group_routes import router as group_router
from backend.auth_routes import router as auth_router

# System initialization
from backend.system_initializer import create_branch_admins


# ==================================
# FASTAPI APP
# ==================================

app = FastAPI(
    title="DSCE Mini Project Backend",
    description="Backend API for DSCE Mini Project Management System",
    version="1.0.0"
)


# ==================================
# CORS CONFIGURATION
# ==================================


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================
# STARTUP EVENT
# ==================================

@app.on_event("startup")
async def startup_event():

    print("Starting DSCE Backend...")

    # Create default branch coordinators
    create_branch_admins()

    print("Backend started successfully")


# ==================================
# GLOBAL ERROR HANDLER
# ==================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):

    print("\n------ SERVER ERROR ------")
    print("Error:", str(exc))
    traceback.print_exc()
    print("--------------------------\n")

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error"
        }
    )


# ==================================
# ROUTERS
# ==================================

app.include_router(user_router)
app.include_router(group_router)
app.include_router(export_router)


# ==================================
# BASIC ROUTES
# ==================================

@app.get("/")
def root():
    return {
        "message": "DSCE Mini Project Backend Running"
    }


@app.get("/health")
def health():
    return {
        "status": "OK"
    }