# Geospatial Pipeline

A real-time geospatial tracking and monitoring system that tracks moving assets (vessels, aircraft, vehicles) across defined geographic regions and alerts when assets cross regional boundaries.

## Overview

The Geospatial Pipeline is a full-stack application designed to:
- **Track moving assets** in real-time using GPS coordinates
- **Visualize asset locations** on an interactive map
- **Define geographic regions** (bays, zones, areas of interest)
- **Detect boundary crossings** when assets enter or exit defined regions
- **Filter and analyze** position data across time ranges and asset types

Think of it as a real-time tracking dashboard - imagine tracking ships in a bay, aircraft in airspace, or vehicles in zones. When a tracked asset crosses into or out of a defined region, the system detects it and alerts you.

## Architecture

The application follows a **three-tier architecture**:

```
Frontend (React)
    ↓ HTTP/API
Backend API (FastAPI)
    ↓ SQL Queries
Database (PostgreSQL + PostGIS)
```

### Technology Stack

- **Frontend**: React.js (interactive UI with map visualization)
- **Backend**: FastAPI (Python web framework for REST API)
- **Database**: PostgreSQL with PostGIS extension (geographic data support)
- **Containerization**: Docker Compose (runs everything in containers)

---

## Main Components

### 1. Backend API (`/backend`)

The backend is a FastAPI application that serves as the bridge between the frontend and database.

**Key Files:**

- **`app/main.py`** - The main API server
  - Defines all REST API endpoints
  - Configures CORS (Cross-Origin Resource Sharing) to allow requests from the frontend
  - Handles requests and routes them to business logic

- **`app/models.py`** - Database models (schema definition)
  - `PositionReport`: Stores GPS coordinates of tracked assets with timestamp and metadata
  - `Region`: Defines geographic boundaries (polygons)
  - `RegionCrossing`: Records when an asset enters/exits a region

- **`app/schemas.py`** - Request/response data structures
  - Defines what data the API expects and returns
  - Used for validation and documentation

- **`app/crud.py`** - Business logic (Create, Read, Update, Delete operations)
  - `create_position()`: Saves a new asset position and checks for crossings
  - `get_positions()`: Retrieves positions with optional filtering
  - `get_track()`: Gets the movement history of a specific asset
  - `get_regions()`: Retrieves all defined geographic regions
  - `get_crossings()`: Gets boundary crossing events

- **`app/database.py`** - Database connection setup
  - Establishes connection to PostgreSQL
  - Provides database session for queries

**API Endpoints:**

```
POST   /api/positions              - Create a new position report
GET    /api/positions              - Get all positions (with optional filters)
GET    /api/positions/{asset_id}/track - Get movement history for an asset
GET    /api/regions                - Get all geographic regions
GET    /api/crossings              - Get boundary crossing events
```

### 2. Database (`/database` + `init.sql`)

PostgreSQL database with PostGIS extension for geographic data.

**Tables:**

- **position_reports**
  - Stores GPS coordinates of each tracked asset
  - Includes: asset_id, asset_type (VESSEL/AIRCRAFT/VEHICLE), timestamp, location (lat/lon), speed, heading
  - New positions are added via the API

- **regions**
  - Defines geographic areas of interest
  - Each region has: name, type, boundary polygon (the actual geographic shape)
  - Example: "Chesapeake Bay" with its coordinates

- **region_crossings**
  - Records every time an asset enters or exits a region
  - Includes: asset_id, region_id, crossing_type (ENTRY/EXIT), timestamp, exact position
  - Automatically created when the backend detects a crossing

**Geographic Queries:**

The database uses PostGIS spatial functions to:
- Check if a point (asset location) is inside a polygon (region)
- Calculate distance between coordinates
- Perform boundary crossing detection

### 3. Frontend (`/frontend`)

A React application that provides an interactive user interface for viewing and analyzing geospatial data.

**Key Files:**

- **`src/App.js`** - Main application component
  - Manages application state (filters, positions, regions, crossings)
  - Fetches data from the backend API
  - Coordinates between different UI components
  - Runs filters and triggers data refresh

- **`src/components/MapView.jsx`** - Interactive map visualization
  - Uses Leaflet library to display an interactive map
  - Shows asset markers with different colors by type:
    - Blue = Vessels
    - Red = Aircraft
    - Green = Vehicles
  - Displays region boundaries as polygons on the map
  - Shows asset movement tracks (polylines)
  - Centers map on selected asset

- **`src/components/FilterPanel.jsx`** - Data filtering UI
  - Allows filtering by asset type (Vessel, Aircraft, Vehicle)
  - Filter by time range (start/end date)
  - Filter by specific regions
  - Updates data in real-time as filters change

- **`src/components/DataGrid.jsx`** - Tabular data display
  - Shows position data in table format
  - Displays asset_id, type, coordinates, speed, heading, timestamp
  - Allows selecting a position to highlight on map

- **`src/components/CrossingAlerts.jsx`** - Boundary crossing notifications
  - Shows alerts when assets cross region boundaries
  - Displays: which asset, which region, ENTRY or EXIT, timestamp

- **`src/services/api.js`** - API communication helper
  - Helper functions for making requests to the backend
  - Handles authentication, error handling, etc.

**Data Flow:**

1. User opens the app → `App.js` fetches regions and crossings
2. User sets filters → `FilterPanel.jsx` updates state
3. `App.js` calls API with filters → Backend queries database
4. Backend returns data → Frontend displays on map and table

### 4. Docker Compose (`docker-compose.yml`)

Orchestrates running all services in containers.

**Services:**

- **postgres** - PostgreSQL database container
  - Runs on port 5432
  - Initializes with `init.sql` on startup
  - Stores all the geospatial data

- **backend** - FastAPI application container
  - Runs on port 8000
  - Connects to postgres service
  - Serves API endpoints

- **frontend** - React application container
  - Runs on port 3000
  - Built and served as static files
  - Accessed by users in web browser

---

## How It Works (Data Flow)

### Scenario: Tracking a Ship Entering the Chesapeake Bay

1. **New position arrives** at backend via `POST /api/positions`
   ```
   {
     "asset_id": "VESSEL-7721",
     "asset_type": "VESSEL",
     "latitude": 37.5,
     "longitude": -76.2,
     "timestamp": "2025-01-13T14:30:00Z",
     "speed_knots": 12.5
   }
   ```

2. **Backend processes the position:**
   - Saves position to database
   - Uses PostGIS to check if location is inside any region polygons
   - Detects the ship has entered "Chesapeake Bay"
   - Creates a record in `region_crossings` table (ENTRY event)

3. **Frontend displays the data:**
   - Fetches positions via `GET /api/positions`
   - Shows ship as a blue marker on the map
   - Fetches crossings via `GET /api/crossings`
   - Displays "VESSEL-7721 entered Chesapeake Bay" alert

4. **User interactions:**
   - Can filter to only see vessels
   - Can click the marker to see the track (full movement history)
   - Can select a region to see all crossings for that area

---

## Key Features

### Real-Time Tracking
- Submit position updates for any asset
- Immediate visualization on map

### Boundary Detection
- Automatically detects when assets cross region boundaries
- Records entry and exit events
- Supports complex polygon-shaped regions

### Filtering & Search
- Filter by asset type (Vessel, Aircraft, Vehicle)
- Filter by time range
- Filter by specific regions

### Data Analysis
- View complete movement tracks for individual assets
- Query crossing events with time filters
- Export position history

### Interactive Visualization
- Zoom and pan map
- Click positions to view details
- See region boundaries overlaid on map
- Custom icons for different asset types

---

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Network access to the Codespaces environment

### Starting the System

```bash
# Navigate to project directory
cd geospatial-pipeline

# Start all services
docker-compose up -d

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - Database: localhost:5432
```

### Testing the API

```bash
# Run test script to verify everything works
./test_api.sh
```

This will:
- Create sample position reports
- Trigger boundary crossing detection
- Retrieve and display the data

### Stopping Services

```bash
docker-compose down
```

---

## API Examples

### Add a Position Report
```bash
curl -X POST http://localhost:8000/api/positions \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": "VESSEL-001",
    "asset_type": "VESSEL",
    "latitude": 37.5,
    "longitude": -76.2,
    "timestamp": "2025-01-13T14:30:00Z",
    "speed_knots": 12.5,
    "heading": 45.0
  }'
```

### Get All Positions
```bash
curl http://localhost:8000/api/positions?limit=100
```

### Get Asset Track (Movement History)
```bash
curl http://localhost:8000/api/positions/VESSEL-001/track
```

### Get Boundary Crossings
```bash
curl http://localhost:8000/api/crossings
```

### Get All Regions
```bash
curl http://localhost:8000/api/regions
```

---

## Database Schema

### position_reports Table
- `id` (int) - Primary key
- `asset_id` (text) - Identifier for the asset
- `asset_type` (text) - VESSEL, AIRCRAFT, or VEHICLE
- `timestamp` (datetime) - When the position was recorded
- `location` (geography) - Latitude/Longitude point
- `speed_knots` (decimal) - Current speed
- `heading` (decimal) - Direction of movement (0-360 degrees)
- `metadata` (JSON) - Additional data (vessel name, airline, etc.)

### regions Table
- `id` (int) - Primary key
- `name` (text) - Region name
- `region_type` (text) - BAY, ZONE, AIRSPACE, etc.
- `boundary` (geography) - Polygon defining the region boundary
- `properties` (JSON) - Additional properties

### region_crossings Table
- `id` (int) - Primary key
- `asset_id` (text) - Which asset crossed
- `region_id` (int) - Which region was crossed
- `crossing_type` (text) - ENTRY or EXIT
- `crossing_time` (datetime) - When the crossing occurred
- `position` (geography) - Exact location of crossing

---

## Troubleshooting

### CORS Errors in GitHub Codespaces
If you see CORS blocking errors, the ports need to be made public:
1. In the Ports panel, right-click each port (3000, 8000, 5432)
2. Select "Change Port Visibility" → "Public"

### Database Connection Errors
- Ensure postgres service is running: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`

### API Not Responding
- Check backend logs: `docker-compose logs backend`
- Ensure port 8000 is not in use
- Try accessing http://localhost:8000/docs for API documentation

### Map Not Loading
- Ensure frontend service is running: `docker-compose logs frontend`
- Check browser console for errors
- Verify backend API is accessible from frontend

---

## Project Structure Summary

```
geospatial-pipeline/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── main.py         # API endpoints
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Data validation
│   │   ├── crud.py         # Business logic
│   │   └── database.py     # DB connection
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Container config
│
├── frontend/               # React application
│   ├── src/
│   │   ├── App.js          # Main component
│   │   ├── components/     # UI components
│   │   │   ├── MapView.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── DataGrid.jsx
│   │   │   └── CrossingAlerts.jsx
│   │   └── services/       # API helpers
│   ├── package.json        # JS dependencies
│   ├── public/index.html   # HTML template
│   └── Dockerfile          # Container config
│
├── database/
│   └── init.sql            # Database initialization
│
├── docker-compose.yml      # Service orchestration
├── init.sql                # Initial data
└── test_api.sh            # Test script
```

---

## Use Cases

1. **Maritime Monitoring**: Track vessels and detect when they enter/exit port areas or restricted zones
2. **Air Traffic Control**: Monitor aircraft and alert when they cross airspace boundaries
3. **Fleet Management**: Track company vehicles and monitor zone compliance
4. **Border Surveillance**: Detect crossings at geopolitical boundaries
5. **Geofencing**: Trigger actions when assets enter/exit specific areas
