import { useState } from 'react';
import FlightSearch from './components/FlightSearch';
import FlightList from './components/FlightList';
import BookingForm from './components/BookingForm';
import BookingsList from './components/BookingsList';
import MockEmailModal from './components/MockEmailModal';
import {
  searchFlights,
  bookFlight,
  getAllBookings,
  cancelBooking,
  findFlightById,
  mockFlightsData,
} from './data';

function App() {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [bookings, setBookings] = useState(getAllBookings());
  const [showBookings, setShowBookings] = useState(false);
  const [emailModal, setEmailModal] = useState(null);

  const handleSearch = (departure, arrival, sortBy) => {
    const results = searchFlights(departure, arrival, sortBy);
    setFlights(results);
    setSelectedFlight(null);
    setShowBookings(false);
  };

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    setShowBookings(false);
  };

  const handleBook = (flightId, passengerName, email) => {
    const booking = bookFlight(flightId, passengerName, email);
    if (booking) {
      setBookings(getAllBookings());
      setSelectedFlight(null);
      setFlights(flights.map(f => 
        f.id === flightId ? { ...f, availableSeats: f.availableSeats - 1 } : f
      ));
      // Show success message
      alert(`Booking confirmed! Booking ID: ${booking.id}`);
    } else {
      alert('Booking failed. Please check seat availability.');
    }
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const success = cancelBooking(bookingId);
      if (success) {
        setBookings(getAllBookings());
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          const flight = findFlightById(booking.flightId);
          if (flight) {
            setFlights(flights.map(f =>
              f.id === flight.id ? { ...f, availableSeats: f.availableSeats + 1 } : f
            ));
          }
        }
        alert('Booking cancelled successfully.');
      }
    }
  };

  const handleViewEmail = (booking) => {
    const flight = findFlightById(booking.flightId);
    if (flight) {
      setEmailModal({ booking, flight });
    }
  };

  const handleCancelForm = () => {
    setSelectedFlight(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>✈️ Travel MCP Server</h1>
        <p>Flight Booking System</p>
        <div className="header-actions">
          <button
            onClick={() => {
              setShowBookings(!showBookings);
              setSelectedFlight(null);
            }}
            className="btn btn-secondary"
          >
            {showBookings ? 'Search Flights' : `My Bookings (${bookings.length})`}
          </button>
        </div>
      </header>

      <main className="app-main">
        {!showBookings ? (
          <>
            <FlightSearch onSearch={handleSearch} />
            {selectedFlight ? (
              <BookingForm
                flight={selectedFlight}
                onBook={handleBook}
                onCancel={handleCancelForm}
              />
            ) : (
              <FlightList flights={flights} onSelectFlight={handleSelectFlight} />
            )}
          </>
        ) : (
          <BookingsList
            bookings={bookings}
            flights={mockFlightsData}
            onCancelBooking={handleCancelBooking}
            onViewEmail={handleViewEmail}
          />
        )}
      </main>

      {emailModal && (
        <MockEmailModal
          booking={emailModal.booking}
          flight={emailModal.flight}
          onClose={() => setEmailModal(null)}
        />
      )}

      <footer className="app-footer">
        <p>Powered by MCP Protocol • Demo Application</p>
      </footer>
    </div>
  );
}

export default App;

