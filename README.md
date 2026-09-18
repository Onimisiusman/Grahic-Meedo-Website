# Meedo Graphic

One-page portfolio site (`hproject.html`, `style.css`, `style.js`) with a small Express backend that stores portfolio likes and contact messages in SQLite.

## Running locally

```bash
cd server
npm install
npm start          # http://localhost:3000
```

The server also serves the static site, so `http://localhost:3000/` loads `hproject.html`.

Requires Node 22.5+ (the database uses the built-in `node:sqlite` module — no native build step).

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Port to listen on |
| `DATA_DIR` | `server/data` | Where `meedo.db` is written |
| `ADMIN_TOKEN` | unset | Enables `GET /api/messages`; unset means the route returns 404 |

## API

| Method | Path | Body / Headers | Response |
| --- | --- | --- | --- |
| GET | `/api/likes` | – | `{ "1": 4, "2": 0 }` |
| POST | `/api/likes/:workId` | `{ "liked": true }` | `{ "workId": "1", "count": 5 }` |
| POST | `/api/contact` | `{ "name", "email", "message" }` | `201 { "id": 1, "status": "received" }` |
| GET | `/api/messages` | `x-admin-token: $ADMIN_TOKEN` | list of stored messages |

Opening `hproject.html` directly from the filesystem still works: the like counts fall back to `localStorage` and the contact form reports a send failure when the API is unreachable.
