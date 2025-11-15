export default function FlightList({ flights, onSelectFlight }) {
  if (!flights || flights.length === 0) {
    return (
      <div className="flight-list">
        <p className="no-results">No flights found. Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <div className="flight-list">
      <h3>Found {flights.length} Flight{flights.length !== 1 ? 's' : ''}</h3>
      <div className="flights-grid">
        {flights.map((flight) => (
          <div key={flight.id} className="flight-card">
            <div className="flight-header">
              <div className="airline">{flight.airline}</div>
              <div className="flight-id">Flight {flight.id}</div>
            </div>
            <div className="flight-route">
              <div className="route-item">
                <div className="route-label">Departure</div>
                <div className="route-city">{flight.departure}</div>
                <div className="route-time">{flight.departureTime}</div>
              </div>
              <div className="route-arrow">→</div>
              <div className="route-item">
                <div className="route-label">Arrival</div>
                <div className="route-city">{flight.arrival}</div>
                <div className="route-time">{flight.arrivalTime}</div>
              </div>
            </div>
            <div className="flight-details">
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span>{flight.duration}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Stops:</span>
                <span>{flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Seats:</span>
                <span className={flight.availableSeats < 5 ? 'low-seats' : ''}>
                  {flight.availableSeats} available
                </span>
              </div>
            </div>
            <div className="flight-footer">
              <div className="price">${flight.price}</div>
              <button
                onClick={() => onSelectFlight(flight)}
                className="btn btn-book"
                disabled={flight.availableSeats === 0}
              >
                {flight.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

