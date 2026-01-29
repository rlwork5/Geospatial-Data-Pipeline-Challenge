#!/bin/bash

# Redirect all output to test_output.txt
exec > test_output.txt 2>&1

# Clear positions
echo "Clearing positions..."
docker-compose exec -T postgres psql -U pipeline -d pipeline -c "TRUNCATE position_reports CASCADE;"

# Test case 1
echo "Running Test case 1..."
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8000/api/positions \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": "TEST-001",
    "asset_type": "VESSEL",
    "timestamp": "2025-01-13T15:00:00Z",
    "latitude": 38.0,
    "longitude": -76.0,
    "speed_knots": 10.0,
    "heading": 90.0
  }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
echo "Status: $status"
echo "Body: $body"
if [ "$status" -eq 201 ] && echo "$body" | jq -e '.id' > /dev/null; then
  echo "Test case 1 PASSED"
else
  echo "Test case 1 FAILED"
fi
echo ""

# Test case 2
echo "Running Test case 2..."
# First position
curl -s -X POST http://localhost:8000/api/positions \
  -H "Content-Type: application/json" \
  -d '{"asset_id": "CROSSING-TEST", "asset_type": "VESSEL", "timestamp": "2025-01-13T15:00:00Z", "latitude": 36.5, "longitude": -76.1, "speed_knots": 15.0, "heading": 0.0}' > /dev/null

# Second position
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8000/api/positions \
  -H "Content-Type: application/json" \
  -d '{"asset_id": "CROSSING-TEST", "asset_type": "VESSEL", "timestamp": "2025-01-13T15:30:00Z", "latitude": 37.5, "longitude": -76.1, "speed_knots": 15.0, "heading": 0.0}')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
echo "Status: $status"
echo "Body: $body"
if [ "$status" -eq 201 ] && echo "$body" | jq -e '.region_crossings | (length > 0 and .[0].crossing_type == "ENTRY")' > /dev/null; then
  echo "Test case 2 PASSED"
else
  echo "Test case 2 FAILED"
fi
echo ""

# Test case 3
echo "Running Test case 3..."
response=$(curl -s -w "\n%{http_code}" "http://localhost:8000/api/positions?bbox=-77.0,38.5,-76.5,39.0")
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
echo "Status: $status"
echo "Body: $body"
if [ "$status" -eq 200 ]; then
  positions=$(echo "$body" | jq '.positions')
  # Check if all positions are within bbox
  within=true
  echo "$positions" | jq -c '.[]' | while read pos; do
    lat=$(echo "$pos" | jq '.latitude')
    lon=$(echo "$pos" | jq '.longitude')
    if (( $(echo "$lon < -77.0 || $lon > -76.5 || $lat < 38.5 || $lat > 39.0" | bc -l) )); then
      within=false
      break
    fi
  done
  if $within; then
    echo "Test case 3 PASSED"
  else
    echo "Test case 3 FAILED - positions outside bbox"
  fi
else
  echo "Test case 3 FAILED"
fi
echo ""

# Test case 4
echo "Running Test case 4..."
# Add a position for VESSEL-7721
curl -s -X POST http://localhost:8000/api/positions \
  -H "Content-Type: application/json" \
  -d '{"asset_id": "VESSEL-7721", "asset_type": "VESSEL", "timestamp": "2025-01-13T16:00:00Z", "latitude": 39.0, "longitude": -75.0, "speed_knots": 12.0, "heading": 45.0}' > /dev/null

response=$(curl -s -w "\n%{http_code}" "http://localhost:8000/api/positions/VESSEL-7721/track")
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
echo "Status: $status"
echo "Body: $body"
if [ "$status" -eq 200 ] && echo "$body" | jq -e '.track.type == "LineString"' > /dev/null; then
  echo "Test case 4 PASSED"
else
  echo "Test case 4 FAILED"
fi
echo ""