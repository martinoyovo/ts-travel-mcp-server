# Travel MCP Server (TS)

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tools and Technologies](#tools-and-technologies)
3. [Project Structure](#project-structure)
4. [Creating MCP Tools](#creating-mcp-tools)
5. [API Functions and Business Logic](#api-functions-and-business-logic)
6. [Linking Functions Together](#linking-functions-together)
7. [MCP with Stdio Implementation](#mcp-with-stdio-implementation)
8. [Integrating with AI Clients](#integrating-with-ai-clients)

## Project Overview

**Travel MCP Server** is a Model Context Protocol (MCP) server that provides flight search and booking capabilities to AI assistants like Claude, Gemini, and Codex. It enables AI clients to search for flights, book tickets, manage bookings, and send confirmation emails through a standardized protocol.

### What is MCP?
Model Context Protocol (MCP) is a standardized way for AI assistants to interact with external tools and data sources. It allows AI models to:
- Access real-time data
- Perform actions on behalf of users
- Integrate with external systems
- Maintain conversation context

### Key Features
- 🔍 **Flight Search**: Search flights between cities with sorting options
- 💰 **Cheapest Flight Finder**: Get the best deals automatically
- ✈️ **Flight Booking**: Book flights with passenger information
- 📋 **Booking Management**: View, manage, and cancel bookings
- 📧 **Email Confirmations**: Send booking confirmation emails
- 🔄 **State Management**: Maintains booking state across sessions

## Tools and Technologies

### Core Technologies

1. **TypeScript** (`^5.3.0`)
   - Type-safe development
   - Better code maintainability
   - Compiles to JavaScript

2. **Node.js**
   - Runtime environment
   - Enables stdio communication
   - Process management

3. **MCP SDK** (`@modelcontextprotocol/sdk ^0.7.0`)
   - Official MCP SDK for TypeScript
   - Provides Server, Transport, and Schema types
   - Handles protocol communication

4. **React & Vite** (for Web UI)
   - Modern web interface
   - Hot module replacement
   - Component-based architecture

### Development Tools

- **tsx** (`^4.20.6`): TypeScript execution for development
- **TypeScript Compiler**: Builds production-ready JavaScript
- **Vite** (`^7.1.12`): Fast build tool and dev server

## Project Structure

```
travel-mcp-server/
├── index.ts              # Main MCP server (tool definitions & handlers)
├── database.ts           # Business logic & data management
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
│
├── src/                  # Web UI (React application)
│   ├── App.jsx           # Main React component
│   ├── FlightSearch.jsx  # Search interface
│   ├── FlightList.jsx    # Flight display
│   ├── BookingForm.jsx   # Booking form
│   └── ...
│
├── dist/                 # Compiled JavaScript (generated)
│   ├── index.js          # Compiled MCP server
│   └── database.js       # Compiled database functions
│
└── doc/                  # Documentation
    ├── CLAUDE_CONFIG.md  # Claude integration guide
    ├── GEMINI_CONFIG.md  # Gemini integration guide
    └── ...
```

## Creating MCP Tools

### Where to Find Tools

**Location**: `index.ts` (lines 38-164)

All MCP tools are defined in the `tools` array in `index.ts`. Each tool follows this structure:

```typescript
const tools: Tool[] = [
  {
    name: "tool_name",           // Unique identifier
    description: "What it does", // AI sees this description
    inputSchema: {                 // JSON Schema for validation
      type: "object" as const,
      properties: {
        // Input parameters
      },
      required: ["param1", "param2"]
    }
  },
  // ... more tools
];
```

### The 8 Tools We Created

1. **`search_flights`** (lines 40-63)
   - Searches flights between cities
   - Parameters: `departure`, `arrival`, `sortBy` (optional)

2. **`get_cheapest_flight`** (lines 65-82)
   - Finds cheapest flight for a route
   - Parameters: `departure`, `arrival`

3. **`book_flight`** (lines 84-105)
   - Books a flight ticket
   - Parameters: `flightId`, `passengerName`, `email`

4. **`get_flight_details`** (lines 107-119)
   - Gets detailed flight information
   - Parameters: `flightId`

5. **`get_booking_details`** (lines 121-133)
   - Retrieves booking information
   - Parameters: `bookingId`

6. **`list_all_bookings`** (lines 135-142)
   - Lists all bookings
   - No parameters required

7. **`cancel_booking`** (lines 144-156)
   - Cancels a booking
   - Parameters: `bookingId`

8. **`send_confirmation_email`** (lines 158-170)
   - Sends confirmation email
   - Parameters: `bookingId`

### Tool Handler Implementation

**Location**: `index.ts` (lines 174-543)

Each tool has a corresponding handler in the `server.setRequestHandler` function:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case "search_flights": {
      // Handler logic here
      return { content: [{ type: "text", text: result }] };
    }
    // ... other cases
  }
});

## API Functions and Business Logic

### Where to Find Functions

**Location**: `database.ts`

This file contains all the business logic functions that the MCP tools call.

### Core Functions

#### 1. Flight Search Functions

```typescript
// database.ts lines 99-119
export function searchFlights(
  departure: string,
  arrival: string,
  sortBy: "price" | "duration" | "stops" = "price"
): Flight[]
```

**What it does:**
- Filters flights by departure/arrival cities
- Sorts results by price, duration, or stops
- Returns matching flights

**Used by**: `search_flights` tool

```typescript
// database.ts lines 121-127
export function getCheapestFlight(
  departure: string,
  arrival: string
): Flight | undefined
```

**What it does:**
- Finds the cheapest flight for a route
- Returns the first flight (cheapest) or undefined

**Used by**: `get_cheapest_flight` tool

#### 2. Flight Management

```typescript
// database.ts lines 86-97
export function findFlightById(flightId: string): Flight | undefined
```

**What it does:**
- Searches the mock flights database
- Returns flight by ID or undefined

**Used by**: `get_flight_details`, `book_flight` tools

#### 3. Booking Functions

```typescript
// database.ts lines 129-161
export function bookFlight(
  flightId: string,
  passengerName: string,
  email: string
): Booking | null
```

**What it does:**
- Validates flight exists and has available seats
- Creates a new booking record
- Decrements available seats count
- Stores booking in database
- Returns booking object or null if failed

**Used by**: `book_flight` tool

**State Management**: This function **modifies** the flight's `availableSeats` property, demonstrating state persistence.

```typescript
// database.ts lines 163-165
export function getBookingById(bookingId: string): Booking | undefined
```

**What it does:**
- Finds booking by ID in the bookings database

**Used by**: `get_booking_details`, `send_confirmation_email` tools

```typescript
// database.ts lines 167-169
export function getAllBookings(): Booking[]
```

**What it does:**
- Returns all bookings from the database

**Used by**: `list_all_bookings` tool

```typescript
// database.ts lines 171-185
export function cancelBooking(bookingId: string): boolean
```

**What it does:**
- Finds the booking
- Releases the seat back (increments `availableSeats`)
- Marks booking as "cancelled"
- Returns true if successful

**Used by**: `cancel_booking` tool

**State Management**: This function **restores** the seat, demonstrating state mutation.

### Data Structures

**Location**: `database.ts` (lines 1-23)

```typescript
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
```

## Linking Functions Together

### The Connection Flow

```
AI Client Request
    ↓
MCP Protocol (index.ts)
    ↓
Tool Handler (switch statement)
    ↓
Business Logic Function (database.ts)
    ↓
Data Operations (mockFlights, bookingsDatabase)
    ↓
Response Formatted
    ↓
Returned to AI Client
```

### Example: Booking a Flight

**Step 1**: AI calls `book_flight` tool
```typescript
// index.ts line 292
case "book_flight": {
  const { flightId, passengerName, email } = args;
  const booking = bookFlight(flightId, passengerName, email);
  // ... formatting and response
}
```

**Step 2**: Handler calls business function
```typescript
// database.ts line 129
export function bookFlight(...) {
  const flight = findFlightById(flightId);  // Links to another function
  // ... validation and booking creation
  flight.availableSeats--;  // Mutates state
  bookingsDatabase.push(booking);  // Stores data
}
```

**Step 3**: Function uses helper functions
```typescript
// database.ts line 86
export function findFlightById(flightId: string) {
  return mockFlights.find(f => f.id === flightId);
}
```

### Function Dependencies Map

```
bookFlight()
  ├── findFlightById()      [Dependency]
  └── Mutates: flight.availableSeats
  └── Stores: bookingsDatabase

cancelBooking()
  ├── getBookingById()        [Dependency]
  ├── findFlightById()       [Dependency]
  └── Mutates: flight.availableSeats

getCheapestFlight()
  └── searchFlights()        [Dependency]
      └── Uses: mockFlights
```

## MCP with Stdio Implementation

### What is Stdio?

**Stdio** (Standard Input/Output) is a communication method where:
- AI client sends requests via **stdin** (standard input)
- Server responds via **stdout** (standard output)
- Errors/logs go to **stderr** (standard error)

This allows direct process-to-process communication without HTTP servers.

### Implementation Steps

#### Step 1: Import Required Modules

**Location**: `index.ts` (lines 3-13)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  Tool, 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from "@modelcontextprotocol/sdk/types.js";
```

**What each import does:**
- `Server`: Main MCP server class
- `StdioServerTransport`: Handles stdin/stdout communication
- `Tool`, `CallToolRequestSchema`, `ListToolsRequestSchema`: Type definitions and schemas

#### Step 2: Create Server Instance

**Location**: `index.ts` (lines 24-35)

```typescript
const server = new Server(
  {
    name: "travel-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},  // Indicates we provide tools
    },
  }
);
```

**Server Configuration:**
- `name`: Server identifier
- `version`: Version string
- `capabilities.tools`: Tells clients we provide MCP tools

#### Step 3: Define Tools Array

**Location**: `index.ts` (lines 38-164)

```typescript
const tools: Tool[] = [
  // ... 8 tool definitions
];
```

This array is what clients see when they call `tools/list`.

#### Step 4: Register Tool Handler

**Location**: `index.ts` (lines 174-543)

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case "search_flights": { /* ... */ }
      case "book_flight": { /* ... */ }
      // ... other cases
    }
  } catch (error) {
    // Error handling
  }
});
```

**What this does:**
- Registers a handler for tool call requests
- `CallToolRequestSchema`: Validates incoming requests
- Switch statement routes to appropriate handler

#### Step 5: Register Tools List Handler

**Location**: `index.ts` (lines 546-548)

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));
```

**What this does:**
- Responds to `tools/list` requests
- Returns the `tools` array so clients know what tools are available

#### Step 6: Create Stdio Transport and Connect

**Location**: `index.ts` (lines 550-557)

```typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Travel MCP Server started successfully!");
}

main().catch(console.error);
```

**What this does:**
1. Creates `StdioServerTransport` instance
   - Handles stdin/stdout communication
   - Processes incoming JSON-RPC messages
   
2. Connects server to transport
   - Server starts listening for requests
   - Ready to receive tool calls via stdin

3. Error logging uses `console.error` (stderr)
   - Doesn't interfere with stdout responses
   - Visible in logs but not in protocol communication

### How Stdio Communication Works

```
┌─────────────┐         stdin          ┌──────────────────┐
│ AI Client   │ ────────────────────> │ MCP Server       │
│ (Claude)    │ <──────────────────── │ (index.js)       │
└─────────────┘         stdout         └──────────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │ database.js │
                                        │ (functions) │
                                        └─────────────┘
```

**Message Flow:**
1. Client sends JSON-RPC request via stdin
2. Server parses request using `CallToolRequestSchema`
3. Server routes to appropriate handler
4. Handler calls `database.ts` functions
5. Server formats response
6. Response sent via stdout
7. Client receives and processes response