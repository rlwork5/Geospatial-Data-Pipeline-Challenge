from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PositionReportCreate(BaseModel):
    asset_id: str
    asset_type: str
    timestamp: datetime
    latitude: float
    longitude: float
    speed_knots: Optional[float] = None
    heading: Optional[float] = None
    metadata: Optional[dict] = None

class RegionCrossingResponse(BaseModel):
    region_id: int
    region_name: str
    crossing_type: str

class PositionReportResponse(BaseModel):
    id: int
    asset_id: str
    timestamp: datetime
    region_crossings: List[RegionCrossingResponse]

class PositionReportQuery(BaseModel):
    id: int
    asset_id: str
    asset_type: str
    timestamp: datetime
    latitude: float
    longitude: float
    speed_knots: Optional[float] = None
    heading: Optional[float] = None

class PositionsResponse(BaseModel):
    count: int
    positions: List[PositionReportQuery]

class TrackResponse(BaseModel):
    asset_id: str
    asset_type: str
    point_count: int
    track: dict  # GeoJSON LineString

class RegionResponse(BaseModel):
    id: int
    name: str
    region_type: str
    boundary: dict  # GeoJSON
    properties: Optional[dict] = None

class CrossingResponse(BaseModel):
    id: int
    asset_id: str
    region_id: int
    crossing_type: str
    crossing_time: datetime
    position: dict  # GeoJSON Point