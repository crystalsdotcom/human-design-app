"""Pydantic models for API request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional


class ChartRequest(BaseModel):
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(..., ge=0, le=59)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone_offset: float = Field(default=0.0, ge=-14, le=14)
    name: Optional[str] = None


class PlanetData(BaseModel):
    planet: str
    longitude: float
    gate: int
    line: int
    color: int
    tone: int
    base: int
    retrograde: bool


class ChartResponse(BaseModel):
    name: Optional[str]
    type_: str
    authority: str
    profile: list[int]
    definition: str
    defined_centers: list[str]
    undefined_centers: list[str]
    defined_channels: list[str]
    defined_gates: list[int]
    personality: dict[str, PlanetData]
    design: dict[str, PlanetData]
    birth_date: str
    design_date: str


class InterpretRequest(BaseModel):
    chart: ChartResponse
    question: Optional[str] = None
    depth: str = Field(default="standard", pattern="^(quick|standard|deep)$")


class SimulationRequest(BaseModel):
    chart: ChartResponse
    decision: str = Field(..., min_length=3, max_length=2000)
