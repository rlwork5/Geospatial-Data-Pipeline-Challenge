from sqlalchemy import Column, Integer, String, TIMESTAMP, DECIMAL, JSON, ForeignKey, text
from sqlalchemy.sql import func
from geoalchemy2 import Geography
from .database import Base

class PositionReport(Base):
    __tablename__ = "position_reports"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String(50), nullable=False)
    asset_type = Column(String(20), nullable=False)  # 'VESSEL', 'AIRCRAFT', 'VEHICLE'
    timestamp = Column(TIMESTAMP(timezone=True), nullable=False)
    location = Column(Geography('POINT', srid=4326), nullable=False)
    speed_knots = Column(DECIMAL(6, 2))
    heading = Column(DECIMAL(5, 2))
    metadata_ = Column("metadata", JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    region_type = Column(String(30), nullable=False)
    boundary = Column(Geography('POLYGON', srid=4326), nullable=False)
    properties = Column("properties", JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())

class RegionCrossing(Base):
    __tablename__ = "region_crossings"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String(50), nullable=False)
    region_id = Column(Integer, ForeignKey('regions.id'))
    crossing_type = Column(String(10), nullable=False)  # 'ENTRY', 'EXIT'
    crossing_time = Column(TIMESTAMP(timezone=True), nullable=False)
    position = Column(Geography('POINT', srid=4326), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())