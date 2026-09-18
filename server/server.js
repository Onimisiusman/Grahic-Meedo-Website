import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { addMessage, changeLike, getLikes, listMessages } from "./db.js";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT) || 3000;
const adminToken = process.env.ADMIN_TOKEN;

// Work ids rendered as `data-id` on the portfolio cards in hproject.html.
const WORK_IDS = new Set((process.env.WORK_IDS || "1,2,3").split(",").map(id => id.trim()));

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

const app = express();
app.use(express.json({ limit: "32kb" }));
app.use(express.static(siteRoot, { index: "hproject.html", extensions: ["html"] }));

app.get("/api/likes", (req, res) => {
    res.json(getLikes());
});

app.post("/api/likes/:workId", (req, res) => {
    const workId = req.params.workId.trim();
    const { liked } = req.body ?? {};

    if (typeof liked !== "boolean") {
        return res.status(400).json({ error: "Body must be { liked: boolean }." });
    }

    if (!WORK_IDS.has(workId)) {
        return res.status(404).json({ error: "Unknown work." });
    }

    res.json({ workId, count: changeLike(workId, liked ? 1 : -1) });
});

app.post("/api/contact", (req, res) => {
    const fields = [req.body?.name, req.body?.email, req.body?.message];

    if (fields.some(field => field != null && typeof field !== "string")) {
        return res.status(400).json({ error: "Name, email and message must be strings." });
    }

    const [name, email, message] = fields.map(field => (field ?? "").trim());

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Please fill out all fields." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
        return res.status(400).json({ error: "One of the fields is too long." });
    }

    const id = addMessage({ name, email, message });
    res.status(201).json({ id, status: "received" });
});

// Inbox for the site owner; only enabled when ADMIN_TOKEN is set.
app.get("/api/messages", (req, res) => {
    if (!adminToken) {
        return res.status(404).json({ error: "Not found." });
    }

    if (req.get("x-admin-token") !== adminToken) {
        return res.status(401).json({ error: "Unauthorized." });
    }

    res.json(listMessages());
});

app.listen(port, () => {
    console.log(`Meedo Graphic running on http://localhost:${port}`);
});
