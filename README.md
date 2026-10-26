# Alexis Albentosa Floristry

Mobile-first website for Alexis Albentosa Floristry — weddings & events, North Yorkshire.

Plain HTML, CSS and JavaScript. No build step, so it can be hosted as-is (e.g. GitHub Pages).

## Pages

| File | Page |
| --- | --- |
| `index.html` | Welcome — hero, what I do, portfolio preview, where I'm based (map), reviews |
| `about.html` | About — story, background timeline, brand values, what I can create, how it works |
| `portfolio.html` | Portfolio — filterable gallery, in the details, collaborations, reviews |
| `enquire.html` | Enquiries — form that opens a pre-filled email (three steps on phones, one page on desktop) |

Each page has a phone layout and a desktop layout; the desktop one takes over at 1024px wide. Elements marked `m-only` / `d-only` appear in only one of them.

- `assets/css/styles.css` — all page styles (colour tokens at the top)
- `assets/css/motion.css` + `assets/js/motion.js` — scroll reveals, photos that bloom open, self-drawing botanicals, parallax and the moving text band. Visitors who prefer reduced motion see everything without movement.
- `assets/js/main.js` — menu drawer, swipe carousels, background tabs, portfolio gallery and enquiry forms

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Filling in content

Text in `[SQUARE BRACKETS]` is a placeholder to replace with real copy.

- **Photos** — live in `assets/img/photos/`. Each `.photo` shape holds one `<img>` that fills it.
- **Portfolio gallery** — the photo list is the JSON block (`#gallery-data`) at the bottom of `portfolio.html`. Add an entry with `src`, `alt` and `cat` (`"Weddings"`, `"Events"` or `"Commercial"`); the filters and both layouts update themselves.
- **Reviews** — replace the `[Client name]` / `[Paste a real client review here.]` placeholders on the home and portfolio pages.
- **Enquiry email** — set `data-email` on both forms in `enquire.html`.
- **Colours** — tokens are at the top of `styles.css`.
