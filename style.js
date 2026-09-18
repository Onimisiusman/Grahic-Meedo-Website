// Mobile navigation
const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const navList = document.getElementById("navList");

menuToggle.addEventListener("click", () => {
    const open = navList.classList.toggle("open");
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
});

navList.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navList.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

// Shadow/border on the header once the page is scrolled
window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
});

// Highlight the nav link of the section currently in view
const sections = document.querySelectorAll("section[id]");
const navLinks = new Map(
    [...navList.querySelectorAll("a")].map(link => [link.getAttribute("href").slice(1), link])
);

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.remove("active"));
        navLinks.get(entry.target.id)?.classList.add("active");
    });
}, { rootMargin: "-45% 0px -50% 0px" });

sections.forEach(section => sectionObserver.observe(section));

// ===== Like Button System =====
// Counts live on the server; localStorage only remembers what this visitor liked
// and keeps the page usable when the API is unreachable (e.g. static hosting).
const cards = [...document.querySelectorAll(".card")];

// Responses can arrive out of order; only the newest request per card may render.
const likeRequests = new Map(cards.map(card => [card.dataset.id, 0]));

function renderLike(card, count) {
    card.querySelector(".like-count").textContent = String(count);
}

// Pull the authoritative count back after a click could not be applied.
async function reconcile(card, version) {
    const id = card.dataset.id;

    try {
        const response = await fetch("/api/likes");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const likes = await response.json();
        if (likeRequests.get(id) !== version) return;

        const count = likes[id] ?? 0;
        renderLike(card, count);
        localStorage.setItem(`likes-${id}`, String(count));
    } catch {
        // Offline or no backend: the local count stands.
    }
}

function setLikedState(card, liked) {
    const likeBtn = card.querySelector(".like-btn");
    likeBtn.classList.toggle("liked", liked);
    likeBtn.setAttribute("aria-pressed", String(liked));
    localStorage.setItem(`liked-${card.dataset.id}`, String(liked));
}

cards.forEach(card => {
    const id = card.dataset.id;
    renderLike(card, localStorage.getItem(`likes-${id}`) || 0);
    setLikedState(card, localStorage.getItem(`liked-${id}`) === "true");

    card.querySelector(".like-btn").addEventListener("click", async () => {
        const liked = !card.querySelector(".like-btn").classList.contains("liked");
        const previous = Number(card.querySelector(".like-count").textContent);
        const optimistic = Math.max(0, previous + (liked ? 1 : -1));
        const version = likeRequests.get(id) + 1;
        likeRequests.set(id, version);

        setLikedState(card, liked);
        renderLike(card, optimistic);
        localStorage.setItem(`likes-${id}`, String(optimistic));

        try {
            const response = await fetch(`/api/likes/${encodeURIComponent(id)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ liked })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const { count } = await response.json();
            if (likeRequests.get(id) !== version) return;

            renderLike(card, count);
            localStorage.setItem(`likes-${id}`, String(count));
        } catch {
            if (likeRequests.get(id) !== version) return;

            // The click never landed: undo it, then ask the server for the truth
            // in case an earlier click of ours did land.
            setLikedState(card, !liked);
            renderLike(card, previous);
            localStorage.setItem(`likes-${id}`, String(previous));
            reconcile(card, version);
        }
    });
});

// Replace the local counts with the shared ones as soon as the API answers,
// unless the visitor already clicked a card while the request was in flight.
const initialLoadVersions = new Map(likeRequests);

fetch("/api/likes")
    .then(response => (response.ok ? response.json() : Promise.reject(new Error("likes unavailable"))))
    .then(likes => {
        cards.forEach(card => {
            const id = card.dataset.id;
            if (likeRequests.get(id) !== initialLoadVersions.get(id)) return;

            const count = likes[id] ?? 0;
            renderLike(card, count);
            localStorage.setItem(`likes-${id}`, String(count));
        });
    })
    .catch(() => {});

// Keep other tabs of this site in sync, so a stale button can't send a
// duplicate delta for a like this device already registered.
window.addEventListener("storage", event => {
    const match = /^(likes|liked)-(.+)$/.exec(event.key ?? "");
    if (!match) return;

    const [, kind, id] = match;
    const card = cards.find(candidate => candidate.dataset.id === id);
    if (!card) return;

    if (kind === "likes") {
        renderLike(card, event.newValue ?? 0);
    } else {
        const likeBtn = card.querySelector(".like-btn");
        likeBtn.classList.toggle("liked", event.newValue === "true");
        likeBtn.setAttribute("aria-pressed", String(event.newValue === "true"));
    }
});

// ===== Contact form =====
const form = document.getElementById("contactForm");
const status = document.getElementById("successMessage");

form.addEventListener("submit", async event => {
    event.preventDefault();

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !email || !message) {
        status.textContent = "Please fill out all fields.";
        status.className = "form-status error";
        return;
    }

    if (!emailIsValid) {
        status.textContent = "Please enter a valid email address.";
        status.className = "form-status error";
        return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    status.textContent = "Sending…";
    status.className = "form-status";

    try {
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message })
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload.error || "Something went wrong. Please try again.");
        }

        status.textContent = `Thank you, ${name}! Your message has been sent successfully.`;
        status.className = "form-status success";
        form.reset();
    } catch (error) {
        status.textContent = error.message;
        status.className = "form-status error";
    } finally {
        submitBtn.disabled = false;
    }
});
