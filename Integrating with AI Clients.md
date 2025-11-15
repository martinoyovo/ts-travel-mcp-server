# Integrating with AI Clients

## Integration Overview

To use this MCP server with AI clients, you need to:
1. Build the server (compile TypeScript)
2. Get the absolute path to compiled `index.js`
3. Configure the AI client's config file
4. Restart the AI client

## Claude Desktop Integration

### Step 1: Build the Server

```bash
cd /path/to/travel-mcp-server
npm install
npm run build
```

This creates `dist/index.js` - the compiled server.

### Step 2: Find Configuration File

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

### Step 3: Add Server Configuration

Open the config file and add:

```json
{
  "mcpServers": {
    "travel": {
      "command": "node",
      "args": ["/absolute/path/to/travel-mcp-server/dist/index.js"]
    }
  }
}
```

**Important**: Use absolute path, not relative!

**Example (macOS)**:
```json
{
  "mcpServers": {
    "travel": {
      "command": "node",
      "args": ["/Users/john/projects/travel-mcp-server/dist/index.js"]
    }
  }
}
```

### Step 4: Restart Claude Desktop

Close and reopen Claude Desktop. The server should appear in the tools panel.

### Step 5: Verify Integration

In Claude Desktop, you should see "Travel" or "travel-mcp-server" in the tools/skills section.

### Usage in Claude

Once integrated, you can ask Claude:

```
"Search for flights from New York to Los Angeles"
"What's the cheapest flight?"
"Book flight FL001 for John Doe at john@example.com"
"Show me all my bookings"
"Cancel booking BK1234567890"
```

## Google Gemini Integration

### Step 1: Build the Server

```bash
cd /path/to/travel-mcp-server
npm install
npm run build
```

### Step 2: Find Configuration File

**macOS/Linux**: `~/.config/gemini/config.json` or `~/.gemini/config.json`
**Windows**: `%USERPROFILE%\.config\gemini\config.json`

### Step 3: Add Server Configuration

Create or edit the config file:

```json
{
  "mcp_servers": {
    "travel": {
      "command": "node",
      "args": ["/absolute/path/to/travel-mcp-server/dist/index.js"]
    }
  }
}
```

**Or via environment variable:**
```bash
export GEMINI_MCP_SERVERS='travel:node /path/to/travel-mcp-server/dist/index.js'
```

### Step 4: Initialize Gemini CLI (if needed)

```bash
gemini init
```

### Step 5: Start Session

```bash
gemini
```

### Usage in Gemini

Once connected, interact naturally:

```
> Search for flights from New York to Los Angeles
> Find the cheapest option
> Book flight FL001 for Jane Smith jane@example.com
> Show me my booking confirmation
```

## Testing the Integration

### Manual Testing

1. **Start the server manually** (optional):
   ```bash
   npm start
   # or
   node dist/index.js
   ```

2. **Check server is running**:
   - You should see: "Travel MCP Server started successfully!" in stderr
   - Server waits for stdin input

3. **Test with AI client**:
   - Open Claude Desktop or Gemini CLI
   - Try a simple command: "Search for flights from NYC to LAX"
   - Verify the tool executes and returns results

### Troubleshooting

**Problem**: Server not appearing in tools
- **Solution**: Check file path is absolute and correct
- **Solution**: Ensure `dist/index.js` exists after build
- **Solution**: Restart AI client completely

**Problem**: "Permission denied" errors
- **Solution**: Make sure `node` is in PATH
- **Solution**: Check file permissions on `dist/index.js`

**Problem**: Tools not executing
- **Solution**: Check server logs in stderr
- **Solution**: Verify JSON config syntax is correct
- **Solution**: Ensure all dependencies are installed