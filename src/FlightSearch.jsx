import React, { useState } from 'react';

export default function FlightSearch({ onSearch, loading }) {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (departure.trim() && arrival.trim()) {
      onSearch(departure, arrival);
    }
  };

  return (
    <div className="search-card">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label htmlFor="departure">From</label>
          <input
            id="departure"
            type="text"
            placeholder="e.g., New York, JFK"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="arrival">To</label>
          <input
            id="arrival"
            type="text"
            placeholder="e.g., Los Angeles, LAX"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search Flights'}
          </button>
        </div>
      </form>
    </div>
  );
}
