# Personal Background MCP Server

First-class MCP bridge for the personal-background markdown data home. It lets any MCP client (Droid, Claude Desktop, Cursor, etc.) read and write the user's background from any project.

The server supports both Node and Bun. Use the `start` script with Node after building (`npm run build`), or use `start:bun` to run TypeScript directly with Bun (no build step).

## Configuration

Point the server at the repo with the `PERSONAL_BACKGROUND_DIR` environment variable. It falls back to `~/personal-background` if unset.

## Registration (Droid)

**With Node (default):**

```bash
cd /path/to/personal-background/mcp && npm install && npm run build

droid mcp add personal-background \
  --env PERSONAL_BACKGROUND_DIR=/path/to/personal-background \
  -- node /path/to/personal-background/mcp/dist/server.js
```

**With Bun (faster, no build step):**

```bash
cd /path/to/personal-background/mcp && bun install

droid mcp add personal-background \
  --env PERSONAL_BACKGROUND_DIR=/path/to/personal-background \
  -- bun /path/to/personal-background/mcp/src/server.ts
```

Adapt the command to your agent's MCP registration format if you are not using Droid.

## Tools

- `read_profile` — read `profile.md`
- `read_preferences` — read `preferences.md`
- `read_constraints` — read `constraints.md`
- `list_recent` — list recent episodes or notes, newest first
- `search_background` — case-insensitive search across all background markdown
- `add_episode` — add an episode (`YYYY-MM-DD-slug.md`)
- `add_note` — add a note (`YYYY-MM-DD-slug.md`)
- `append_core` — append content to `profile.md`, `preferences.md`, or `constraints.md`

## Running

**Node:**

```bash
cd mcp
npm install
npm run build
npm start
```

**Bun:**

```bash
cd mcp
bun install
bun run start:bun
```

## Development

```bash
cd mcp
npm test          # or: bun run test
npm run typecheck # or: bun run typecheck
```

## Privacy

The server reads and writes local markdown files only and never searches or reads `raw/private/`. No data is sent to external APIs by the server itself. The MCP client may send tool results to its own model; configure accordingly.
