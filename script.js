// ===== Phone menu =====
// Clicking "Menu" opens and closes the navigation on small screens.
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

function setMenu(open) {
    header.classList.toggle("menu-open", open);
    menuButton.setAttribute("aria-expanded", open); // tells screen readers if it's open
}

menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    setMenu(!isOpen);
});

// Close the menu after picking a link
nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        setMenu(false);
    }
});

// Close the menu with the Escape key
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        setMenu(false);
    }
});

// ===== Header shadow =====
// Adds a soft shadow once you scroll down, so the header lifts off the page.
// An invisible marker sits at the very top of the page; when it scrolls out
// of view, the shadow turns on. (Only the shadow changes, never the header's
// size, so the page never jumps.)
const topMarker = document.createElement("div");
topMarker.setAttribute("aria-hidden", "true");
topMarker.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;";
document.body.prepend(topMarker);

new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-scrolled", !entry.isIntersecting);
}).observe(topMarker);

// ===== Larger photo view (Gallery page) =====
// Clicking a photo opens it big in a pop-up. Use the arrows (or the
// left and right arrow keys) to move between photos. Without JavaScript,
// each link still works and simply opens the photo on its own.
const lightbox = document.querySelector(".lightbox");

if (lightbox) {
    const photos = [...document.querySelectorAll(".photo-grid .photo")];
    const bigImage = lightbox.querySelector("img");
    const captionText = lightbox.querySelector(".lightbox-text");
    const counter = lightbox.querySelector(".lightbox-count");
    let current = 0;

    function show(index) {
        current = (index + photos.length) % photos.length;   // wraps around at either end
        const link = photos[current];
        bigImage.src = link.href;
        bigImage.alt = link.querySelector("img").alt;
        captionText.textContent = link.dataset.caption;
        counter.textContent = `${current + 1} of ${photos.length}`;
    }

    photos.forEach((link, index) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();   // stay on the page instead of following the link
            show(index);
            lightbox.showModal();
        });
    });

    lightbox.querySelector(".lightbox-prev").addEventListener("click", () => show(current - 1));
    lightbox.querySelector(".lightbox-next").addEventListener("click", () => show(current + 1));

    lightbox.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") show(current - 1);
        if (event.key === "ArrowRight") show(current + 1);
    });

    // Clicking the dark area around the photo closes it
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            lightbox.close();
        }
    });
}
