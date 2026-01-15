import React from 'react';

function FilterPanel({ filters, setFilters, regions }) {
  const handleAssetTypeChange = (assetType) => {
    const newTypes = filters.assetTypes.includes(assetType)
      ? filters.assetTypes.filter(t => t !== assetType)
      : [...filters.assetTypes, assetType];
    setFilters({ ...filters, assetTypes: newTypes });
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
              checked={filters.assetTypes.includes(type)}
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
            value={filters.startTime} 
            onChange={handleChange} 
          />
        </label>
        <label>
          End:
          <input 
            type="datetime-local" 
            name="endTime" 
            value={filters.endTime} 
            onChange={handleChange} 
          />
        </label>
      </div>

      <div>
        <h3>Region</h3>
        <select name="regionId" value={filters.regionId} onChange={handleChange}>
          <option value="">All Regions</option>
          {regions.map(region => (
            <option key={region.id} value={region.id}>{region.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default FilterPanel;