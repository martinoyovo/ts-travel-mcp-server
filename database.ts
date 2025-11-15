import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Mock flight database
export interface Flight {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  stops: number;
}

export interface Booking {
  id: string;
  flightId: string;
  passengerName: string;
  email: string;
  bookingDate: string;
  status: "confirmed" | "pending" | "cancelled";
}

// File paths for shared data storage
// Use project root directory to ensure API server and MCP server share the same data
// When running from dist/, go up one level to project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// If we're in dist/, go up to project root, otherwise use current directory
const PROJECT_ROOT = __dirname.endsWith('/dist') || __dirname.endsWith('\\dist') 
  ? dirname(__dirname) 
  : __dirname;
const DATA_DIR = join(PROJECT_ROOT, "data");
const FLIGHTS_FILE = join(DATA_DIR, "flights.json");
const BOOKINGS_FILE = join(DATA_DIR, "bookings.json");

// Ensure data directory exists
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initialize flights file with default data if it doesn't exist
function initializeFlights() {
  ensureDataDir();
  if (!existsSync(FLIGHTS_FILE)) {
    const defaultFlights: Flight[] = [
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
        stops: 0,
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
        stops: 1,
      },
      {
        id: "FL003",
        airline: "AeroConnect",
        departure: "New York (JFK)",
        arrival: "Los Angeles (LAX)",
        departureTime: "2025-11-01 06:30",
        arrivalTime: "2025-11-01 10:00",
        duration: "5h 30m",
        price: 289,
        availableSeats: 3,
        stops: 0,
      },
      {
        id: "FL004",
        airline: "Budget Airways",
        departure: "New York (JFK)",
        arrival: "Los Angeles (LAX)",
        departureTime: "2025-11-01 18:00",
        arrivalTime: "2025-11-02 05:00",
        duration: "11h",
        price: 175,
        availableSeats: 22,
        stops: 2,
      },
      {
        id: "FL005",
        airline: "Premium Air",
        departure: "New York (JFK)",
        arrival: "Los Angeles (LAX)",
        departureTime: "2025-11-01 10:00",
        arrivalTime: "2025-11-01 13:15",
        duration: "5h 15m",
        price: 399,
        availableSeats: 5,
        stops: 0,
      },
    ];
    writeFileSync(FLIGHTS_FILE, JSON.stringify(defaultFlights, null, 2), "utf-8");
  }
}

// Initialize bookings file if it doesn't exist
function initializeBookings() {
  ensureDataDir();
  if (!existsSync(BOOKINGS_FILE)) {
    writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

// Load flights from file
function loadFlights(): Flight[] {
  initializeFlights();
  try {
    const data = readFileSync(FLIGHTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading flights:", error);
    return [];
  }
}

// Save flights to file
function saveFlights(flights: Flight[]) {
  ensureDataDir();
  writeFileSync(FLIGHTS_FILE, JSON.stringify(flights, null, 2), "utf-8");
}

// Load bookings from file
function loadBookings(): Booking[] {
  initializeBookings();
  try {
    const data = readFileSync(BOOKINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading bookings:", error);
    return [];
  }
}

// Save bookings to file
function saveBookings(bookings: Booking[]) {
  ensureDataDir();
  writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8");
}

// Get all flights (for backward compatibility - returns fresh data each time)
export function getMockFlights(): Flight[] {
  return loadFlights();
}

// For backward compatibility with api-server.js
export const mockFlights: Flight[] = (() => {
  try {
    return loadFlights();
  } catch (error) {
    console.error("Error loading flights at initialization:", error);
    return [];
  }
})();

export function findFlightById(flightId: string): Flight | undefined {
  const flights = loadFlights();
  return flights.find((f) => f.id === flightId);
}

export function searchFlights(
  departure: string,
  arrival: string,
  sortBy: "price" | "duration" | "stops" = "price"
): Flight[] {
  const flights = loadFlights();
  let results = flights.filter(
    (f) =>
      f.departure.toLowerCase().includes(departure.toLowerCase()) &&
      f.arrival.toLowerCase().includes(arrival.toLowerCase())
  );

  // Sort results
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

export function getCheapestFlight(
  departure: string,
  arrival: string
): Flight | undefined {
  const flights = searchFlights(departure, arrival);
  return flights.length > 0 ? flights[0] : undefined;
}

export function bookFlight(
  flightId: string,
  passengerName: string,
  email: string
): Booking | null {
  const flights = loadFlights();
  const flight = flights.find((f) => f.id === flightId);

  if (!flight) {
    return null;
  }

  if (flight.availableSeats <= 0) {
    return null;
  }

  // Create booking
  const booking: Booking = {
    id: `BK${Date.now()}`,
    flightId,
    passengerName,
    email,
    bookingDate: new Date().toISOString(),
    status: "confirmed",
  };

  // Update available seats in the flight
  flight.availableSeats--;

  // Save updated flights
  saveFlights(flights);

  // Load existing bookings, add new one, and save
  const bookings = loadBookings();
  bookings.push(booking);
  saveBookings(bookings);

  return booking;
}

export function getBookingById(bookingId: string): Booking | undefined {
  const bookings = loadBookings();
  return bookings.find((b) => b.id === bookingId);
}

export function getAllBookings(): Booking[] {
  return loadBookings();
}

export function cancelBooking(bookingId: string): boolean {
  const bookings = loadBookings();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) {
    return false;
  }

  // Release the seat
  const flights = loadFlights();
  const flight = flights.find((f) => f.id === booking.flightId);
  if (flight) {
    flight.availableSeats++;
    saveFlights(flights);
  }

  // Update booking status
  booking.status = "cancelled";
  saveBookings(bookings);

  return true;
}

export function removeBooking(bookingId: string): boolean {
  const bookings = loadBookings();
  const bookingIndex = bookings.findIndex((b) => b.id === bookingId);
  
  if (bookingIndex === -1) {
    return false;
  }

  // Only allow removal of cancelled bookings
  if (bookings[bookingIndex].status !== "cancelled") {
    return false;
  }

  // Remove the booking from the list
  bookings.splice(bookingIndex, 1);
  saveBookings(bookings);

  return true;
}
