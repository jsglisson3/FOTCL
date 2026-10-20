// =========================================================
// Site checks: GitHub runs these every time you push a change
// (see .github/workflows/checks.yml). You can also run them on your
// own computer with:  npm install   then   npm run check
//
// What it checks on every page:
//   1. Every link and #jump inside the site goes somewhere real,
//      and every logo listed in sponsors.js exists
//   2. No JavaScript errors while the page loads
//   3. Nothing makes the page scroll sideways on a phone
//   4. The axe accessibility checker finds no problems
//      (WCAG 2.2 level A and AA, plus best practices), on a
//      laptop-sized screen and on a phone-sized screen
// If anything fails, GitHub marks the commit with a red X and emails you.
// =========================================================

import { chromium } from "playwright";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

const SITE = resolve(import.meta.dirname, "..");
const pages = readdirSync(SITE).filter((name) => name.endsWith(".html")).sort();
const axeSource = readFileSync(join(SITE, "node_modules", "axe-core", "axe.min.js"), "utf8");
const problems = [];

// ----- 1. Links and #jumps inside the site -----
const idsByPage = {};
for (const page of pages) {
    const html = readFileSync(join(SITE, page), "utf8");
    idsByPage[page] = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
}

for (const page of pages) {
    const html = readFileSync(join(SITE, page), "utf8");
    const targets = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
    for (const target of targets) {
        if (/^(https?:|mailto:|tel:|data:)/.test(target)) continue; // outside the site
        const [path, jump] = target.split("#");
        const file = path ? decodeURIComponent(path) : page;
        if (path && !existsSync(join(SITE, file))) {
            problems.push(`${page}: links to "${target}", but that file doesn't exist`);
            continue;
        }
        if (jump && file.endsWith(".html") && !idsByPage[file]?.has(jump)) {
            problems.push(`${page}: links to "${target}", but ${file} has nothing with id="${jump}"`);
        }
    }
}

// ----- The Business Friends list (sponsors.js) -----
const sponsorsFile = join(SITE, "sponsors.js");
if (existsSync(sponsorsFile)) {
    // A missing comma, quote or bracket stops the whole list from working
    try {
        new vm.Script(readFileSync(sponsorsFile, "utf8"), { filename: "sponsors.js" });
    } catch (error) {
        const line = error.stack.match(/sponsors\.js:(\d+)/)?.[1];
        problems.push(`sponsors.js: there's a typo${line ? ` on or just before line ${line}` : ""} (${error.message}). Look for a missing comma, quote or bracket.`);
    }

    // Skip the instructions at the top (lines starting with //)
    const sponsors = readFileSync(sponsorsFile, "utf8").replace(/^\s*\/\/.*$/gm, "");
    for (const [, logo] of sponsors.matchAll(/logo:\s*"([^"]*)"/g)) {
        if (!existsSync(join(SITE, logo))) problems.push(`sponsors.js: the logo "${logo}" doesn't exist`);
    }
    for (const [, website] of sponsors.matchAll(/website:\s*"([^"]*)"/g)) {
        if (website && !website.startsWith("https://")) problems.push(`sponsors.js: the website "${website}" should start with https://`);
    }
}

// ----- 2 to 4. Load each page in a real browser -----
const browser = await chromium.launch();

for (const [label, viewport] of [["laptop", { width: 1280, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
    for (const page of pages) {
        // Animations off, so every check sees each page in its finished state
        const tab = await browser.newPage({ viewport, reducedMotion: "reduce" });
        tab.on("pageerror", (error) => problems.push(`${page} (${label}): JavaScript error: ${error.message}`));

        // Photos and videos from other websites aren't needed for these checks
        await tab.route(/^https?:/, (route) => route.abort());

        await tab.goto(pathToFileURL(join(SITE, page)).href);
        await tab.waitForTimeout(500);

        const sideways = await tab.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (sideways > 0) problems.push(`${page} (${label}): the page scrolls sideways by ${sideways}px`);

        await tab.addScriptTag({ content: axeSource });
        const result = await tab.evaluate(() => axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa", "best-practice"] },
        }));
        for (const issue of result.violations) {
            const where = issue.nodes.slice(0, 3).map((node) => node.target.join(" ")).join(", ");
            problems.push(`${page} (${label}): ${issue.help} [${issue.id}] at ${where}`);
        }

        await tab.close();
    }
}

await browser.close();

// ----- Report -----
const unique = [...new Set(problems)];
if (unique.length) {
    console.log(`\n✗ Found ${unique.length} problem(s):\n`);
    unique.forEach((problem) => console.log("  - " + problem));
    process.exit(1);
}
console.log(`\n✓ All ${pages.length} pages passed: links, JavaScript, phone layout and accessibility.`);
