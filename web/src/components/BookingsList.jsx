export default function BookingsList({ bookings, flights, onCancelBooking, onViewEmail }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="bookings-list">
        <h3>My Bookings</h3>
        <p className="no-results">No bookings yet. Book a flight to get started!</p>
      </div>
    );
  }

  const getFlight = (flightId) => {
    return flights.find((f) => f.id === flightId);
  };

  return (
    <div className="bookings-list">
      <h3>My Bookings ({bookings.length})</h3>
      <div className="bookings-grid">
        {bookings.map((booking) => {
          const flight = getFlight(booking.flightId);
          if (!flight) return null;

          return (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-id">Booking {booking.id}</div>
                <span className={`status status-${booking.status}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-details">
                <div className="detail-row">
                  <span className="detail-label">Passenger:</span>
                  <span>{booking.passengerName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span>{booking.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Flight:</span>
                  <span>{flight.airline} - {flight.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Route:</span>
                  <span>{flight.departure} → {flight.arrival}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Departure:</span>
                  <span>{flight.departureTime}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Price:</span>
                  <span className="price">${flight.price}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Booked:</span>
                  <span>{new Date(booking.bookingDate).toLocaleString()}</span>
                </div>
              </div>
              <div className="booking-actions">
                <button
                  onClick={() => onViewEmail(booking)}
                  className="btn btn-secondary"
                >
                  View Email
                </button>
                {booking.status !== 'cancelled' && (
                  <button
                    onClick={() => onCancelBooking(booking.id)}
                    className="btn btn-danger"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

