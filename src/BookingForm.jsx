import React, { useState } from 'react';

export default function BookingForm({ flight, onBook, onCancel, loading }) {
  const [formData, setFormData] = useState({
    passengerName: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.passengerName.trim()) {
      newErrors.passengerName = 'Passenger name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onBook(formData);
      setFormData({ passengerName: '', email: '' });
    }
  };

  return (
    <div className="booking-form-container">
      <div className="booking-flight-summary">
        <h3>Flight Summary</h3>
        <div className="summary-item">
          <span>Airline:</span>
          <strong>{flight.airline}</strong>
        </div>
        <div className="summary-item">
          <span>Route:</span>
          <strong>
            {flight.departure} → {flight.arrival}
          </strong>
        </div>
        <div className="summary-item">
          <span>Departure:</span>
          <strong>{flight.departureTime}</strong>
        </div>
        <div className="summary-item">
          <span>Price:</span>
          <strong className="price">${flight.price}</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="passengerName">Passenger Name *</label>
          <input
            id="passengerName"
            type="text"
            name="passengerName"
            placeholder="Full name"
            value={formData.passengerName}
            onChange={handleChange}
            disabled={loading}
            className={errors.passengerName ? 'error' : ''}
          />
          {errors.passengerName && (
            <span className="error-message">{errors.passengerName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            ✖ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
