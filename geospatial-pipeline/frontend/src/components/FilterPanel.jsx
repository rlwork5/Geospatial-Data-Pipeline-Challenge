import React, { useState, useEffect } from 'react';

function FilterPanel({ filters, setFilters, regions }) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleAssetTypeChange = (assetType) => {
    const newTypes = localFilters.assetTypes.includes(assetType)
      ? localFilters.assetTypes.filter(t => t !== assetType)
      : [...localFilters.assetTypes, assetType];
    setLocalFilters({ ...localFilters, assetTypes: newTypes });
  };

  const handleChange = (e) => {
    setLocalFilters({ ...localFilters, [e.target.name]: e.target.value });
  };

  const handleApply = () => {
    setFilters(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      assetTypes: [],
      startTime: '',
      endTime: '',
      regionId: ''
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
  };

  return (
    <div className="filter-panel">
      <h2>Filters</h2>
      
      <div>
        <h3>Asset Types</h3>
        {['VESSEL', 'AIRCRAFT', 'VEHICLE'].map(type => (
          <label key={type}>
            <input
              type="checkbox"
              checked={localFilters.assetTypes.includes(type)}
              onChange={() => handleAssetTypeChange(type)}
            />
            {type}
          </label>
        ))}
      </div>

      <div>
        <h3>Time Range</h3>
        <label>
          Start:
          <input 
            type="datetime-local" 
            name="startTime" 
            value={localFilters.startTime} 
            onChange={handleChange} 
          />
        </label>
        <label>
          End:
          <input 
            type="datetime-local" 
            name="endTime" 
            value={localFilters.endTime} 
            onChange={handleChange} 
          />
        </label>
      </div>

      <div>
        <h3>Region</h3>
        <select name="regionId" value={localFilters.regionId} onChange={handleChange}>
          <option value="">All Regions</option>
          {regions.map(region => (
            <option key={region.id} value={region.id}>{region.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button className="apply-btn" onClick={handleApply}>Apply Filters</button>
        <button className="clear-btn" onClick={handleClear}>Clear Filters</button>
      </div>
    </div>
  );
}

export default FilterPanel;