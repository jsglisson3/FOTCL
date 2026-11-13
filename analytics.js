/* ==========================================================================
   Google Analytics 4
   --------------------------------------------------------------------------
   Turn it on: paste the site's GA4 Measurement ID below (it starts with "G-").
   Turn it off: make it "" again. Nothing loads from Google while it's empty.

   It also stays off:
   - when a page is opened straight from the computer (file://), so local
     testing and `npm run check` never count as visits
   - for visitors whose browser sends Global Privacy Control

   Google signals and ad personalization are switched off, to match what the
   Privacy page says.

   Events it sends (the portal's numbers card reads the first two):
   - phone_call_click: someone taps a phone number
   - generate_lead: someone taps through to Donorbox to join, renew or give
   - email_click: someone taps an email address
   ========================================================================== */

(function () {
    var GA_MEASUREMENT_ID = ""; // for example "G-AB12CD34EF"

    if (!/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)) return;
    if (location.protocol === "file:") return;
    if (navigator.globalPrivacyControl === true) return;

    var tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(tag);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false
    });

    // One listener for the whole page, so links added later by script.js count too
    document.addEventListener("click", function (event) {
        var link = event.target.closest ? event.target.closest("a[href]") : null;
        if (!link) return;

        var href = link.getAttribute("href");
        var details = {
            link_url: link.href,
            link_text: (link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100)
        };

        if (/^tel:/i.test(href)) {
            gtag("event", "phone_call_click", details);
        } else if (/^mailto:/i.test(href)) {
            gtag("event", "email_click", details);
        } else if (/^https:\/\/donorbox\.org\//i.test(link.href)) {
            gtag("event", "generate_lead", details);
        }
    });
})();
