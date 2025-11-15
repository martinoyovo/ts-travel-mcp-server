#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import {
  searchFlights,
  getCheapestFlight,
  bookFlight,
  findFlightById,
  getBookingById,
  getAllBookings,
  cancelBooking,
  removeBooking,
  getMockFlights,
} from './dist/database.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Search flights
app.post('/api/flights/search', (req, res) => {
  try {
    const { departure, arrival, sortBy = 'price' } = req.body;
    const flights = searchFlights(departure, arrival, sortBy);
    res.json({ flights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cheapest flight
app.post('/api/flights/cheapest', (req, res) => {
  try {
    const { departure, arrival } = req.body;
    const flight = getCheapestFlight(departure, arrival);
    if (!flight) {
      return res.status(404).json({ error: 'No flights found' });
    }
    res.json({ flight });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get flight details
app.get('/api/flights/:flightId', (req, res) => {
  try {
    const flight = findFlightById(req.params.flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.json({ flight });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all flights
app.get('/api/flights', (req, res) => {
  try {
    // Load fresh data from file each time
    const flights = getMockFlights();
    res.json({ flights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book flight
app.post('/api/bookings', (req, res) => {
  try {
    const { flightId, passengerName, email } = req.body;
    const booking = bookFlight(flightId, passengerName, email);
    if (!booking) {
      return res.status(400).json({ error: 'Booking failed - flight not found or no seats available' });
    }
    const flight = findFlightById(flightId);
    res.json({ booking, flight });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
  try {
    const bookings = getAllBookings();
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove cancelled booking (completely delete from file)
// MUST come before /api/bookings/:bookingId to avoid route conflict
app.delete('/api/bookings/:bookingId/remove', (req, res) => {
  try {
    const success = removeBooking(req.params.bookingId);
    if (!success) {
      return res.status(404).json({ error: 'Booking not found or not cancelled' });
    }
    res.json({ success: true, message: 'Booking removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get booking by ID
app.get('/api/bookings/:bookingId', (req, res) => {
  try {
    const booking = getBookingById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
app.delete('/api/bookings/:bookingId', (req, res) => {
  try {
    const success = cancelBooking(req.params.bookingId);
    if (!success) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});

