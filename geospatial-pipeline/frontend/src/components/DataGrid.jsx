import React from 'react';

function DataGrid({ positions, onPositionSelect }) {
  return (
    <div className="data-grid">
      <h2>Recent Positions</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Asset ID</th>
            <th>Type</th>
            <th>Timestamp</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Speed</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(pos => (
            <tr key={pos.id} onClick={() => onPositionSelect(pos)} style={{ cursor: 'pointer' }}>
              <td>{pos.id}</td>
              <td>{pos.asset_id}</td>
              <td>{pos.asset_type}</td>
              <td>{new Date(pos.timestamp).toLocaleString()}</td>
              <td>{pos.latitude}</td>
              <td>{pos.longitude}</td>
              <td>{pos.speed_knots}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataGrid;
