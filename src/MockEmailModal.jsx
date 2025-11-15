import React from 'react';

export default function MockEmailModal({ booking, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirmation Email</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content email-preview">
          <div className="email-header">
            <p>
              <strong>To:</strong> {booking.email}
            </p>
            <p>
              <strong>From:</strong> noreply@travelmcp.com
            </p>
            <p>
              <strong>Subject:</strong> Your Flight Booking Confirmation -{' '}
              {booking.id}
            </p>
          </div>

          <div className="email-body">
            <p>Dear {booking.passengerName},</p>

            <p>
              Your flight booking has been confirmed! Here are your booking
              details:
            </p>

            <div className="email-details">
              <div className="detail">
                <strong>Booking ID:</strong>
                <span>{booking.id}</span>
              </div>
              <div className="detail">
                <strong>Airline:</strong>
                <span>{booking.flight.airline}</span>
              </div>
              <div className="detail">
                <strong>Flight:</strong>
                <span>{booking.flight.id}</span>
              </div>
              <div className="detail">
                <strong>Route:</strong>
                <span>
                  {booking.flight.departure} → {booking.flight.arrival}
                </span>
              </div>
              <div className="detail">
                <strong>Departure:</strong>
                <span>{booking.flight.departureTime}</span>
              </div>
              <div className="detail">
                <strong>Arrival:</strong>
                <span>{booking.flight.arrivalTime}</span>
              </div>
              <div className="detail">
                <strong>Duration:</strong>
                <span>{booking.flight.duration}</span>
              </div>
              <div className="detail highlight">
                <strong>Total Price:</strong>
                <span>${booking.flight.price}</span>
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
