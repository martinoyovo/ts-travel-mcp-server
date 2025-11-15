import React, { useState, useEffect } from 'react';
import './App.css';
import FlightSearch from './FlightSearch';
import FlightList from './FlightList';
import BookingForm from './BookingForm';
import BookingsList from './BookingsList';
import MockEmailModal from './MockEmailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [lastEmail, setLastEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load bookings on component mount and when bookings tab is opened
  useEffect(() => {
    loadBookings();
  }, []); // Load once on mount

  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookings(); // Reload when tab is clicked
    }
  }, [activeTab]);

  const loadBookings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/bookings');
      if (response.ok) {
        const data = await response.json();
        console.log('Bookings loaded from API:', data.bookings?.length || 0);
        
        if (!data.bookings || data.bookings.length === 0) {
          setBookings([]);
          return;
        }

        // Fetch flight details for each booking
        const bookingsWithFlights = await Promise.all(
          data.bookings.map(async (booking) => {
            try {
              const flightResponse = await fetch(`http://localhost:3001/api/flights/${booking.flightId}`);
              if (flightResponse.ok) {
                const flightData = await flightResponse.json();
                return { ...booking, flight: flightData.flight };
              }
              console.warn(`Failed to fetch flight ${booking.flightId} for booking ${booking.id}`);
              return booking;
            } catch (err) {
              console.error(`Error fetching flight for booking ${booking.id}:`, err);
              return booking;
            }
          })
        );
        console.log('Bookings with flights:', bookingsWithFlights.length);
        setBookings(bookingsWithFlights);
      } else {
        console.error('Failed to load bookings: HTTP', response.status);
        setMessage('Failed to load bookings from server');
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setMessage('Failed to connect to server. Make sure API server is running.');
    }
  };

  // Mock data - simulating MCP server responses (kept for reference, not used anymore)
  const mockFlights = [
    {
      id: 'FL001',
      airline: 'SkyWings Airlines',
      departure: 'New York (JFK)',
      arrival: 'Los Angeles (LAX)',
      departureTime: '2025-11-01 08:00',
      arrivalTime: '2025-11-01 11:30',
      duration: '5h 30m',
      price: 245,
      availableSeats: 8,
      stops: 0,
    },
    {
      id: 'FL002',
      airline: 'CloudFlyer',
      departure: 'New York (JFK)',
      arrival: 'Los Angeles (LAX)',
      departureTime: '2025-11-01 14:00',
      arrivalTime: '2025-11-02 02:30',
      duration: '12h 30m',
      price: 189,
      availableSeats: 15,
      stops: 1,
    },
    {
      id: 'FL003',
      airline: 'AeroConnect',
      departure: 'New York (JFK)',
      arrival: 'Los Angeles (LAX)',
      departureTime: '2025-11-01 06:30',
      arrivalTime: '2025-11-01 10:00',
      duration: '5h 30m',
      price: 289,
      availableSeats: 3,
      stops: 0,
    },
    {
      id: 'FL004',
      airline: 'Budget Airways',
      departure: 'New York (JFK)',
      arrival: 'Los Angeles (LAX)',
      departureTime: '2025-11-01 18:00',
      arrivalTime: '2025-11-02 05:00',
      duration: '11h',
      price: 175,
      availableSeats: 22,
      stops: 2,
    },
    {
      id: 'FL005',
      airline: 'Premium Air',
      departure: 'New York (JFK)',
      arrival: 'Los Angeles (LAX)',
      departureTime: '2025-11-01 10:00',
      arrivalTime: '2025-11-01 13:15',
      duration: '5h 15m',
      price: 399,
      availableSeats: 5,
      stops: 0,
    },
  ];

  const handleSearch = async (departure, arrival) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departure, arrival, sortBy: 'price' }),
      });

      const data = await response.json();
      if (response.ok) {
        setFlights(data.flights);
        setMessage(
          data.flights.length === 0
            ? `No flights found for ${departure} to ${arrival}`
            : `Found ${data.flights.length} flights`
        );
      } else {
        setMessage('Error searching flights');
      }
    } catch (error) {
      setMessage('Failed to connect to server. Make sure API server is running.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    setShowBookingForm(true);
  };

  const handleBook = async (booking) => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: selectedFlight.id,
          passengerName: booking.passengerName,
          email: booking.email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const newBooking = {
          ...data.booking,
          flight: data.flight,
        };

        // Update flight availability in local state
        const updatedFlights = flights.map((f) => {
          if (f.id === selectedFlight.id) {
            return { ...f, availableSeats: data.flight.availableSeats };
          }
          return f;
        });

        setFlights(updatedFlights);
        setBookings([...bookings, newBooking]);
        setShowBookingForm(false);
        setLastEmail(newBooking);
        setShowEmailModal(true);
        setMessage(`Booking confirmed! Email sent to ${booking.email}`);
      } else {
        setMessage(data.error || 'Booking failed');
      }
    } catch (error) {
      setMessage('Failed to connect to server. Make sure API server is running.');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        // Refresh flights to get updated seat counts
        if (booking.flightId) {
          const flightResponse = await fetch(`http://localhost:3001/api/flights/${booking.flightId}`);
          if (flightResponse.ok) {
            const flightData = await flightResponse.json();
            const updatedFlights = flights.map((f) => {
              if (f.id === booking.flightId) {
                return { ...f, availableSeats: flightData.flight.availableSeats };
              }
              return f;
            });
            setFlights(updatedFlights);
          }
        }

        // Reload bookings to get updated status
        loadBookings();
        setMessage(`Booking ${bookingId} cancelled. Seat released.`);
      } else {
        setMessage(data.error || 'Cancellation failed');
      }
    } catch (error) {
      setMessage('Failed to connect to server. Make sure API server is running.');
      console.error('Cancel error:', error);
    }
  };

  const handleRemoveBooking = async (bookingId) => {
    console.log('Removing booking:', bookingId);
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/remove`, {
        method: 'DELETE',
      });

      console.log('Remove response status:', response.status);
      
      const data = await response.json();
      console.log('Remove response data:', data);
      
      if (response.ok) {
        // Reload bookings from API to get fresh data
        await loadBookings();
        setMessage(`Booking ${bookingId} removed from list.`);
      } else {
        setMessage(data.error || 'Removal failed');
        console.error('Remove failed:', data);
      }
    } catch (error) {
      setMessage('Failed to connect to server. Make sure API server is running.');
      console.error('Remove error:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Travel MCP Server - Web UI</h1>
          <p>Connected to your local MCP Server</p>
        </div>
      </header>

      <div className="container">
        {message && (
          <div className={`message ${message.includes('confirmed') || message.includes('cancelled') ? 'success' : 'info'}`}>
            {message}
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search Flights
          </button>
          <button
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings ({bookings.length})
          </button>
        </div>

        {activeTab === 'search' ? (
          <div className="tab-content">
            <FlightSearch onSearch={handleSearch} loading={loading} />

            {flights.length > 0 && (
              <div className="results-section">
                <h2>Available Flights</h2>
                <FlightList
                  flights={flights}
                  onSelectFlight={handleSelectFlight}
                />
              </div>
            )}

            {showBookingForm && selectedFlight && (
              <div className="booking-section">
                <h2>Book Flight</h2>
                <BookingForm
                  flight={selectedFlight}
                  onBook={handleBook}
                  onCancel={() => setShowBookingForm(false)}
                  loading={loading}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="tab-content">
            <BookingsList
              bookings={bookings}
              onCancelBooking={handleCancelBooking}
              onRemoveBooking={handleRemoveBooking}
            />
          </div>
        )}
      </div>

      {showEmailModal && lastEmail && (
        <MockEmailModal
          booking={lastEmail}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      <footer className="app-footer">
        <p>
          This web UI connects to your Travel MCP Server. Try it with Claude
          Desktop, or Gemini CLI!
        </p>
      </footer>
    </div>
  );
}
