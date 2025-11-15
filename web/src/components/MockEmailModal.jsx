export default function MockEmailModal({ booking, flight, onClose }) {
  if (!booking || !flight) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirmation Email</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="email-preview">
          <div className="email-header">
            <div className="email-to">To: {booking.email}</div>
            <div className="email-subject">Subject: Your Flight Booking Confirmation - {booking.id}</div>
          </div>
          <div className="email-body">
            <p>Dear {booking.passengerName},</p>
            <p>Your flight booking has been confirmed!</p>
            <div className="email-details">
              <h4>Booking Details:</h4>
              <ul>
                <li><strong>Booking ID:</strong> {booking.id}</li>
                <li><strong>Airline:</strong> {flight.airline}</li>
                <li><strong>Flight:</strong> {flight.id}</li>
                <li><strong>Route:</strong> {flight.departure} → {flight.arrival}</li>
                <li><strong>Departure:</strong> {flight.departureTime}</li>
                <li><strong>Arrival:</strong> {flight.arrivalTime}</li>
                <li><strong>Duration:</strong> {flight.duration}</li>
                <li><strong>Price:</strong> ${flight.price}</li>
              </ul>
            </div>
            <p>Please arrive at the airport 2 hours before departure.</p>
            <p>Thank you for booking with us!</p>
            <p>Best regards,<br />Travel MCP Server</p>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
}

