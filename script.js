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
function updateShadow() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
}

window.addEventListener("scroll", updateShadow, { passive: true });
updateShadow();

// ===== Larger photo view (Gallery page) =====
// Clicking a photo opens it big in a pop-up. Without JavaScript,
// the link still works and simply opens the photo on its own.
const lightbox = document.querySelector(".lightbox");

if (lightbox) {
    const bigImage = lightbox.querySelector("img");
    const caption = lightbox.querySelector(".lightbox-caption");

    document.querySelectorAll(".photo-grid .photo").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();   // stay on the page instead of following the link
            bigImage.src = link.href;
            bigImage.alt = link.querySelector("img").alt;
            caption.textContent = link.dataset.caption;
            lightbox.showModal();
        });
    });

    // Clicking the dark area around the photo closes it
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            lightbox.close();
        }
    });
}
