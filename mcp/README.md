# Personal Background MCP Server

Optional Model Context Protocol (MCP) server that exposes the personal-background markdown repository as tools and resources.

## When to use

Use this when you want a non-Droid MCP client (Claude Desktop, Cursor, etc.) to read or write your personal background files through MCP tools.

## Installation

```bash
cd mcp
npm install
npm run build
```

## Configuration with Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "personal-background": {
      "command": "node",
      "args": ["/path/to/personal-background/mcp/dist/server.js"],
      "env": {
        "PERSONAL_BACKGROUND_DIR": "/path/to/personal-background"
      }
    }
  }
}
```

## Tools

- `read_profile`
- `read_preferences`
- `read_constraints`
- `list_episodes` / `read_episode`
- `list_notes` / `read_note`
- `add_episode` / `add_note`
- `update_core`

## Resources

- `profile://profile`
- `preferences://preferences`
- `constraints://constraints`
- `episode://YYYY-MM-DD-slug.md`
- `note://YYYY-MM-DD-slug.md`

## Privacy

This server reads and writes local markdown files only. No data is sent to external APIs by the server itself. The MCP client (e.g., Claude Desktop) may send tool results to its own model; configure accordingly.
