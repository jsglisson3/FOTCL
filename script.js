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

// ===== Header lift =====   (taste-skill-ignore: the sticky header is a real overlay)
// Adds a soft shadow once you scroll down, so the header lifts off the page.   taste-skill-ignore
// An invisible marker sits at the very top of the page; when it scrolls out
// of view, the shadow turns on. (Only that changes, never the header's   taste-skill-ignore
// size, so the page never jumps.)
const topMarker = document.createElement("div");
topMarker.setAttribute("aria-hidden", "true");
topMarker.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;";   // taste-skill-ignore: invisible marker, not a line
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

// ===== Membership picker (home and Join pages) =====
// Choose a level and how often to pay, and the price and what's included
// update right away. The button always goes to the same Donorbox form.
// Without JavaScript, a plain list of every level shows instead.
//
// IF THE PRICES CHANGE: update them here, in the "picker-all" lists on
// index.html and join.html, and in the compare tables on join.html.
// monthly: null means that level can only be paid yearly.
const MEMBERSHIP = {
    individual: [
        { name: "Friend", yearly: "15", monthly: null, extra: "All the member benefits. Monthly payments start at the Supporter level." },
        { name: "Supporter", yearly: "100", monthly: "10", extra: "All the member benefits, plus 2 tickets to our annual event." },
        { name: "Patron", yearly: "200", monthly: "20", extra: "All the member benefits, plus your name in the quarterly newsletter and 4 annual event tickets." },
    ],
    business: [
        { name: "Friend", yearly: "50", monthly: null, extra: "All the member benefits. Monthly payments start at the Supporter level." },
        { name: "Supporter", yearly: "500", monthly: "45", extra: "All the member benefits, plus your name in the quarterly newsletter and 2 annual event tickets." },
        { name: "Patron", yearly: "1,000", monthly: "85", extra: "All the member benefits, plus newsletter name placement, a sponsorship table, logo placement and 4 annual event tickets." },
        { name: "Partner", yearly: "2,000", monthly: "200", extra: "All the member benefits, plus newsletter name placement, a sponsorship table, logo placement and 8 annual event tickets." },
    ],
};

document.querySelectorAll("[data-picker]").forEach((picker) => {
    const track = picker.dataset.picker;   // "individual" or "business"
    const levels = MEMBERSHIP[track];
    const monthlyInput = picker.querySelector(`input[name="${track}-pay"][value="month"]`);
    const yearlyInput = picker.querySelector(`input[name="${track}-pay"][value="year"]`);
    const amount = picker.querySelector(".picker-amount");
    const per = picker.querySelector(".picker-per");
    const extra = picker.querySelector(".picker-extra");
    const join = picker.querySelector(".picker-join");
    if (!levels || !amount) return;

    function update() {
        const level = levels[Number(picker.querySelector(`input[name="${track}-level"]:checked`).value)];

        // Friend can only be paid yearly, so Monthly switches off for it
        monthlyInput.disabled = !level.monthly;
        if (!level.monthly && monthlyInput.checked) yearlyInput.checked = true;

        const monthly = monthlyInput.checked;
        amount.textContent = `$${monthly ? level.monthly : level.yearly}`;
        per.textContent = monthly ? "a month" : "a year";
        extra.textContent = level.extra;
        join.textContent = `Join as a ${track === "business" ? "Business " : ""}${level.name}`;
    }

    picker.addEventListener("change", update);
    update();
});

// ===== Videos (Gallery page) =====
// Each video shows a preview picture first. The YouTube player loads only
// when you press play, which keeps the page fast and private.
// If YouTube's preview picture can't load (some school and office networks
// block YouTube), it's removed, leaving the blue box and play button.
document.querySelectorAll(".video-play").forEach((link) => {
    const preview = link.querySelector("img");
    if (preview) {
        const dropIfBroken = () => preview.remove();
        preview.addEventListener("error", dropIfBroken);
        if (preview.complete && preview.naturalWidth === 0 && preview.currentSrc) dropIfBroken();
    }

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
// In the footer the sailboat rocks on the waves. Skipped for anyone
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

    document.querySelectorAll(".lake-scene").forEach((item) => {
        item.classList.add("will-reveal");
        watcher.observe(item);
    });
}

// ===== Things rise into place as they scroll into view =====
// Headings, photos and list items fade up one after another (page titles
// stay put, so they can be read straight away). Nothing is
// hidden unless JavaScript is running, and none of it happens for anyone
// who has asked their device to reduce motion.
const RISE = [
    "main h2:not(.visually-hidden)", "main .lead", ".section-head p", ".rows-head p",
    "main .button-row", ".page-header-note", ".page-photos img", ".margin-row", ".prints",
    ".prints-note", ".plan-name", ".plan-for", ".picker", ".help-photo", ".help-list li",
    ".tile", ".includes-list li", ".flow-step", ".faq details", ".compare", ".events-strip-inner > *",
    ".photo-grid .photo", ".video-grid .video", ".email-card", ".help-links li", ".prose > *",
    ".partner-logos li", ".not-found-photos img",
].join(", ");

if ("IntersectionObserver" in window && !reduceMotion) {
    const riser = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("risen");
                riser.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(RISE).forEach((item) => {
        // Neighbours that rise together go one after another, 80ms apart
        const neighbours = [...item.parentElement.children].filter((child) => child.matches(RISE));
        const place = Math.min(neighbours.indexOf(item), 5);
        item.style.setProperty("--rise-delay", `${place * 80}ms`);
        item.classList.add("rise");
        riser.observe(item);
    });
}

// ===== Business Friends (home, About and Join pages) =====
// Builds the business logos from the list in sponsors.js.
//  - Every visit shows a new random order, with Partners and Patrons first.
//  - About page: every business, each linking to its website, plus an
//    open "Your Business Here" spot.
//  - Home page: one row that starts scrolling slowly once there are more
//    logos than fit, with a Pause button. It stays still for anyone who has
//    asked their device to reduce motion, and while someone tabs through
//    the logos with the keyboard.
//  - Join page: a small "Join these local Business Friends" list.
// Without JavaScript these sections stay hidden (see style.css).
const LEVELS = ["Partner", "Patron", "Supporter", "Friend"];
const FEATURED_LEVELS = ["Partner", "Patron"];   // the levels that include logo placement
const SCROLL_SPEED = 30;    // pixels per second
const MIN_TO_SCROLL = 5;    // with fewer logos than this, the row never scrolls

function svgIcon(shapes) {
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${shapes}</svg>`;
}

// "patron" and "Patron" both work; anything else counts as no level
function businessLevel(friend) {
    const level = String(friend.level || "").trim().toLowerCase();
    return LEVELS.find((name) => name.toLowerCase() === level) || "";
}

function businessFriendsInOrder() {
    const friends = typeof BUSINESS_FRIENDS === "undefined" ? [] : [...BUSINESS_FRIENDS];
    // Shuffle so every order is equally likely
    for (let i = friends.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [friends[i], friends[j]] = [friends[j], friends[i]];
    }
    // Then higher levels first. Sorting keeps the shuffled order within each level.
    const rank = (friend) => {
        const index = LEVELS.indexOf(businessLevel(friend));
        return index === -1 ? LEVELS.length : index;
    };
    return friends.sort((a, b) => rank(a) - rank(b));
}

function businessCard(friend, withLink) {
    const item = document.createElement("li");
    item.className = "biz";
    const level = businessLevel(friend);
    const featured = FEATURED_LEVELS.includes(level);
    if (featured) item.classList.add("biz-featured");

    const card = document.createElement(withLink && friend.website ? "a" : "div");
    card.className = "biz-card";
    if (card.tagName === "A") {
        card.href = friend.website;
        card.rel = "sponsored";   // tells search engines this is a sponsor's link
    }

    const logoBox = document.createElement("span");
    logoBox.className = "biz-logo";
    const logo = document.createElement("img");
    logo.src = friend.logo;
    logo.alt = "";   // the business name is written out right below
    logo.loading = "lazy";
    logo.decoding = "async";
    logo.addEventListener("error", () => logoBox.remove());   // a missing logo leaves just the name
    logoBox.append(logo);

    const name = document.createElement("span");
    name.className = "biz-name";
    name.textContent = friend.name;
    card.append(logoBox, name);

    if (featured) {
        const badge = document.createElement("span");
        badge.className = "biz-badge";
        badge.textContent = `${level} level`;
        card.append(badge);
    }

    item.append(card);
    return item;
}

// About page: every business, then an open spot for the next one
function buildBusinessWall(spot, friends) {
    const list = document.createElement("ul");
    list.className = "biz-wall";
    friends.forEach((friend) => list.append(businessCard(friend, true)));

    const invite = document.createElement("li");
    invite.className = "biz biz-invite";
    invite.innerHTML = `<a class="biz-card" href="join.html#business">
        <span class="biz-plus">${svgIcon('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>')}</span>
        <span class="biz-name">Your Business Here</span>
        <span class="biz-invite-text">Become a Business Friend</span>
    </a>`;
    list.append(invite);
    spot.append(list);
}

// Join page: names and logos, without links, so businesses stay on the page
function buildBusinessProof(spot, friends) {
    const list = document.createElement("ul");
    list.className = "biz-proof";
    friends.forEach((friend) => list.append(businessCard(friend, false)));
    spot.append(list);
}

// Home page: one row that scrolls once it's too long to fit
function buildBusinessStrip(spot, friends) {
    const viewport = document.createElement("div");
    viewport.className = "biz-marquee";
    const track = document.createElement("div");
    track.className = "biz-track";
    const list = document.createElement("ul");
    list.className = "biz-row";
    friends.forEach((friend) => list.append(businessCard(friend, true)));
    track.append(list);
    viewport.append(track);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "biz-toggle";
    toggle.hidden = true;
    spot.append(viewport, toggle);

    let copy = null;              // a second copy of the logos lets the loop run on without a gap
    let paused = false;           // the visitor pressed Pause
    let keyboardInside = false;   // someone is tabbing through the logos

    function paintToggle() {
        toggle.innerHTML = paused
            ? `${svgIcon('<polygon points="7 4 19 12 7 20 7 4"/>')} Play<span class="visually-hidden"> the scrolling logos</span>`
            : `${svgIcon('<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>')} Pause<span class="visually-hidden"> the scrolling logos</span>`;
    }

    function update() {
        const items = [...list.children];
        const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
        const rowWidth = items.reduce((sum, item) => sum + item.getBoundingClientRect().width, 0) + gap * (items.length - 1);
        const canScroll = !reduceMotion && items.length >= MIN_TO_SCROLL && rowWidth > viewport.clientWidth;
        const scrolling = canScroll && !keyboardInside;

        toggle.hidden = !canScroll;
        viewport.classList.toggle("is-scrolling", scrolling);
        viewport.classList.toggle("is-paused", scrolling && paused);

        if (scrolling && !copy) {
            copy = list.cloneNode(true);
            copy.setAttribute("aria-hidden", "true");   // screen readers hear the list once
            copy.inert = true;                          // and the Tab key skips it
            copy.querySelectorAll("a").forEach((link) => {
                link.tabIndex = -1;
            });
            track.append(copy);
        } else if (!scrolling && copy) {
            copy.remove();
            copy = null;
        }

        // The same gentle speed, however many logos there are
        const seconds = Math.max(12, Math.round((rowWidth + gap) / SCROLL_SPEED));
        track.style.setProperty("--biz-duration", `${seconds}s`);
    }

    toggle.addEventListener("click", () => {
        paused = !paused;
        paintToggle();
        update();
    });

    // Tabbing to a logo stops the row and lays every logo out, so the
    // highlighted one never slides out of view. (A mouse click doesn't.)
    list.addEventListener("focusin", (event) => {
        if (!event.target.matches(":focus-visible")) return;
        keyboardInside = true;
        update();
        event.target.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    list.addEventListener("focusout", (event) => {
        if (!list.contains(event.relatedTarget)) {
            keyboardInside = false;
            update();
        }
    });

    paintToggle();
    update();

    // Check again whenever the row's width changes (turning a phone, resizing a window)
    let lastWidth = Math.round(viewport.getBoundingClientRect().width);
    new ResizeObserver(([entry]) => {
        const width = Math.round(entry.contentRect.width);
        if (width !== lastWidth) {
            lastWidth = width;
            update();
        }
    }).observe(viewport);
}

document.addEventListener("DOMContentLoaded", () => {
    const spots = document.querySelectorAll("[data-business-friends]");
    const friends = spots.length ? businessFriendsInOrder() : [];
    const builders = { wall: buildBusinessWall, strip: buildBusinessStrip, proof: buildBusinessProof };
    if (!friends.length) return;
    spots.forEach((spot) => builders[spot.dataset.businessFriends]?.(spot, friends));
});

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
