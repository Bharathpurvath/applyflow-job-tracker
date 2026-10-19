import os
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import JobApplication
from .schemas import ApplicationCreate, ApplicationOut, ApplicationUpdate, Status


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="ApplyFlow API",
    description="REST API for managing job applications, statuses, and follow-up dates.",
    version="1.0.0",
    lifespan=lifespan,
)

origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/api/health", tags=["System"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "ApplyFlow API"}


@app.get("/api/applications", response_model=list[ApplicationOut], tags=["Applications"])
def list_applications(
    db: Annotated[Session, Depends(get_db)],
    search: Annotated[str | None, Query(max_length=100)] = None,
    status_filter: Annotated[Status | None, Query(alias="status")] = None,
) -> list[JobApplication]:
    statement = select(JobApplication)
    if status_filter:
        statement = statement.where(JobApplication.status == status_filter)
    if search and search.strip():
        pattern = f"%{search.strip().lower()}%"
        statement = statement.where(
            or_(
                JobApplication.company.ilike(pattern),
                JobApplication.role.ilike(pattern),
                JobApplication.location.ilike(pattern),
                JobApplication.notes.ilike(pattern),
            )
        )
    statement = statement.order_by(JobApplication.created_at.desc())
    return list(db.scalars(statement).all())


@app.post(
    "/api/applications",
    response_model=ApplicationOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Applications"],
)
def create_application(
    payload: ApplicationCreate,
    db: Annotated[Session, Depends(get_db)],
) -> JobApplication:
    values = payload.model_dump()
    values["company"] = values["company"].strip()
    values["role"] = values["role"].strip()
    if not values["company"] or not values["role"]:
        raise HTTPException(status_code=422, detail="Company and role are required.")
    application = JobApplication(**values)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@app.get("/api/applications/{application_id}", response_model=ApplicationOut, tags=["Applications"])
def get_application(
    application_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> JobApplication:
    application = db.get(JobApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found.")
    return application


@app.patch("/api/applications/{application_id}", response_model=ApplicationOut, tags=["Applications"])
def update_application(
    application_id: int,
    payload: ApplicationUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> JobApplication:
    application = db.get(JobApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found.")

    changes = payload.model_dump(exclude_unset=True)
    if "company" in changes:
        if changes["company"] is None or not changes["company"].strip():
            raise HTTPException(status_code=422, detail="Company cannot be empty.")
        changes["company"] = changes["company"].strip()
    if "role" in changes:
        if changes["role"] is None or not changes["role"].strip():
            raise HTTPException(status_code=422, detail="Role cannot be empty.")
        changes["role"] = changes["role"].strip()

    for field, value in changes.items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)
    return application


@app.delete("/api/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Applications"])
def delete_application(
    application_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    application = db.get(JobApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found.")
    db.delete(application)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
