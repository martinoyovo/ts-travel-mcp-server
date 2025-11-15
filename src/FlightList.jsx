import React from 'react';

export default function FlightList({ flights, onSelectFlight }) {
  return (
    <div className="flights-grid">
      {flights.map((flight) => (
        <div key={flight.id} className="flight-card">
          <div className="flight-header">
            <h3>{flight.airline}</h3>
            <span className="flight-id">{flight.id}</span>
          </div>

          <div className="flight-route">
            <div className="city">
              <strong>From</strong>
              <p>{flight.departure}</p>
            </div>
            <div className="arrow">→</div>
            <div className="city">
              <strong>To</strong>
              <p>{flight.arrival}</p>
            </div>
          </div>

          <div className="flight-times">
            <div>
              <span className="label">Depart</span>
              <p>{flight.departureTime}</p>
            </div>
            <div>
              <span className="label">Arrive</span>
              <p>{flight.arrivalTime}</p>
            </div>
          </div>

          <div className="flight-details">
            <div className="detail">
              <span className="label">Duration</span>
              <p>{flight.duration}</p>
            </div>
            <div className="detail">
              <span className="label">Stops</span>
              <p>{flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}</p>
            </div>
            <div className="detail">
              <span className="label">Seats Available</span>
              <p className={flight.availableSeats <= 3 ? 'low-availability' : ''}>
                {flight.availableSeats} seats
              </p>
            </div>
          </div>

          <div className="flight-footer">
            <div className="price">
              <span className="amount">${flight.price}</span>
              <span className="label">per person</span>
            </div>
            <button
              className="btn btn-book"
              onClick={() => onSelectFlight(flight)}
              disabled={flight.availableSeats === 0}
            >
              {flight.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
