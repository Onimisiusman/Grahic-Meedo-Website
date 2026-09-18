import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const serverDir = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || join(serverDir, "data");

mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(join(dataDir, "meedo.db"));

db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
        work_id TEXT PRIMARY KEY,
        count   INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS messages (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        email      TEXT NOT NULL,
        message    TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
`);

export function getLikes() {
    const rows = db.prepare("SELECT work_id, count FROM likes").all();
    return Object.fromEntries(rows.map(row => [row.work_id, row.count]));
}

export function changeLike(workId, delta) {
    db.prepare(
        `INSERT INTO likes (work_id, count) VALUES (?, MAX(0, ?))
         ON CONFLICT(work_id) DO UPDATE SET count = MAX(0, count + ?)`
    ).run(workId, delta, delta);

    return db.prepare("SELECT count FROM likes WHERE work_id = ?").get(workId).count;
}

export function addMessage({ name, email, message }) {
    const { lastInsertRowid } = db
        .prepare("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)")
        .run(name, email, message);

    return Number(lastInsertRowid);
}

export function listMessages() {
    return db.prepare("SELECT * FROM messages ORDER BY id DESC").all();
}
