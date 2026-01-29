const API_BASE = 'http://localhost:8000/api';

export const api = {
  getPositions: async (params) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/positions?${query}`);
    return res.json();
  },
  getTrack: async (assetId, params) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/positions/${assetId}/track?${query}`);
    return res.json();
  },
  getRegions: async () => {
    const res = await fetch(`${API_BASE}/regions`);
    return res.json();
  },
  getCrossings: async (params) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/crossings?${query}`);
    return res.json();
  },
  createPosition: async (data) => {
    const res = await fetch(`${API_BASE}/positions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};