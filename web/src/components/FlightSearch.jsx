import { useState } from 'react';

export default function FlightSearch({ onSearch }) {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [sortBy, setSortBy] = useState('price');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (departure && arrival) {
      onSearch(departure, arrival, sortBy);
    }
  };

  const handleQuickDemo = () => {
    setDeparture('New York');
    setArrival('Los Angeles');
    setSortBy('price');
    onSearch('New York', 'Los Angeles', 'price');
  };

  return (
    <div className="flight-search">
      <h2>Search Flights</h2>
      <form onSubmit={handleSubmit}>
        <div className="search-row">
          <div className="input-group">
            <label htmlFor="departure">Departure City</label>
            <input
              type="text"
              id="departure"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              placeholder="e.g., New York, JFK"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="arrival">Arrival City</label>
            <input
              type="text"
              id="arrival"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              placeholder="e.g., Los Angeles, LAX"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="sortBy">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price">Price</option>
              <option value="duration">Duration</option>
              <option value="stops">Stops</option>
            </select>
          </div>
        </div>
        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            Search Flights
          </button>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="btn btn-secondary"
          >
            Quick Demo: NYC → LAX
          </button>
        </div>
      </form>
    </div>
  );
}

