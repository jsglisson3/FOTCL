# Website roadmap

Everything left to improve, grouped into chunks we can finish one at a time.
Check items off (`[x]`) as they're done.

## Done so far

- [x] Full redesign of every page, with the lake theme for The Colony
- [x] Accessibility checks (WCAG 2.2 automated tests, keyboard, zoom, text spacing) all passing
- [x] HTML validation: 0 errors. Lighthouse: accessibility 100 on every page
- [x] Phone, tablet and desktop layouts checked from 320 to 1440 pixels wide
- [x] Contact page: address and hours side by side on tablets
- [x] 404 page sends old fotcpl.org addresses to the new pages (works once the site is live)
- [x] Home-screen icon for phones and a backup tab icon for older browsers
- [x] Photos come in several sizes, so phones and laptops download only what they need (gallery photos are less than half the size on a laptop)
- [x] Photo captions show on touchscreens, not only on mouse hover
- [x] "Already a Friend? Renew online" link in the join banner
- [x] Join page: compare the membership levels side by side
- [x] Branded preview image for when the site is shared on Facebook or in a text (works once the site is live)
- [x] Accessibility page, linked from every footer

## Chunk A: Quick checks for Jeremy (no code)

- [ ] Click a few newsletter links (Google Drive) and make sure they open
- [ ] Try one test membership on Donorbox, or ask the treasurer to
- [ ] Show the draft to your friend at the library and collect feedback
- [ ] Have someone try the site with a screen reader (NVDA on Windows is free)

## Chunk B: Before showing the board

- [ ] Confirm the facts with the Friends: prices, emails, bylaws date, Privacy and Accessibility page wording
- [ ] Ask if the board wants a "Meet the Board" section (only with each person's permission)
- [ ] Ask if they want a one-time donation option beside memberships (Donorbox can do both)
- [ ] Check if Donorbox can open with the chosen level already filled in, so each "Join as a ..." link skips a step
- [ ] Ask whether there's a newer newsletter than Fall/Summer 2025

## Chunk C: Content from the Friends (biggest boost to trust)

- [ ] Real impact numbers ("your membership helped buy ...", books donated, money raised)
- [ ] The annual event: its name and when it happens (Supporter and Patron levels include tickets)
- [ ] The book sale: when and where (members get 10% off)
- [ ] Real quotes from members, only with their permission
- [ ] Volunteer opportunities: what people can actually help with
- [ ] A printable membership form for people who join by check (the board decides what it asks for)

## Chunk D: Launch prep (after the board approves)

- [ ] Move the photos, partner logos and bylaws PDF off GoDaddy into `images/` and `files/`
- [ ] Then: add width and height to each photo, and make smaller versions for phones
- [ ] Ask the logo's designer for an SVG version (sharper and smaller than the PNG)
- [ ] Remove the draft banner and the "noindex" tag from every page
- [ ] Remove the `preconnect` line for img1.wsimg.com once photos are local
- [ ] Connect fotcpl.org in GitHub Pages, then add it to Google Search Console with the sitemap
- [ ] Test the old-address redirects on the live site (the list is in `404.html`)
- [ ] On fotcpl.org, switch `404.html` to addresses starting with `/` (like `/style.css`), so the page keeps its styling for any mistyped address
- [ ] Share a page on Facebook and check the preview image appears

## Chunk E: Learning projects

- [ ] Automatic checks on GitHub: re-run the HTML and accessibility tests on every commit
- [ ] Library events that load onto the home page automatically and refresh every day
- [ ] A flyer or poster with a QR code for the library's front desk, linking to the Join page

## Chunk F: Nice-to-haves later

- [ ] A contact form (needs a free form service account, chosen by the board)
- [ ] An email newsletter sign-up (for example Mailchimp, if the Friends use one)
- [ ] Privacy-friendly visitor counts (only if the board wants them; update the Privacy page too)
- [ ] A Terms page, if the board wants to keep the one from the old site
- [ ] Spanish version of the key pages
