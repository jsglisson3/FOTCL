# Friends of The Colony Public Library website

A volunteer-built redesign of fotcpl.org. Plain HTML, CSS and a little JavaScript, hosted free on GitHub Pages.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Home page |
| `about.html`, `join.html`, `newsletters.html`, `gallery.html`, `contact.html`, `privacy.html` | The other pages |
| `404.html` | "Page not found" page |
| `style.css` | All the styling. Brand colors are at the top in `:root` |
| `script.js` | Phone menu, header shadow, gallery viewer |
| `images/` | Logo, smiling book drawing, tab icon |
| `sitemap.xml`, `robots.txt` | Help search engines find the pages once the site is live |

## Launch checklist (only after the board approves)

1. **Remove the draft banner.** Delete the `<aside class="draft-banner">` block from every page.
2. **Let search engines in.** Delete `<meta name="robots" content="noindex, nofollow">` from every page.
3. **Move hosted files into the site.** The photos, partner logos and bylaws PDF still load from the old GoDaddy site. Download them into `images/` (and a `files/` folder for the PDF) and update the links, so nothing breaks when GoDaddy is canceled.
4. **Confirm the details.** Prices, emails, the phone number and the Privacy page wording.
5. **Connect the domain.** In GitHub: Settings → Pages → Custom domain → `fotcpl.org`. Then whoever manages the domain points its DNS to GitHub Pages (GitHub's instructions walk through it).
6. **Tell Google.** Add the site in Google Search Console and submit `https://fotcpl.org/sitemap.xml`.
7. **Redirect old links.** The old site used addresses like `/what-we-do` and `/become-a-friend-%2F-renew`. Add small redirect pages so old bookmarks still work.

## Checked so far

- Accessibility: automated axe-core check (WCAG 2.1 A and AA plus best practices) passes on every page at desktop and phone sizes; keyboard navigation tested.
- Works at phone, tablet and desktop widths.
