from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

Status = Literal["Saved", "Applied", "Interview", "Offer", "Rejected"]
EmploymentType = Literal["Full-time", "Part-time", "Contract", "Internship", "Freelance"]


class ApplicationCreate(BaseModel):
    company: str = Field(min_length=1, max_length=160)
    role: str = Field(min_length=1, max_length=160)
    location: str | None = Field(default=None, max_length=180)
    employment_type: EmploymentType = "Full-time"
    job_url: str | None = Field(default=None, max_length=1000)
    status: Status = "Saved"
    applied_date: date | None = None
    follow_up_date: date | None = None
    salary_range: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=5000)


class ApplicationUpdate(BaseModel):
    company: str | None = Field(default=None, min_length=1, max_length=160)
    role: str | None = Field(default=None, min_length=1, max_length=160)
    location: str | None = Field(default=None, max_length=180)
    employment_type: EmploymentType | None = None
    job_url: str | None = Field(default=None, max_length=1000)
    status: Status | None = None
    applied_date: date | None = None
    follow_up_date: date | None = None
    salary_range: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=5000)


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company: str
    role: str
    location: str | None
    employment_type: str
    job_url: str | None
    status: Status
    applied_date: date | None
    follow_up_date: date | None
    salary_range: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
