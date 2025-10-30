// Simple contact form functionality
document.getElementById("contactForm").addEventListener("submit", function(e){
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const success = document.getElementById("successMessage");

    if(name && email && message){
        success.textContent = Thank you, ${name}! Your message has been sent successfully.;
        this.reset();
    } else {
        success.textContent = "Please fill out all fields.";
        success.style.color = "red";
    }
});

// ===== Like Button System =====
document.addEventListener("DOMContentLoaded", () =&gt; {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card =&gt; {
        const likeBtn = card.querySelector(".like-btn");
        const likeCount = card.querySelector(".like-count");
        const id = http://card.dataset.id;

        // Load saved likes from localStorage
        const savedLikes = localStorage.getItem(`likes-${id}`) || 0;
        likeCount.textContent = savedLikes;

        // Load liked state
        if (localStorage.getItem(`liked-${id}`) === "true") {
            likeBtn.classList.add("liked");
        }

        // Click event
        likeBtn.addEventListener("click", () =&gt; {
            let count = parseInt(likeCount.textContent);

            if (likeBtn.classList.contains("liked")) {
                count--;
                likeBtn.classList.remove("liked");
                localStorage.setItem(`liked-${id}`, "false");
            } else {
                count++;
                likeBtn.classList.add("liked");
                localStorage.setItem(`liked-${id}`, "true");
            }

            likeCount.textContent = count;
            localStorage.setItem(`likes-${id}`, count);
        });
    });
});

