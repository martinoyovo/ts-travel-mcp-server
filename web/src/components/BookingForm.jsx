import { useState } from 'react';

export default function BookingForm({ flight, onBook, onCancel }) {
  const [passengerName, setPassengerName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passengerName && email) {
      onBook(flight.id, passengerName, email);
      setPassengerName('');
      setEmail('');
    }
  };

  if (!flight) {
    return null;
  }

  return (
    <div className="booking-form">
      <h3>Book Flight</h3>
      <div className="selected-flight">
        <div className="flight-summary">
          <strong>{flight.airline}</strong> - Flight {flight.id}
          <br />
          {flight.departure} → {flight.arrival}
          <br />
          <span className="price">${flight.price}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="passengerName">Passenger Name</label>
          <input
            type="text"
            id="passengerName"
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            placeholder="Full name"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>
        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            Confirm Booking
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

