import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import DataGrid from './components/DataGrid';
import FilterPanel from './components/FilterPanel';
import CrossingAlerts from './components/CrossingAlerts';
import './App.css';

const API_BASE = '/api';

function App() {
  const [filters, setFilters] = useState({
    assetTypes: [],
    startTime: '',
    endTime: '',
    regionId: ''
  });
  const [positions, setPositions] = useState([]);
  const [regions, setRegions] = useState([]);
  const [crossings, setCrossings] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedAssetTrack, setSelectedAssetTrack] = useState(null);

  useEffect(() => {
    fetchRegions();
    fetchCrossings();
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [filters]);

  const fetchRegions = async () => {
    const res = await fetch(`${API_BASE}/regions`);
    const data = await res.json();
    setRegions(data);
  };

  const fetchPositions = async () => {
    let url = `${API_BASE}/positions?limit=100`;
    if (filters.assetTypes.length > 0) {
      // For simplicity, take first selected type
      url += `&asset_type=${filters.assetTypes[0]}`;
    }
    if (filters.startTime) url += `&start_time=${filters.startTime}`;
    if (filters.endTime) url += `&end_time=${filters.endTime}`;
    if (filters.regionId) url += `&region_id=${filters.regionId}`;

    const res = await fetch(url);
    const data = await res.json();
    setPositions(data.positions);
  };

  const fetchCrossings = async () => {
    const res = await fetch(`${API_BASE}/crossings?limit=10`);
    const data = await res.json();
    setCrossings(data);
  };

  const handleAssetClick = async (assetId) => {
    const res = await fetch(`${API_BASE}/positions/${assetId}/track`);
    const data = await res.json();
    setSelectedAssetTrack(data);
  };

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
  };

  return (
    <div className="App">
      <header>
        <h1>Geospatial Pipeline</h1>
      </header>
      <div className="main-content">
        <FilterPanel filters={filters} setFilters={setFilters} regions={regions} />
        <MapView 
          positions={positions} 
          regions={regions} 
          selectedAssetTrack={selectedAssetTrack}
          selectedPosition={selectedPosition}
          onAssetClick={handleAssetClick}
        />
        <DataGrid positions={positions} onPositionSelect={handlePositionSelect} />
        <CrossingAlerts crossings={crossings} />
      </div>
    </div>
  );
}

export default App;