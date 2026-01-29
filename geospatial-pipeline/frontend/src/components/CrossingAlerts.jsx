import React from 'react';

function CrossingAlerts({ crossings }) {
  return (
    <div className="crossing-alerts">
      <h2>Recent Boundary Crossings</h2>
      {crossings && crossings.length > 0 ? (
        <ul>
          {crossings.map(crossing => (
            <li key={crossing.id} className={`crossing-${crossing.crossing_type.toLowerCase()}`}>
              <strong>{crossing.asset_id}</strong> {crossing.crossing_type} region {crossing.region_id} at {new Date(crossing.crossing_time).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No boundary crossings detected yet.</p>
      )}
    </div>
  );
}

export default CrossingAlerts;
