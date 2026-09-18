# Meedo Graphic

One-page portfolio site (`hproject.html`, `style.css`, `style.js`) with a small Express backend that stores portfolio likes and contact messages in SQLite.

## Running locally

```bash
cd server
npm install
npm start          # http://localhost:3000
```

The server also serves the static site, so `http://localhost:3000/` loads `hproject.html`.

Requires Node 24+ (the database uses the built-in `node:sqlite` module, unflagged since Node 23.4 — no native build step).

## Hosting

The site needs a Node host (GitHub Pages can't run the API). Three ready-made paths:

- **Render** — `render.yaml` is a blueprint: point Render at the repo, it builds with `cd server && npm ci --omit=dev`, mounts a 1 GB disk at `/var/data` for the SQLite file, and generates an `ADMIN_TOKEN`.
- **Railway / Heroku-style** — the `Procfile` (`web: node server/server.js`) is enough; set `DATA_DIR` to a mounted volume so the database survives redeploys.
- **Docker** (Fly.io, a VPS, anything) — `docker build -t meedo . && docker run -p 3000:3000 -v meedo-data:/data meedo`.

Without a persistent volume the SQLite file is wiped on every redeploy, so likes and messages reset.

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Port to listen on |
| `DATA_DIR` | `server/data` | Where `meedo.db` is written |
| `ADMIN_TOKEN` | unset | Enables `GET /api/messages`; unset means the route returns 404 |
| `WORK_IDS` | `1,2,3` | Comma-separated ids that accept likes; must match the `data-id` values on the portfolio cards |

## API

| Method | Path | Body / Headers | Response |
| --- | --- | --- | --- |
| GET | `/api/likes` | – | `{ "1": 4, "2": 0 }` |
| POST | `/api/likes/:workId` | `{ "liked": true }` | `{ "workId": "1", "count": 5 }` |
| POST | `/api/contact` | `{ "name", "email", "message" }` | `201 { "id": 1, "status": "received" }` |
| GET | `/api/messages` | `x-admin-token: $ADMIN_TOKEN` | list of stored messages |

Opening `hproject.html` directly from the filesystem still works: the like counts fall back to `localStorage` and the contact form reports a send failure when the API is unreachable.
