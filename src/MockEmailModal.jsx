import React from 'react';

export default function MockEmailModal({ booking, onClose }) {
  if (!booking || !booking.flight) {
    return null;
  }

  const flight = booking.flight || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirmation Email</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content email-preview">
          <div className="email-header">
            <p>
              <strong>To:</strong> {booking.email || 'N/A'}
            </p>
            <p>
              <strong>From:</strong> noreply@travelmcp.com
            </p>
            <p>
              <strong>Subject:</strong> Your Flight Booking Confirmation -{' '}
              {booking.id || 'N/A'}
            </p>
          </div>

          <div className="email-body">
            <p>Dear {booking.passengerName || 'Valued Customer'},</p>

            <p>
              Your flight booking has been confirmed! Here are your booking
              details:
            </p>

            <div className="email-details">
              <div className="detail">
                <strong>Booking ID:</strong>
                <span>{booking.id || 'N/A'}</span>
              </div>
              <div className="detail">
                <strong>Airline:</strong>
                <span>{flight.airline || 'N/A'}</span>
              </div>
              <div className="detail">
                <strong>Flight:</strong>
                <span>{flight.id || 'N/A'}</span>
              </div>
              <div className="detail">
                <strong>Route:</strong>
                <span>
                  {flight.departure || 'N/A'} → {flight.arrival || 'N/A'}
                </span>
              </div>
              <div className="detail">
                <strong>Departure:</strong>
                <span>{flight.departureTime || 'N/A'}</span>
              </div>
              <div className="detail">
                <strong>Arrival:</strong>
                <span>{flight.arrivalTime || 'N/A'}</span>
              </div>
              <div className="detail">
                <strong>Duration:</strong>
                <span>{flight.duration || 'N/A'}</span>
              </div>
              <div className="detail highlight">
                <strong>Total Price:</strong>
                <span>${flight.price || '0'}</span>
              </div>
            </div>

            <p className="important">
              Please arrive at the airport at least 2 hours before your
              scheduled departure.
            </p>

            <p>
              Thank you for booking with us! We look forward to serving you.
            </p>

            <p>
              Best regards,
              <br />
              Travel MCP Server
              <br />
              Your Trusted Travel Partner
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
