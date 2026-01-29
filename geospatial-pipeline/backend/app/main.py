from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from . import crud, models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/positions", response_model=schemas.PositionReportResponse, status_code=201)
def create_position(position: schemas.PositionReportCreate, db: Session = Depends(get_db)):
    return crud.create_position(db, position)

@app.get("/api/positions", response_model=schemas.PositionsResponse)
def get_positions(
    asset_id: Optional[str] = None,
    asset_type: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    region_id: Optional[int] = None,
    bbox: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_positions(db, asset_id, asset_type, start_time, end_time, region_id, bbox, limit)

@app.get("/api/positions/{asset_id}/track", response_model=schemas.TrackResponse)
def get_track(
    asset_id: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    return crud.get_track(db, asset_id, start_time, end_time)

@app.get("/api/regions", response_model=List[schemas.RegionResponse])
def get_regions(db: Session = Depends(get_db)):
    return crud.get_regions(db)

@app.get("/api/crossings", response_model=List[schemas.CrossingResponse])
def get_crossings(
    asset_id: Optional[str] = None,
    region_id: Optional[int] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    return crud.get_crossings(db, asset_id, region_id, start_time, end_time)