#!/usr/bin/env node

import {
  Server,
} from "@modelcontextprotocol/sdk/server/index.js";
import {
  StdioServerTransport,
} from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  Tool,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  searchFlights,
  getCheapestFlight,
  bookFlight,
  findFlightById,
  getBookingById,
  getAllBookings,
  cancelBooking,
  removeBooking,
} from "./database.js";

// Create an MCP server instance
const server = new Server(
  {
    name: "travel-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools: Tool[] = [
  {
    name: "search_flights",
    description:
      "Search for available flights between two cities. Returns a list of flights sorted by price by default.",
    inputSchema: {
      type: "object" as const,
      properties: {
        departure: {
          type: "string",
          description: "Departure city (e.g., 'New York', 'JFK')",
        },
        arrival: {
          type: "string",
          description: "Arrival city (e.g., 'Los Angeles', 'LAX')",
        },
        sortBy: {
          type: "string",
          enum: ["price", "duration", "stops"],
          description:
            "Sort results by price (default), duration, or number of stops",
        },
      },
      required: ["departure", "arrival"],
    },
  },
  {
    name: "get_cheapest_flight",
    description:
      "Get the cheapest available flight for a specific route.",
    inputSchema: {
      type: "object" as const,
      properties: {
        departure: {
          type: "string",
          description: "Departure city",
        },
        arrival: {
          type: "string",
          description: "Arrival city",
        },
      },
      required: ["departure", "arrival"],
    },
  },
  {
    name: "book_flight",
    description:
      "Book a flight for a passenger. Returns booking confirmation with booking ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        flightId: {
          type: "string",
          description: "Flight ID to book",
        },
        passengerName: {
          type: "string",
          description: "Full name of the passenger",
        },
        email: {
          type: "string",
          description: "Email address for confirmation",
        },
      },
      required: ["flightId", "passengerName", "email"],
    },
  },
  {
    name: "get_flight_details",
    description: "Get detailed information about a specific flight.",
    inputSchema: {
      type: "object" as const,
      properties: {
        flightId: {
          type: "string",
          description: "Flight ID",
        },
      },
      required: ["flightId"],
    },
  },
  {
    name: "get_booking_details",
    description: "Get details about a specific booking.",
    inputSchema: {
      type: "object" as const,
      properties: {
        bookingId: {
          type: "string",
          description: "Booking ID",
        },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "list_all_bookings",
    description: "List all bookings made in the system.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "cancel_booking",
    description: "Cancel a booking and release the seat.",
    inputSchema: {
      type: "object" as const,
      properties: {
        bookingId: {
          type: "string",
          description: "Booking ID to cancel",
        },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "remove_booking",
    description: "Remove a cancelled booking from the system. This permanently deletes the booking from the list. Only works for bookings that have been cancelled.",
    inputSchema: {
      type: "object" as const,
      properties: {
        bookingId: {
          type: "string",
          description: "Booking ID to remove (must be cancelled)",
        },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "send_confirmation_email",
    description:
      "Send a booking confirmation email to the passenger (mock implementation).",
    inputSchema: {
      type: "object" as const,
      properties: {
        bookingId: {
          type: "string",
          description: "Booking ID",
        },
      },
      required: ["bookingId"],
    },
  },
];

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Log immediately when handler is invoked
  console.error(`[Tool Handler] Called: ${name} with args:`, JSON.stringify(args));

  try {
    switch (name) {
      case "search_flights": {
        // Validate arguments exist
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments: args must be an object');
        }

        const { departure, arrival, sortBy = "price" } = args as {
          departure: string;
          arrival: string;
          sortBy?: string;
        };

        // Validate required fields
        if (!departure || !arrival) {
          throw new Error('Missing required fields: departure and arrival are required');
        }

        console.error(`[search_flights] Parsed: departure="${departure}", arrival="${arrival}", sortBy="${sortBy}"`);

        let flights;
        try {
          flights = searchFlights(
            departure,
            arrival,
            (sortBy as "price" | "duration" | "stops") || "price"
          );
          console.error(`[search_flights] Searching ${departure} → ${arrival}, found ${flights.length} flights`);
        } catch (dbError) {
          console.error(`[search_flights] Database error:`, dbError instanceof Error ? dbError.message : String(dbError));
          throw new Error(`Failed to search flights: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
        }

        if (flights.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No flights found for ${departure} to ${arrival}`,
              },
            ],
          };
        }

        try {
          const formatted = flights
            .map(
              (f) =>
                `Flight ${f.id}: ${f.airline}\n` +
                `  From: ${f.departure} at ${f.departureTime}\n` +
                `  To: ${f.arrival} at ${f.arrivalTime}\n` +
                `  Duration: ${f.duration} (${f.stops} stops)\n` +
                `  Price: $${f.price} | Available seats: ${f.availableSeats}`
            )
            .join("\n\n");

          const response = {
            content: [
              {
                type: "text" as const,
                text: `Found ${flights.length} flights:\n\n${formatted}`,
              },
            ],
          };

          console.error(`[search_flights] Returning response with ${flights.length} flights`);
          return response;
        } catch (formatError) {
          console.error(`[search_flights] Format error:`, formatError instanceof Error ? formatError.message : String(formatError));
          throw new Error(`Failed to format flight results: ${formatError instanceof Error ? formatError.message : String(formatError)}`);
        }
      }

      case "get_cheapest_flight": {
        const { departure, arrival } = args as {
          departure: string;
          arrival: string;
        };

        const flight = getCheapestFlight(departure, arrival);

        if (!flight) {
          return {
            content: [
              {
                type: "text",
                text: `No flights found for ${departure} to ${arrival}`,
              },
            ],
          };
        }

        const formatted =
          `Cheapest flight: ${flight.id}\n` +
          `Airline: ${flight.airline}\n` +
          `From: ${flight.departure} at ${flight.departureTime}\n` +
          `To: ${flight.arrival} at ${flight.arrivalTime}\n` +
          `Duration: ${flight.duration} (${flight.stops} stops)\n` +
          `Price: $${flight.price}\n` +
          `Available seats: ${flight.availableSeats}`;

        return {
          content: [
            {
              type: "text",
              text: formatted,
            },
          ],
        };
      }

      case "get_flight_details": {
        const { flightId } = args as { flightId: string };

        const flight = findFlightById(flightId);

        if (!flight) {
          return {
            content: [
              {
                type: "text",
                text: `Flight ${flightId} not found`,
              },
            ],
          };
        }

        const formatted =
          `Flight ID: ${flight.id}\n` +
          `Airline: ${flight.airline}\n` +
          `Route: ${flight.departure} → ${flight.arrival}\n` +
          `Departure: ${flight.departureTime}\n` +
          `Arrival: ${flight.arrivalTime}\n` +
          `Duration: ${flight.duration}\n` +
          `Stops: ${flight.stops}\n` +
          `Price: $${flight.price}\n` +
          `Available Seats: ${flight.availableSeats}`;

        return {
          content: [
            {
              type: "text",
              text: formatted,
            },
          ],
        };
      }

      case "book_flight": {
        const { flightId, passengerName, email } = args as {
          flightId: string;
          passengerName: string;
          email: string;
        };

        const booking = bookFlight(flightId, passengerName, email);

        if (!booking) {
          const flight = findFlightById(flightId);
          if (!flight) {
            return {
              content: [
                {
                  type: "text",
                  text: `Flight ${flightId} not found`,
                },
              ],
            };
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: `Cannot book flight ${flightId} - no available seats`,
                },
              ],
            };
          }
        }

        const flight = findFlightById(flightId)!;
        const formatted =
          `BOOKING CONFIRMED!\n\n` +
          `Booking ID: ${booking.id}\n` +
          `Passenger: ${booking.passengerName}\n` +
          `Email: ${booking.email}\n` +
          `Flight: ${flight.airline} (${flightId})\n` +
          `Route: ${flight.departure} → ${flight.arrival}\n` +
          `Departure: ${flight.departureTime}\n` +
          `Price: $${flight.price}\n` +
          `Status: ${booking.status}\n\n` +
          `Confirmation email sent to ${booking.email}`;

        return {
          content: [
            {
              type: "text",
              text: formatted,
            },
          ],
        };
      }

      case "get_booking_details": {
        const { bookingId } = args as { bookingId: string };

        const booking = getBookingById(bookingId);

        if (!booking) {
          return {
            content: [
              {
                type: "text",
                text: `Booking ${bookingId} not found`,
              },
            ],
          };
        }

        const flight = findFlightById(booking.flightId)!;
        const formatted =
          `Booking ID: ${booking.id}\n` +
          `Passenger: ${booking.passengerName}\n` +
          `Email: ${booking.email}\n` +
          `Flight ID: ${booking.flightId}\n` +
          `Airline: ${flight.airline}\n` +
          `Route: ${flight.departure} → ${flight.arrival}\n` +
          `Departure: ${flight.departureTime}\n` +
          `Price: $${flight.price}\n` +
          `Booking Date: ${booking.bookingDate}\n` +
          `Status: ${booking.status}`;

        return {
          content: [
            {
              type: "text",
              text: formatted,
            },
          ],
        };
      }

      case "list_all_bookings": {
        const bookings = getAllBookings();

        if (bookings.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No bookings found",
              },
            ],
          };
        }

        const formatted = bookings
          .map((b) => {
            const flight = findFlightById(b.flightId)!;
            return (
              `Booking ${b.id}: ${b.passengerName}\n` +
              `  Flight: ${flight.airline} (${b.flightId})\n` +
              `  Route: ${flight.departure} → ${flight.arrival}\n` +
              `  Status: ${b.status}`
            );
          })
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text: `Total bookings: ${bookings.length}\n\n${formatted}`,
            },
          ],
        };
      }

      case "cancel_booking": {
        const { bookingId } = args as { bookingId: string };

        const success = cancelBooking(bookingId);

        if (!success) {
          return {
            content: [
              {
                type: "text",
                text: `Booking ${bookingId} not found`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Booking ${bookingId} has been cancelled and seat has been released.`,
            },
          ],
        };
      }

      case "remove_booking": {
        const { bookingId } = args as { bookingId: string };

        console.error(`[remove_booking] Attempting to remove booking: ${bookingId}`);

        const success = removeBooking(bookingId);

        if (!success) {
          const booking = getBookingById(bookingId);
          if (!booking) {
            return {
              content: [
                {
                  type: "text",
                  text: `Booking ${bookingId} not found`,
                },
              ],
            };
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: `Cannot remove booking ${bookingId}. Only cancelled bookings can be removed. Current status: ${booking.status}`,
                },
              ],
            };
          }
        }

        console.error(`[remove_booking] Successfully removed booking: ${bookingId}`);

        return {
          content: [
            {
              type: "text",
              text: `Booking ${bookingId} has been permanently removed from the system.`,
            },
          ],
        };
      }

      case "send_confirmation_email": {
        const { bookingId } = args as { bookingId: string };

        const booking = getBookingById(bookingId);

        if (!booking) {
          return {
            content: [
              {
                type: "text",
                text: `Booking ${bookingId} not found`,
              },
            ],
          };
        }

        const flight = findFlightById(booking.flightId)!;

        // Mock email sending
        console.error(
          `[MOCK EMAIL] Sending confirmation to ${booking.email}...`
        );
        console.error(`
========== EMAIL CONFIRMATION ==========
To: ${booking.email}
Subject: Your Flight Booking Confirmation - ${booking.id}

Dear ${booking.passengerName},

Your flight booking has been confirmed!

Booking Details:
- Booking ID: ${booking.id}
- Airline: ${flight.airline}
- Flight: ${flight.id}
- Route: ${flight.departure} → ${flight.arrival}
- Departure: ${flight.departureTime}
- Arrival: ${flight.arrivalTime}
- Price: $${flight.price}

Please arrive at the airport 2 hours before departure.

Thank you for booking with us!

Best regards,
Travel MCP Server
=========================================
        `);

        return {
          content: [
            {
              type: "text",
              text:
                `Confirmation email sent to ${booking.email}\n\n` +
                `Booking ID: ${booking.id}\n` +
                `Passenger: ${booking.passengerName}\n` +
                `Flight: ${flight.airline} ${flight.id}\n` +
                `Route: ${flight.departure} → ${flight.arrival}`,
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
        };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    // Log error details to stderr for debugging
    console.error(`[Tool Error] ${name}:`, error instanceof Error ? error.stack : errorMessage);
    // Return error response (MCP SDK will handle isError flag automatically)
    return {
      content: [
        {
          type: "text" as const,
          text: `Error executing tool "${name}": ${errorMessage}`,
        },
      ],
    };
  }
});

// Expose tools to clients
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Connect via stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Travel MCP Server started successfully!");
}

main().catch(console.error);
