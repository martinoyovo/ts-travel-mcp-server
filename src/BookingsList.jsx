import React from 'react';

export default function BookingsList({ bookings, onCancelBooking, onRemoveBooking }) {
  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎫</div>
        <h3>No Bookings Yet</h3>
        <p>Search for flights and make your first booking!</p>
      </div>
    );
  }

  return (
    <div className="bookings-list">
      <h2>Your Bookings ({bookings.length})</h2>

      {bookings.map((booking) => {
        // Safety check: ensure flight data exists
        if (!booking.flight) {
          console.warn(`Booking ${booking.id} missing flight data`);
          return (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div>
                  <h3>Flight {booking.flightId}</h3>
                  <p className="booking-id">Booking ID: {booking.id}</p>
                </div>
                <div className="status-badge">{booking.status}</div>
              </div>
              <div className="booking-content">
                <p>Flight details loading...</p>
              </div>
            </div>
          );
        }

        return (
          <div key={booking.id} className="booking-card">
            <div className="booking-header">
              <div>
                <h3>{booking.flight.airline}</h3>
                <p className="booking-id">Booking ID: {booking.id}</p>
              </div>
              <div className="status-badge">{booking.status}</div>
            </div>

            <div className="booking-content">
              <div className="booking-details">
                <div className="detail-group">
                  <h4>Passenger</h4>
                  <p>{booking.passengerName}</p>
                  <p className="email">{booking.email}</p>
                </div>

                <div className="detail-group">
                  <h4>Flight Details</h4>
                  <p className="route">
                    {booking.flight.departure} → {booking.flight.arrival}
                  </p>
                  <p>{booking.flight.departureTime}</p>
                </div>

                <div className="detail-group">
                  <h4>Price</h4>
                  <p className="price">${booking.flight.price}</p>
                </div>

              <div className="detail-group">
                <h4>Booked On</h4>
                <p>{new Date(booking.bookingDate).toLocaleString()}</p>
              </div>
            </div>

            <div className="booking-actions">
              {booking.status === 'cancelled' ? (
                <button
                  className="btn btn-remove"
                  onClick={() => onRemoveBooking(booking.id)}
                >
                  Remove
                </button>
              ) : (
                <button
                  className="btn btn-cancel"
                  onClick={() => onCancelBooking(booking.id)}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
