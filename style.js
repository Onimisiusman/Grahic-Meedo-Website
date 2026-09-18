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
document.querySelectorAll(".card").forEach(card => {
    const likeBtn = card.querySelector(".like-btn");
    const likeCount = card.querySelector(".like-count");
    const id = card.dataset.id;

    const liked = localStorage.getItem(`liked-${id}`) === "true";
    likeCount.textContent = localStorage.getItem(`likes-${id}`) || "0";
    likeBtn.classList.toggle("liked", liked);
    likeBtn.setAttribute("aria-pressed", String(liked));

    likeBtn.addEventListener("click", () => {
        const nowLiked = !likeBtn.classList.contains("liked");
        const count = Math.max(0, parseInt(likeCount.textContent, 10) + (nowLiked ? 1 : -1));

        likeBtn.classList.toggle("liked", nowLiked);
        likeBtn.setAttribute("aria-pressed", String(nowLiked));
        likeCount.textContent = count;
        localStorage.setItem(`liked-${id}`, String(nowLiked));
        localStorage.setItem(`likes-${id}`, String(count));
    });
});

// ===== Contact form =====
const form = document.getElementById("contactForm");
const status = document.getElementById("successMessage");

form.addEventListener("submit", event => {
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

    status.textContent = `Thank you, ${name}! Your message has been sent successfully.`;
    status.className = "form-status success";
    form.reset();
});
