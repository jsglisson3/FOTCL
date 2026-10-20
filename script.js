// =========================================================
// Friends of The Colony Public Library
// Small extras that make the site nicer to use. Every page still
// works without JavaScript; these only add to it.
// =========================================================

// ===== Library hours =====
// Used by the "Open now" notes on the home and contact pages.
// 0 is Sunday, 1 is Monday and so on. Times use a 24-hour clock
// (20 means 8 p.m.), and null means closed.
// If the library changes its hours, update them here AND in the
// hours list on contact.html.
const LIBRARY_HOURS = {
    0: [13, 17],   // Sunday, 1 to 5 p.m.
    1: null,       // Monday, closed
    2: [10, 20],   // Tuesday, 10 a.m. to 8 p.m.
    3: [10, 20],   // Wednesday
    4: [10, 20],   // Thursday
    5: [10, 17],   // Friday, 10 a.m. to 5 p.m.
    6: [10, 17],   // Saturday
};
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

// ===== Little pop-up messages =====
// One message area for the whole page. role="status" means screen
// readers read out whatever appears in it.
const toastBox = document.createElement("div");
toastBox.className = "toast";
toastBox.setAttribute("role", "status");
document.body.append(toastBox);
let toastTimer;

function showToast(message) {
    clearTimeout(toastTimer);
    toastBox.textContent = "";   // clearing first means a repeat message is read again
    setTimeout(() => {
        toastBox.textContent = message;
        toastBox.classList.add("show");
        toastTimer = setTimeout(() => toastBox.classList.remove("show"), 2600);
    }, 60);
}

// ===== Copy buttons =====
// Copies an email address, or Kroger's NE251 number, with one click.
async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Older browsers: copy from a hidden text box instead
        const box = document.createElement("textarea");
        box.value = text;
        box.setAttribute("readonly", "");
        box.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
        document.body.append(box);
        box.select();
        let copied = false;
        try {
            copied = document.execCommand("copy");
        } catch {
            copied = false;
        }
        box.remove();
        return copied;
    }
}

document.querySelectorAll(".copy-btn").forEach((button) => {
    const label = button.querySelector(".copy-text");
    let resetTimer;

    button.addEventListener("click", async () => {
        const value = button.dataset.copy;
        const copied = await copyText(value);
        button.focus();   // keeps keyboard users in the same spot

        if (copied) {
            button.classList.add("copied");
            label.textContent = "Copied";
            showToast(`Copied ${value}`);
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
                button.classList.remove("copied");
                label.textContent = "Copy";
            }, 2000);
        } else {
            showToast("Sorry, that didn't copy. You can select the text and copy it instead.");
        }
    });
});

// ===== "Open now" notes =====
// Works out whether the library is open right now, using the time in
// The Colony (Central time), wherever the visitor happens to be.
function libraryTimeNow() {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
    }).formatToParts(new Date());
    const part = (type) => parts.find((p) => p.type === type).value;
    return {
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(part("weekday")),
        hour: Number(part("hour")) + Number(part("minute")) / 60,
    };
}

function formatHour(hour) {
    if (hour === 12) return "noon";
    return hour < 12 ? `${hour} a.m.` : `${hour - 12} p.m.`;
}

function libraryStatus() {
    const { day, hour } = libraryTimeNow();
    const today = LIBRARY_HOURS[day];

    if (today && hour >= today[0] && hour < today[1]) {
        return { open: true, text: `open now until ${formatHour(today[1])}` };
    }
    if (today && hour < today[0]) {
        return { open: false, text: `closed now. Opens today at ${formatHour(today[0])}` };
    }
    // Find the next day the library opens
    for (let i = 1; i <= 7; i++) {
        const next = (day + i) % 7;
        if (LIBRARY_HOURS[next]) {
            const when = i === 1 ? "tomorrow" : DAY_NAMES[next];
            return { open: false, text: `closed now. Opens ${when} at ${formatHour(LIBRARY_HOURS[next][0])}` };
        }
    }
    return null;
}

const statusNotes = document.querySelectorAll("[data-open-status]");
const hoursRows = document.querySelectorAll(".hours-row");

if (statusNotes.length || hoursRows.length) {
    const status = libraryStatus();

    statusNotes.forEach((note) => {
        if (!status) return;
        // A note can start with words of its own, like "The library is"
        const start = note.dataset.openStatus;
        let text = start ? `${start} ${status.text}` : status.text;
        if (!text.endsWith(".")) text += ".";   // "8 p.m." already ends with one
        note.textContent = text.charAt(0).toUpperCase() + text.slice(1);
        note.classList.add(status.open ? "is-open" : "is-closed");
    });

    // Highlight today's row in the hours list (Contact page)
    const today = String(libraryTimeNow().day);
    hoursRows.forEach((row) => {
        if (row.dataset.days.split(" ").includes(today)) {
            row.classList.add("today");
            const badge = document.createElement("span");
            badge.className = "today-badge";
            badge.textContent = "Today";
            row.querySelector("dt").append(" ", badge);
        }
    });
}

// ===== Membership tabs (Join page) =====
// Switches between the Individual and Business levels. Without JavaScript,
// both lists simply show one after the other.
document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const list = tabs.querySelector(".tab-list");
    const buttons = [...list.querySelectorAll(".tab")];
    const panels = buttons.map((button) => document.getElementById(button.dataset.panel));

    // Label everything for screen readers
    list.setAttribute("role", "tablist");
    buttons.forEach((button, i) => {
        button.setAttribute("role", "tab");
        button.setAttribute("aria-controls", panels[i].id);
        panels[i].setAttribute("role", "tabpanel");
        panels[i].setAttribute("aria-labelledby", button.id);
        panels[i].tabIndex = 0;
    });
    tabs.classList.add("tabs-ready");

    function select(index, moveFocus) {
        buttons.forEach((button, i) => {
            const selected = i === index;
            button.setAttribute("aria-selected", selected);
            button.tabIndex = selected ? 0 : -1;   // only the chosen tab is in the Tab order
            panels[i].hidden = !selected;
        });
        if (moveFocus) buttons[index].focus();
    }

    buttons.forEach((button, i) => {
        button.addEventListener("click", () => {
            tabs.classList.add("tabs-switched");   // lets the new list fade in
            select(i, false);
        });

        // Arrow keys move between tabs, Home and End jump to the first and last
        button.addEventListener("keydown", (event) => {
            const keys = {
                ArrowRight: (i + 1) % buttons.length,
                ArrowLeft: (i - 1 + buttons.length) % buttons.length,
                Home: 0,
                End: buttons.length - 1,
            };
            if (event.key in keys) {
                event.preventDefault();
                tabs.classList.add("tabs-switched");
                select(keys[event.key], true);
            }
        });
    });

    // A link to join.html#business opens the Business tab and scrolls to it
    // (style.css leaves room above it, so the tabs stay in view)
    function selectFromAddress() {
        const index = panels.findIndex((panel) => `#${panel.id}` === location.hash);
        if (index === -1) return false;
        select(index, false);
        panels[index].scrollIntoView();
        return true;
    }

    if (!selectFromAddress()) select(0, false);
    window.addEventListener("hashchange", selectFromAddress);
});

// ===== Videos (Gallery page) =====
// Each video shows a preview picture first. The YouTube player loads only
// when you press play, which keeps the page fast and private.
document.querySelectorAll(".video-play").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const player = document.createElement("iframe");
        player.src = `https://www.youtube-nocookie.com/embed/${link.dataset.video}?autoplay=1&rel=0`;
        player.title = link.dataset.title;
        player.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
        player.allowFullscreen = true;
        link.replaceWith(player);
        player.focus();
    });
});

// ===== Larger photo view (Gallery page) =====
// Clicking a photo opens it big in a pop-up. Use the arrows, the left and
// right arrow keys, or swipe on a phone to move between photos. Without
// JavaScript, each link still works and simply opens the photo on its own.
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

        bigImage.classList.add("is-changing");
        bigImage.src = link.href;
        bigImage.alt = link.querySelector("img").alt;
        captionText.textContent = link.dataset.caption;
        counter.textContent = `${current + 1} of ${photos.length}`;

        const done = () => bigImage.classList.remove("is-changing");
        if (bigImage.decode) {
            bigImage.decode().then(done, done);
        } else {
            done();
        }

        // Start loading the photos on either side, so the next one appears quickly
        [current + 1, current - 1].forEach((i) => {
            new Image().src = photos[(i + photos.length) % photos.length].href;
        });
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

    // Swipe left or right on touch screens
    let touchStartX = null;
    lightbox.addEventListener("touchstart", (event) => {
        touchStartX = event.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", (event) => {
        if (touchStartX === null) return;
        const distance = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(distance) > 50) show(current + (distance < 0 ? 1 : -1));
        touchStartX = null;
    });

    // Clicking the dark area around the photo closes it
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            lightbox.close();
        }
    });
}

// ===== Little moments as things scroll into view =====
// On the About page the "How your support helps" line draws itself in,
// and in the footer the sailboat rocks on the waves. Skipped for anyone
// who has asked their device to reduce motion.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reduceMotion) {
    const watcher = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                watcher.unobserve(entry.target);
            }
        });
    }, { threshold: 0.35 });

    document.querySelectorAll(".flow, .lake-scene").forEach((item) => {
        item.classList.add("will-reveal");
        watcher.observe(item);
    });
}

// ===== Back-to-top button =====
// Shows up once you've scrolled down more than a screen and a half.
const backToTop = document.querySelector(".back-to-top");

if (backToTop) {
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            backToTop.classList.toggle("show", window.scrollY > window.innerHeight * 1.5);
            ticking = false;
        });
    }, { passive: true });
}
