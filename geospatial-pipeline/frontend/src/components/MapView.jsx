import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons for different asset types
const icons = {
  VESSEL: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  AIRCRAFT: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  VEHICLE: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

// Component to center map on selected position
function MapController({ selectedPosition }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPosition) {
      map.setView([selectedPosition.latitude, selectedPosition.longitude], 10);
    }
  }, [selectedPosition, map]);
  return null;
}

function MapView({ positions, regions, selectedAssetTrack, selectedPosition, onAssetClick }) {
  return (
    <div className="map-view">
      <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController selectedPosition={selectedPosition} />
        {regions.map(region => (
          <Polygon 
            key={region.id} 
            positions={region.boundary.coordinates[0].map(coord => [coord[1], coord[0]])} 
            color="blue" 
            fillOpacity={0.1}
          />
        ))}
        {positions.map(pos => (
          <Marker 
            key={pos.id} 
            position={[pos.latitude, pos.longitude]} 
            icon={icons[pos.asset_type] || L.Icon.Default}
            eventHandlers={{
              click: () => onAssetClick(pos.asset_id),
            }}
          >
            <Popup>{pos.asset_id} - {pos.asset_type}</Popup>
          </Marker>
        ))}
        {selectedAssetTrack && (
          <Polyline 
            positions={selectedAssetTrack.track.coordinates.map(coord => [coord[1], coord[0]])} 
            color="red" 
            weight={3}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;