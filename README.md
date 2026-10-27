# Friends of The Colony Public Library website

A volunteer-built redesign of fotcpl.org. Plain HTML, CSS and a little JavaScript, hosted free on GitHub Pages.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Home page |
| `about.html`, `join.html`, `newsletters.html`, `gallery.html`, `contact.html`, `privacy.html`, `accessibility.html` | The other pages |
| `404.html` | "Page not found" page. It also sends old fotcpl.org addresses to the new pages |
| `styleguide.html` | Colors, type, buttons and writing rules for anyone editing the site. Not in the menu, and hidden from search engines |
| `style.css` | All the styling. Brand colors are at the top in `:root`, followed by a table of contents |
| `script.js` | Phone menu, header shadow, gallery viewer, video players, copy buttons, the membership picker, the library's "Open now" notes, the Business Friends logos and the gentle scroll motion |
| `sponsors.js` | The list of Business Friends. The home, About and Join pages all show their logos from this one list |
| `images/` | Logo, smiling book drawing, tab and home-screen icons, and the share image |
| `images/photo-originals/` | The full-size photos (the gallery viewer shows these) |
| `images/photos/` | Smaller copies of each photo, 400, 800 and 1200 pixels wide, so phones download only what they need |
| `images/partners/` | Partner and business logos |
| `files/` | The bylaws PDF |
| `fonts/` | Public Sans (text) and Literata (headings), hosted with the site. Both are free under the SIL Open Font License (license files included) |
| `sitemap.xml`, `robots.txt` | Help search engines find the pages once the site is live |
| `ROADMAP.md` | Everything left to improve, in chunks |
| `.github/workflows/checks.yml`, `tools/check-site.mjs` | The automatic checks (see below) |
| `package.json`, `package-lock.json`, `.htmlvalidate.json` | The checking tools and their settings |
| `tools/get-photos.ps1` | One-time script that copied the photos, logos and bylaws from the old GoDaddy site. Already run; kept as a record of where they came from |
| `.nojekyll` | Tells GitHub Pages to publish the files exactly as they are |
| `.gitignore` | Keeps the `node_modules` tools folder off GitHub |

## Automatic checks

Every time you Commit and Sync, GitHub tests every page: links, HTML errors, JavaScript errors, sideways scrolling on phones, and accessibility (WCAG 2.2 AA). It also checks `sponsors.js` for typos and missing logos, and says which line to fix.

- **See the results** on the repository's **Actions** tab. A green check means everything passed. A red X means something needs fixing; click it to see what. GitHub also emails you when a check fails.
- **Run them yourself (optional):** install Node.js, then in the VS Code terminal run `npm install` once, and `npm run check` whenever you like.

## Keeping it up to date

- **Library hours** are in two places: the hours list on `contact.html` and `LIBRARY_HOURS` at the top of `script.js` (which powers the "Open now" notes). Change both.
- **A new newsletter:** add it at the top of the list on `newsletters.html` and update the "Current Edition" card there. On the home page, update the edition name and the "Read the Latest Edition" link.
- **A new Business Friend:** open `sponsors.js` and follow the three steps at the top. Add a business's `level` (like `"Patron"`) and Partners and Patrons get bigger spots up front. The logos show in a new random order on every visit, and the home page row starts scrolling by itself once there are more logos than fit on one line.
- **A new photo:** save it about 1600 pixels wide in `images/photo-originals/`, then save 400, 800 and 1200-pixel-wide copies in `images/photos/`, named like the others (the free Squoosh.app can resize them). Give it a short description in its `alt` text.
- **Membership prices:** they appear in four places. Update all of them: the `MEMBERSHIP` list near the top of the picker section in `script.js`, the plain "picker-all" lists on `index.html` and `join.html` (shown when JavaScript is off), and the compare tables on `join.html`.
- **The menu and footer** are repeated on every page. To change them everywhere at once, use VS Code's Replace in Files (Ctrl+Shift+H).
- **Colors, type and writing rules** are on `styleguide.html`.

## Launch checklist (only after the board approves)

1. **Remove the draft banner.** Delete the `<aside class="draft-banner">` block from every page.
2. **Let search engines in.** Delete `<meta name="robots" content="noindex, nofollow">` from every page except `styleguide.html`, which stays hidden.
3. **Confirm the details.** Prices, emails, the phone number, and the Privacy and Accessibility page wording.
4. **Connect the domain.** In GitHub: Settings → Pages → Custom domain → `fotcpl.org`. Then whoever manages the domain points its DNS to GitHub Pages (GitHub's instructions walk through it).
5. **Tell Google.** Add the site in Google Search Console and submit `https://fotcpl.org/sitemap.xml`.
6. **Test the old links.** `404.html` already sends old addresses like `/what-we-do` and `/become-a-friend-%2F-renew` to the new pages. Try a few once the site is live. Then change the links in `404.html` to start with `/` (like `/style.css`), so the page keeps its look at any address.
7. **Cancel the GoDaddy website plan last,** once the new site works at fotcpl.org. Nothing on the new site loads from GoDaddy anymore. If the domain name or the fotcpl.org email addresses are also with GoDaddy, keep those; only the website plan goes.

## Checked so far

- Accessibility: the axe-core checker (WCAG 2.2 A and AA plus best practices) passes on every page at laptop and phone sizes. Keyboard navigation, zoom and text spacing tested.
- Lighthouse (phone, Oct 27, 2026 redesign): accessibility 100 and best practices 100 on Home, Join and About; speed 88 to 93 on Home (it varies run to run), 96 on Join and 98 on About. (The search score stays low on purpose until launch, because of the noindex tag.)
- Motion: things fade up gently as you scroll, and the home photo opens with a rolling blind. All of it switches off for anyone whose device asks for reduced motion.
- Works at phone, tablet and desktop widths (tested from 320 to 1440 pixels).
- All internal links, page anchors and images checked, now automatically on every push.
