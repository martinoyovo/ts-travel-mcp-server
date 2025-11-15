// Flight data utility - loads flights from the backend's flights.json
// For now, we'll use a subset of flights or fetch from a local file

export const mockFlightsData = [
  {
    id: "FL001",
    airline: "SkyWings Airlines",
    departure: "New York (JFK)",
    arrival: "Los Angeles (LAX)",
    departureTime: "2025-11-01 08:00",
    arrivalTime: "2025-11-01 11:30",
    duration: "5h 30m",
    price: 245,
    availableSeats: 8,
    stops: 0
  },
  {
    id: "FL002",
    airline: "CloudFlyer",
    departure: "New York (JFK)",
    arrival: "Los Angeles (LAX)",
    departureTime: "2025-11-01 14:00",
    arrivalTime: "2025-11-02 02:30",
    duration: "12h 30m",
    price: 189,
    availableSeats: 15,
    stops: 1
  },
  {
    id: "FL003",
    airline: "AeroConnect",
    departure: "New York (LGA)",
    arrival: "Los Angeles (LAX)",
    departureTime: "2025-11-01 06:30",
    arrivalTime: "2025-11-01 10:00",
    duration: "5h 30m",
    price: 289,
    availableSeats: 3,
    stops: 0
  },
  {
    id: "FL004",
    airline: "Budget Airways",
    departure: "New York (EWR)",
    arrival: "Los Angeles (LAX)",
    departureTime: "2025-11-01 18:00",
    arrivalTime: "2025-11-02 05:00",
    duration: "11h",
    price: 175,
    availableSeats: 22,
    stops: 2
  },
  {
    id: "FL005",
    airline: "Pacific Express",
    departure: "Los Angeles (LAX)",
    arrival: "New York (JFK)",
    departureTime: "2025-11-02 09:00",
    arrivalTime: "2025-11-02 17:30",
    duration: "5h 30m",
    price: 255,
    availableSeats: 12,
    stops: 0
  },
  {
    id: "FL006",
    airline: "Coast Airlines",
    departure: "San Francisco (SFO)",
    arrival: "Chicago (ORD)",
    departureTime: "2025-11-01 07:00",
    arrivalTime: "2025-11-01 13:15",
    duration: "4h 15m",
    price: 320,
    availableSeats: 5,
    stops: 0
  },
  {
    id: "FL007",
    airline: "Midwest Flyer",
    departure: "Chicago (ORD)",
    arrival: "Miami (MIA)",
    departureTime: "2025-11-01 10:30",
    arrivalTime: "2025-11-01 14:45",
    duration: "2h 15m",
    price: 198,
    availableSeats: 18,
    stops: 0
  },
  {
    id: "FL008",
    airline: "Sunshine Air",
    departure: "Miami (MIA)",
    arrival: "Las Vegas (LAS)",
    departureTime: "2025-11-01 16:00",
    arrivalTime: "2025-11-01 19:30",
    duration: "5h 30m",
    price: 275,
    availableSeats: 9,
    stops: 1
  }
];

// In-memory bookings storage (simulates backend)
export let bookingsDatabase = [];

export function searchFlights(departure, arrival, sortBy = "price") {
  let results = mockFlightsData.filter(
    (f) =>
      f.departure.toLowerCase().includes(departure.toLowerCase()) &&
      f.arrival.toLowerCase().includes(arrival.toLowerCase())
  );

  if (sortBy === "price") {
    results.sort((a, b) => a.price - b.price);
  } else if (sortBy === "duration") {
    results.sort(
      (a, b) =>
        parseInt(a.duration.split("h")[0]) - parseInt(b.duration.split("h")[0])
    );
  } else if (sortBy === "stops") {
    results.sort((a, b) => a.stops - b.stops);
  }

  return results;
}

export function findFlightById(flightId) {
  return mockFlightsData.find((f) => f.id === flightId);
}

export function bookFlight(flightId, passengerName, email) {
  const flight = findFlightById(flightId);

  if (!flight || flight.availableSeats <= 0) {
    return null;
  }

  const booking = {
    id: `BK${Date.now()}`,
    flightId,
    passengerName,
    email,
    bookingDate: new Date().toISOString(),
    status: "confirmed",
  };

  flight.availableSeats--;
  bookingsDatabase.push(booking);

  return booking;
}

export function getBookingById(bookingId) {
  return bookingsDatabase.find((b) => b.id === bookingId);
}

export function getAllBookings() {
  return bookingsDatabase;
}

export function cancelBooking(bookingId) {
  const booking = getBookingById(bookingId);
  if (!booking) {
    return false;
  }

  const flight = findFlightById(booking.flightId);
  if (flight) {
    flight.availableSeats++;
  }

  booking.status = "cancelled";
  return true;
}

