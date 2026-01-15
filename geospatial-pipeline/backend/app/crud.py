from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from geoalchemy2.elements import WKTElement
from geoalchemy2.shape import to_shape
from geoalchemy2.functions import ST_Intersects
from . import models, schemas
from typing import Optional
from datetime import datetime
from fastapi import HTTPException

def create_position(db: Session, position: schemas.PositionReportCreate):
    geom = WKTElement(f'POINT({position.longitude} {position.latitude})', srid=4326)
    db_position = models.PositionReport(
        asset_id=position.asset_id,
        asset_type=position.asset_type,
        timestamp=position.timestamp,
        location=geom,
        speed_knots=position.speed_knots,
        heading=position.heading,
        metadata_=position.metadata
    )
    db.add(db_position)
    db.commit()
    db.refresh(db_position)
    # Check for crossings
    crossings = check_crossings(db, db_position)
    # Return response
    response_crossings = []
    for crossing in crossings:
        region = db.query(models.Region).filter(models.Region.id == crossing.region_id).first()
        response_crossings.append(schemas.RegionCrossingResponse(
            region_id=crossing.region_id,
            region_name=region.name,
            crossing_type=crossing.crossing_type
        ))
    return schemas.PositionReportResponse(
        id=db_position.id,
        asset_id=db_position.asset_id,
        timestamp=db_position.timestamp,
        region_crossings=response_crossings
    )

def check_crossings(db: Session, position: models.PositionReport):
    crossings = []
    # Get previous position for this asset
    prev_position = db.query(models.PositionReport).filter(
        and_(
            models.PositionReport.asset_id == position.asset_id,
            models.PositionReport.timestamp < position.timestamp
        )
    ).order_by(models.PositionReport.timestamp.desc()).first()
    if prev_position:
        regions = db.query(models.Region).all()
        for region in regions:
            prev_in = is_point_in_region(prev_position.location, region.boundary)
            curr_in = is_point_in_region(position.location, region.boundary)
            if not prev_in and curr_in:
                crossing = models.RegionCrossing(
                    asset_id=position.asset_id,
                    region_id=region.id,
                    crossing_type='ENTRY',
                    crossing_time=position.timestamp,
                    position=position.location
                )
                db.add(crossing)
                crossings.append(crossing)
            elif prev_in and not curr_in:
                crossing = models.RegionCrossing(
                    asset_id=position.asset_id,
                    region_id=region.id,
                    crossing_type='EXIT',
                    crossing_time=position.timestamp,
                    position=position.location
                )
                db.add(crossing)
                crossings.append(crossing)
        db.commit()
    return crossings

def is_point_in_region(point_geom, region_geom):
    point = to_shape(point_geom)
    region = to_shape(region_geom)
    return region.contains(point)

def get_positions(db: Session, asset_id: Optional[str], asset_type: Optional[str], start_time: Optional[datetime], end_time: Optional[datetime], region_id: Optional[int], bbox: Optional[str], limit: int):
    query = db.query(models.PositionReport)
    if asset_id:
        query = query.filter(models.PositionReport.asset_id == asset_id)
    if asset_type:
        query = query.filter(models.PositionReport.asset_type == asset_type)
    if start_time:
        query = query.filter(models.PositionReport.timestamp >= start_time)
    if end_time:
        query = query.filter(models.PositionReport.timestamp <= end_time)
    if region_id:
        region = db.query(models.Region).filter(models.Region.id == region_id).first()
        if region:
            query = query.filter(func.ST_Contains(region.boundary, models.PositionReport.location))
    if bbox:
        min_lon, min_lat, max_lon, max_lat = map(float, bbox.split(','))
        bbox_geom = WKTElement(f'POLYGON(({min_lon} {min_lat}, {max_lon} {min_lat}, {max_lon} {max_lat}, {min_lon} {max_lat}, {min_lon} {min_lat}))', srid=4326)
        query = query.filter(ST_Intersects(bbox_geom, func.ST_GeomFromWKB(models.PositionReport.location, 4326)))
    positions = query.order_by(models.PositionReport.timestamp.desc()).limit(limit).all()
    response_positions = []
    for p in positions:
        point = to_shape(p.location)
        response_positions.append(schemas.PositionReportQuery(
            id=p.id,
            asset_id=p.asset_id,
            asset_type=p.asset_type,
            timestamp=p.timestamp,
            latitude=point.y,
            longitude=point.x,
            speed_knots=p.speed_knots,
            heading=p.heading
        ))
    return schemas.PositionsResponse(count=len(response_positions), positions=response_positions)

def get_track(db: Session, asset_id: str, start_time: Optional[datetime], end_time: Optional[datetime]):
    query = db.query(models.PositionReport).filter(models.PositionReport.asset_id == asset_id)
    if start_time:
        query = query.filter(models.PositionReport.timestamp >= start_time)
    if end_time:
        query = query.filter(models.PositionReport.timestamp <= end_time)
    positions = query.order_by(models.PositionReport.timestamp).all()
    if not positions:
        raise HTTPException(status_code=404, detail="No positions found")
    asset_type = positions[0].asset_type
    coordinates = []
    for p in positions:
        point = to_shape(p.location)
        coordinates.append([point.x, point.y])
    track = {
        "type": "LineString",
        "coordinates": coordinates
    }
    return schemas.TrackResponse(
        asset_id=asset_id,
        asset_type=asset_type,
        point_count=len(positions),
        track=track
    )

def get_regions(db: Session):
    regions = db.query(models.Region).all()
    response = []
    for r in regions:
        geom = to_shape(r.boundary)
        coords = list(geom.exterior.coords)
        boundary_geojson = {
            "type": "Polygon",
            "coordinates": [coords]
        }
        response.append(schemas.RegionResponse(
            id=r.id,
            name=r.name,
            region_type=r.region_type,
            boundary=boundary_geojson,
            properties=r.properties
        ))
    return response

def get_crossings(db: Session, asset_id: Optional[str], region_id: Optional[int], start_time: Optional[datetime], end_time: Optional[datetime]):
    query = db.query(models.RegionCrossing)
    if asset_id:
        query = query.filter(models.RegionCrossing.asset_id == asset_id)
    if region_id:
        query = query.filter(models.RegionCrossing.region_id == region_id)
    if start_time:
        query = query.filter(models.RegionCrossing.crossing_time >= start_time)
    if end_time:
        query = query.filter(models.RegionCrossing.crossing_time <= end_time)
    crossings = query.order_by(models.RegionCrossing.crossing_time.desc()).all()
    response = []
    for c in crossings:
        point = to_shape(c.position)
        position_geojson = {
            "type": "Point",
            "coordinates": [point.x, point.y]
        }
        response.append(schemas.CrossingResponse(
            id=c.id,
            asset_id=c.asset_id,
            region_id=c.region_id,
            crossing_type=c.crossing_type,
            crossing_time=c.crossing_time,
            position=position_geojson
        ))
    return response